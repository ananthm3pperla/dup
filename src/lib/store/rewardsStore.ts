import { create } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '../supabase';
import { isDemoMode, getConsistentMockData, updateMockData } from '../demo';

interface RewardBalance {
  current: number;
  total_earned: number;
  total_used: number;
  streak: number;
  last_office_day: string | null;
  accrual_model: 'ratio_based' | 'simple_3_to_1' | 'streak_based';
  office_to_remote_ratio: number;
  streak_bonus_threshold: number;
  streak_bonus_amount: number;
}

interface RemoteRequest {
  id: string;
  date: string;
  days_requested: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  created_at: string;
  requires_high_limit_approval: boolean;
}

interface RewardsState {
  balance: RewardBalance | null;
  requests: RemoteRequest[];
  loading: boolean;
  error: string | null;
  loadBalance: (userId: string, teamId: string) => Promise<void>;
  loadRequests: (userId: string, teamId: string) => Promise<void>;
  requestRemoteDays: (userId: string, teamId: string, date: string, days: number, reason?: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  balance: null,
  requests: [],
  loading: false,
  error: null,

  loadBalance: async (userId: string, teamId: string) => {
    set({ loading: true, error: null });
    try {
      // Use mock data for demo mode
      if (isDemoMode()) {
        const generateMockBalance = () => ({
          current: 5.5,
          total_earned: 12,
          total_used: 6.5,
          streak: 3,
          last_office_day: new Date().toISOString(),
          accrual_model: 'ratio_based' as const,
          office_to_remote_ratio: 3,
          streak_bonus_threshold: 5,
          streak_bonus_amount: 1
        });

        const mockBalance = getConsistentMockData('rewardBalance', generateMockBalance);
        set({ balance: mockBalance });
        return;
      }

      // Get reward balance from Supabase
      const { data: balanceData, error: balanceError } = await supabase
        .from('reward_balances')
        .select(`
          current_balance as current,
          total_earned,
          total_used,
          office_day_streak as streak,
          last_office_day
        `)
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .single();

      if (balanceError) throw balanceError;

      // Get team's reward policy
      const { data: policyData, error: policyError } = await supabase
        .from('reward_policies')
        .select(`
          accrual_model,
          office_to_remote_ratio,
          streak_bonus_threshold,
          streak_bonus_amount
        `)
        .eq('team_id', teamId)
        .single();

      if (policyError) throw policyError;

      // If no balance exists, create initial balance
      if (!balanceData) {
        const { data: newBalance, error: insertError } = await supabase
          .from('reward_balances')
          .insert({
            user_id: userId,
            team_id: teamId,
            current_balance: 0,
            total_earned: 0,
            total_used: 0,
            office_day_streak: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        // Combine balance and policy data
        set({
          balance: {
            current: newBalance.current_balance,
            total_earned: newBalance.total_earned,
            total_used: newBalance.total_used,
            streak: newBalance.office_day_streak,
            last_office_day: newBalance.last_office_day,
            ...policyData
          }
        });
      } else {
        // Combine existing balance and policy data
        set({
          balance: {
            current: balanceData.current,
            total_earned: balanceData.total_earned,
            total_used: balanceData.total_used,
            streak: balanceData.streak,
            last_office_day: balanceData.last_office_day,
            ...policyData
          }
        });
      }
    } catch (err) {
      console.error('Error loading reward balance:', err);
      set({ error: err instanceof Error ? err.message : 'Failed to load reward balance' });
    } finally {
      set({ loading: false });
    }
  },

  loadRequests: async (userId: string, teamId: string) => {
    set({ loading: true, error: null });
    try {
      // Use mock data for demo mode
      if (isDemoMode()) {
        const generateMockRequests = () => {
          const now = new Date();
          return [
            {
              id: 'req-1',
              date: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(),
              days_requested: 1,
              status: 'approved' as const,
              reason: 'Doctor appointment',
              created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10).toISOString(),
              requires_high_limit_approval: false
            },
            {
              id: 'req-2',
              date: new Date(now.getFullYear(), now.getMonth() + 1, 22).toISOString(),
              days_requested: 1,
              status: 'pending' as const,
              created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString(),
              requires_high_limit_approval: false
            },
            {
              id: 'req-3',
              date: new Date(now.getFullYear(), now.getMonth() + 1, 29).toISOString(),
              days_requested: 2,
              status: 'pending' as const,
              reason: 'Family event',
              created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString(),
              requires_high_limit_approval: true
            }
          ];
        };
        
        const mockRequests = getConsistentMockData('remoteRequests', generateMockRequests);
        set({ requests: mockRequests });
        return;
      }

      // Get requests with approvals from Supabase
      const { data, error } = await supabase
        .from('remote_day_requests')
        .select(`
          id,
          date,
          days_requested,
          status,
          reason,
          created_at,
          requires_high_limit_approval,
          remote_day_approvals (
            approval_level,
            status,
            notes
          )
        `)
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ requests: data });
    } catch (err) {
      console.error('Error loading requests:', err);
      set({ error: err instanceof Error ? err.message : 'Failed to load requests' });
    } finally {
      set({ loading: false });
    }
  },

