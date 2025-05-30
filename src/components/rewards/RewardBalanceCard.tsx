import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Award, Clock } from 'lucide-react';
import { Card } from '@/components/ui';
import { format } from 'date-fns';

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

interface RewardBalanceCardProps {
  balance: RewardBalance;
  onUseRemoteDays?: () => void;
}

export default function RewardBalanceCard({ balance, onUseRemoteDays }: RewardBalanceCardProps) {
  const getAccrualDescription = () => {
    switch (balance.accrual_model) {
      case 'ratio_based':
        return `Earn 1 remote day for every ${balance.office_to_remote_ratio} office days`;
      case 'simple_3_to_1':
        return 'Earn 1 remote day for every 3 office days';
      case 'streak_based':
        return `Earn bonus days after ${balance.streak_bonus_threshold} consecutive office days`;
      default:
        return 'Standard accrual model';
    }
  };

  const getStreakBonus = () => {
    if (balance.accrual_model !== 'streak_based') return null;
    const daysUntilBonus = balance.streak_bonus_threshold - balance.streak;
    if (daysUntilBonus <= 0) return 'Bonus achieved!';
    return `${daysUntilBonus} days until ${balance.streak_bonus_amount} bonus ${balance.streak_bonus_amount === 1 ? 'day' : 'days'}`;
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">My Remote Work Balance</h3>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
            Last updated: {format(new Date(), 'MMM d, h:mm a')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">My Available Balance</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {balance.current.toFixed(1)}
                <span className="text-sm sm:text-lg font-normal text-gray-500 dark:text-gray-400 ml-1">days</span>
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">Total Earned</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{balance.total_earned.toFixed(1)} days</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(balance.total_earned / (balance.total_earned + 5)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">Total Used</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{balance.total_used.toFixed(1)} days</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full transition-all duration-500"
                  style={{ width: `${(balance.total_used / balance.total_earned) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">My Current Streak</h4>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {balance.streak}
                  <span className="text-sm sm:text-base font-normal text-gray-500 dark:text-gray-400 ml-1">days</span>
                </p>
                {getStreakBonus() && (
                  <p className="text-xs text-success mt-0.5">{getStreakBonus()}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">My Accrual Model</h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{getAccrualDescription()}</p>
          </div>

          {onUseRemoteDays && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onUseRemoteDays}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-light transition-colors dark:bg-primary dark:hover:bg-primary-light"
            >
              <Calendar className="h-4 w-4" />
              Schedule My Remote Work
            </motion.button>
          )}
        </div>
      </div>
    </Card>
  );
}