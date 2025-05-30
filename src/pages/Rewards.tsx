import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useRewardsStore } from '@/lib/store/rewardsStore';
import { generateMockRewards } from '@/lib/mockData';
import { LoadingState, PageHeader } from '@/components/ui';
import RewardBalanceCard from '@/components/rewards/RewardBalanceCard';
import RewardHistoryCard from '@/components/rewards/RewardHistoryCard';
import UseRemoteDayDialog from '@/components/rewards/UseRemoteDayDialog';
import Marketplace from '@/components/rewards/Marketplace';
import RedemptionDialog from '@/components/rewards/RedemptionDialog';
import type { Reward } from '@/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Award, Users, TrendingUp, Target, Trophy } from 'lucide-react';

export default function Rewards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const { balance, requests, loading, error, loadBalance, loadRequests, cancelRequest } = useRewardsStore();
  const [isRequestingRemoteDay, setIsRequestingRemoteDay] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedemptionDialogOpen, setIsRedemptionDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || !currentTeam?.id) return;
      
      try {
        await Promise.all([
          loadBalance(user.id, currentTeam.id),
          loadRequests(user.id, currentTeam.id)
        ]);
        
        // Generate mock rewards
        setRewards(generateMockRewards(10));
      } catch (err) {
        console.error('Error loading rewards data:', err);
      }
    };

    loadData();
  }, [user?.id, currentTeam?.id]);

  const handleRedeemReward = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;
    
    setSelectedReward(reward);
    setIsRedemptionDialogOpen(true);
  };

  const handleConfirmRedemption = async (rewardId: string) => {
    try {
      // Simulate redemption process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update rewards list
      setRewards(rewards.map(reward => 
        reward.id === rewardId 
          ? { 
              ...reward, 
              remainingCount: reward.remainingCount 
                ? Math.max(0, reward.remainingCount - 1) 
                : undefined 
            } 
          : reward
      ));
      
      // Update balance
      if (balance) {
        const reward = rewards.find(r => r.id === rewardId);
        if (reward) {
          // This would be handled by the backend in a real app
          // For demo, we'll just simulate it
          toast.success(`Successfully redeemed ${reward.title}`);
        }
      }
      
      return Promise.resolve();
    } catch (err) {
      console.error('Error redeeming reward:', err);
      toast.error('Failed to redeem reward');
      throw err;
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelRequest(requestId);
      toast.success('Request cancelled successfully');
    } catch (err) {
      console.error('Error cancelling request:', err);
      toast.error('Failed to cancel request');
    }
  };

  if (loading) {
    return <LoadingState message="Loading rewards data..." />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="bg-error/10 text-error rounded-lg p-6 mb-6 max-w-md">
          <h2 className="text-lg font-medium mb-2">Error Loading Rewards</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="bg-warning/10 text-warning rounded-lg p-6 mb-6 max-w-md">
          <h2 className="text-lg font-medium mb-2">No Reward Balance Found</h2>
          <p className="text-sm">Please contact your team leader to set up your reward balance.</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      name: 'Office Days',
      value: `${balance.streak}/${currentTeam?.rto_policy.required_days}`,
      change: 'On Track',
      icon: Users,
      color: 'primary'
    },
    {
      name: 'Team Alignment',
      value: '85%',
      change: '+12%',
      icon: TrendingUp,
      color: 'success'
    },
    {
      name: 'Points Earned',
      value: balance.total_earned.toFixed(0),
      change: `+${(balance.total_earned - balance.total_used).toFixed(1)} available`,
      icon: Trophy,
      color: 'warning'
    },
    {
      name: 'Engagement Score',
      value: '4.8/5',
      change: '+0.3',
      icon: Target,
      color: 'info'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader 
        title="My Rewards"
        description="Earn and redeem remote work days and other rewards"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-${metric.color}/10 flex items-center justify-center`}>
                  <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${metric.color}`} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{metric.name}</p>
                  <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
                  <p className={`text-xs ${
                    metric.change.startsWith('+') ? 'text-success' : 
                    metric.change.startsWith('-') ? 'text-error' : 
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <RewardBalanceCard 
            balance={balance} 
            onUseRemoteDays={() => setIsRequestingRemoteDay(true)} 
          />
          
          <RewardHistoryCard 
            requests={requests} 
            onCancelRequest={handleCancelRequest} 
          />
        </div>
        
        <div className="lg:col-span-2">
          <Marketplace 
            userPoints={balance.current * 100} // Convert days to points
            rewards={rewards}
            onRedeem={handleRedeemReward}
          />
        </div>
      </div>

      {/* Dialogs */}
      <UseRemoteDayDialog 
        isOpen={isRequestingRemoteDay}
        onClose={() => setIsRequestingRemoteDay(false)}
        currentBalance={balance.current}
      />
      
      <RedemptionDialog
        isOpen={isRedemptionDialogOpen}
        onClose={() => setIsRedemptionDialogOpen(false)}
        reward={selectedReward}
        onConfirm={handleConfirmRedemption}
      />
    </div>
  );
}