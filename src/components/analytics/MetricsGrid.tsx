
import React from 'react';
import { Card } from '@/components/ui';
import { TrendingUp, TrendingDown, Users, Calendar, Heart, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface Metric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface MetricsGridProps {
  metrics: Metric[];
  loading?: boolean;
}

export default function MetricsGrid({ metrics, loading = false }: MetricsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted">{metric.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold text-default">{metric.value}</p>
                  {metric.change !== 0 && (
                    <div className={`flex items-center text-sm ${
                      metric.changeType === 'increase' 
                        ? 'text-green-600 dark:text-green-400' 
                        : metric.changeType === 'decrease'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500'
                    }`}>
                      {metric.changeType === 'increase' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : metric.changeType === 'decrease' ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : null}
                      <span>{Math.abs(metric.change)}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-full ${metric.color}`}>
                {metric.icon}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Sample metrics data generator
export function generateSampleMetrics(): Metric[] {
  return [
    {
      id: 'total-employees',
      title: 'Total Employees',
      value: 156,
      change: 8.2,
      changeType: 'increase',
      icon: <Users className="h-5 w-5 text-white" />,
      color: 'bg-blue-500'
    },
    {
      id: 'office-attendance',
      title: 'Office Attendance',
      value: '78%',
      change: 12.5,
      changeType: 'increase',
      icon: <Calendar className="h-5 w-5 text-white" />,
      color: 'bg-green-500'
    },
    {
      id: 'avg-mood',
      title: 'Average Mood',
      value: '4.2/5',
      change: 0,
      changeType: 'neutral',
      icon: <Heart className="h-5 w-5 text-white" />,
      color: 'bg-red-500'
    },
    {
      id: 'engagement-score',
      title: 'Engagement Score',
      value: '87%',
      change: 5.3,
      changeType: 'increase',
      icon: <Award className="h-5 w-5 text-white" />,
      color: 'bg-purple-500'
    }
  ];
}