  requestRemoteDays: async (userId: string, teamId: string, date: string, days: number, reason?: string) => {
    set({ loading: true, error: null });
    try {
      if (isDemoMode()) {
        const newRequest = {
          id: `req-${Date.now()}`,
          date,
          days_requested: days,
          status: 'pending' as const,
          reason,
          created_at: new Date().toISOString(),
          requires_high_limit_approval: days > 1
        };
        
        // Update requests list in mock data
        updateMockData('remoteRequests', (prevRequests: RemoteRequest[]) => [
          newRequest, 
          ...prevRequests
        ]);
        
        // Update balance
        updateMockData('rewardBalance', (prevBalance: RewardBalance) => ({
          ...prevBalance,
          current: Math.max(0, prevBalance.current - days)
        }));
        
        set((state) => ({
          requests: [newRequest, ...state.requests],
          balance: state.balance ? {
            ...state.balance,
            current: Math.max(0, state.balance.current - days)
          } : null
        }));
        
        toast.success('Remote day request submitted successfully');
        return;
      }
      
      // Insert request into Supabase
      const { data, error } = await supabase
        .from('remote_day_requests')
        .insert({
          user_id: userId,
          team_id: teamId,
          date,
          days_requested: days,
          reason
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update requests list
      const { requests } = get();
      set({ requests: [data, ...requests] });
      
      toast.success('Remote day request submitted successfully');
    } catch (err) {
      console.error('Error requesting remote days:', err);
      set({ error: err instanceof Error ? err.message : 'Failed to submit request' });
      toast.error('Failed to submit remote day request');
    } finally {
      set({ loading: false });
    }
  },

  cancelRequest: async (requestId: string) => {
    set({ loading: true, error: null });
    try {
      if (isDemoMode()) {
        // Find the request
        const { requests, balance } = get();
        const request = requests.find(r => r.id === requestId);
        
        if (request) {
          // Update request status
          updateMockData('remoteRequests', (prevRequests: RemoteRequest[]) => 
            prevRequests.map(req => 
              req.id === requestId ? { ...req, status: 'cancelled' } : req
            )
          );
          
          // Restore balance if was pending
          if (request.status === 'pending') {
            updateMockData('rewardBalance', (prevBalance: RewardBalance) => ({
              ...prevBalance,
              current: prevBalance.current + request.days_requested
            }));
            
            set({
              requests: requests.map(request =>
                request.id === requestId
                  ? { ...request, status: 'cancelled' }
                  : request
              ),
              balance: balance ? {
                ...balance,
                current: balance.current + request.days_requested
              } : null
            });
          } else {
            set({
              requests: requests.map(request =>
                request.id === requestId
                  ? { ...request, status: 'cancelled' }
                  : request
              )
            });
          }
        }
        
        toast.success('Request cancelled successfully');
        return;
      }

      // Update the request status to cancelled
      const { error } = await supabase
        .from('remote_day_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;

      // Update requests list
      const { requests } = get();
      set({
        requests: requests.map(request =>
          request.id === requestId
            ? { ...request, status: 'cancelled' }
            : request
        )
      });

      toast.success('Request cancelled successfully');
    } catch (err) {
      console.error('Error cancelling request:', err);
      set({ error: err instanceof Error ? err.message : 'Failed to cancel request' });
      toast.error('Failed to cancel request');
    } finally {
      set({ loading: false });
    }
  }
}));