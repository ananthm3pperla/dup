import { create } from "zustand";
import { toast } from "sonner";
import { isDemoMode, getConsistentMockData, updateMockData } from "../demo";
import { database } from "../database";

interface RewardBalance {
  current: number;
  total_earned: number;
  total_used: number;
  streak: number;
  last_office_day: string | null;
  accrual_model: "ratio_based" | "simple_3_to_1" | "streak_based";
  office_to_remote_ratio: number;
  streak_bonus_threshold: number;
  streak_bonus_amount: number;
}

interface RemoteRequest {
  id: string;
  date: string;
  days_requested: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason?: string;
  created_at: string;
  requires_high_limit_approval: boolean;
}

interface RewardsStore {
  balance: RewardBalance | null;
  requests: RemoteRequest[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchBalance: (userId: string) => Promise<void>;
  fetchRequests: (userId: string) => Promise<void>;
  requestRemoteDays: (
    userId: string,
    teamId: string,
    date: string,
    days: number,
    reason?: string,
  ) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  clearError: () => void;
}

export const useRewardsStore = create<RewardsStore>((set, get) => ({
  balance: null,
  requests: [],
  loading: false,
  error: null,

  fetchBalance: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      if (isDemoMode()) {
        const mockBalance = getConsistentMockData("rewardBalance", {
          current: 3,
          total_earned: 12,
          total_used: 9,
          streak: 2,
          last_office_day: new Date(Date.now() - 86400000)
            .toISOString()
            .split("T")[0],
          accrual_model: "ratio_based" as const,
          office_to_remote_ratio: 3,
          streak_bonus_threshold: 5,
          streak_bonus_amount: 1,
        });

        set({ balance: mockBalance, loading: false });
        return;
      }

      // Fetch from Replit Database
      const balanceData = await database.get(`reward_balance:${userId}`);

      if (!balanceData) {
        // Create default balance
        const defaultBalance: RewardBalance = {
          current: 0,
          total_earned: 0,
          total_used: 0,
          streak: 0,
          last_office_day: null,
          accrual_model: "ratio_based",
          office_to_remote_ratio: 3,
          streak_bonus_threshold: 5,
          streak_bonus_amount: 1,
        };

        await database.set(`reward_balance:${userId}`, defaultBalance);
        set({ balance: defaultBalance });
      } else {
        set({ balance: balanceData as RewardBalance });
      }
    } catch (error) {
      console.error("Error fetching reward balance:", error);
      set({ error: "Failed to fetch reward balance" });
    } finally {
      set({ loading: false });
    }
  },

  fetchRequests: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      if (isDemoMode()) {
        const mockRequests = getConsistentMockData("remoteRequests", [
          {
            id: "req-1",
            date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            days_requested: 1,
            status: "pending" as const,
            reason: "Doctor appointment",
            created_at: new Date().toISOString(),
            requires_high_limit_approval: false,
          },
        ]);

        set({ requests: mockRequests, loading: false });
        return;
      }

      // Fetch from Replit Database
      const requestsData = await database.get(`remote_requests:${userId}`);
      set({ requests: requestsData || [] });
    } catch (error) {
      console.error("Error fetching remote requests:", error);
      set({ error: "Failed to fetch remote requests" });
    } finally {
      set({ loading: false });
    }
  },

  requestRemoteDays: async (
    userId: string,
    teamId: string,
    date: string,
    days: number,
    reason?: string,
  ) => {
    set({ loading: true, error: null });
    try {
      if (isDemoMode()) {
        const newRequest = {
          id: `req-${Date.now()}`,
          date,
          days_requested: days,
          status: "pending" as const,
          reason,
          created_at: new Date().toISOString(),
          requires_high_limit_approval: days > 1,
        };

        // Update requests list in mock data
        updateMockData("remoteRequests", (prevRequests: RemoteRequest[]) => [
          newRequest,
          ...prevRequests,
        ]);

        // Update balance
        updateMockData("rewardBalance", (prevBalance: RewardBalance) => ({
          ...prevBalance,
          current: Math.max(0, prevBalance.current - days),
        }));

        set((state) => ({
          requests: [newRequest, ...state.requests],
          balance: state.balance
            ? {
                ...state.balance,
                current: Math.max(0, state.balance.current - days),
              }
            : null,
        }));

        toast.success("Remote day request submitted successfully");
        return;
      }

      // Create request in Replit Database
      const newRequest: RemoteRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date,
        days_requested: days,
        status: "pending",
        reason,
        created_at: new Date().toISOString(),
        requires_high_limit_approval: days > 1,
      };

      // Get existing requests
      const existingRequests =
        (await database.get(`remote_requests:${userId}`)) || [];
      const updatedRequests = [newRequest, ...existingRequests];

      // Save updated requests
      await database.set(`remote_requests:${userId}`, updatedRequests);

      // Update balance
      const currentBalance = get().balance;
      if (currentBalance) {
        const updatedBalance = {
          ...currentBalance,
          current: Math.max(0, currentBalance.current - days),
          total_used: currentBalance.total_used + days,
        };

        await database.set(`reward_balance:${userId}`, updatedBalance);
        set({ balance: updatedBalance });
      }

      set((state) => ({
        requests: [newRequest, ...state.requests],
      }));

      toast.success("Remote day request submitted successfully");
    } catch (error) {
      console.error("Error requesting remote days:", error);
      set({ error: "Failed to submit remote day request" });
      toast.error("Failed to submit remote day request");
    } finally {
      set({ loading: false });
    }
  },

  cancelRequest: async (requestId: string) => {
    set({ loading: true, error: null });
    try {
      if (isDemoMode()) {
        updateMockData("remoteRequests", (prevRequests: RemoteRequest[]) =>
          prevRequests.map((req) =>
            req.id === requestId
              ? { ...req, status: "cancelled" as const }
              : req,
          ),
        );

        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === requestId
              ? { ...req, status: "cancelled" as const }
              : req,
          ),
        }));

        toast.success("Request cancelled successfully");
        return;
      }

      // Update request status in database
      const state = get();
      const userId = state.requests
        .find((r) => r.id === requestId)
        ?.id.split("_")[0]; // Extract user ID

      if (userId) {
        const requests =
          (await database.get(`remote_requests:${userId}`)) || [];
        const updatedRequests = requests.map((req: RemoteRequest) =>
          req.id === requestId ? { ...req, status: "cancelled" as const } : req,
        );

        await database.set(`remote_requests:${userId}`, updatedRequests);

        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === requestId
              ? { ...req, status: "cancelled" as const }
              : req,
          ),
        }));

        toast.success("Request cancelled successfully");
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      set({ error: "Failed to cancel request" });
      toast.error("Failed to cancel request");
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
