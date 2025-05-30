import React, { useEffect, useState } from 'react';
import { Building2, Users, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface Metrics {
  officeDays: {
    completed: number;
    required: number;
  };
  teamAlignment: {
    value: number;
    change: number;
  };
  points: {
    total: number;
    weeklyChange: number;
  };
  feedbackScore: {
    value: number;
    change: number;
  };
}

export default function KeyMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    officeDays: { completed: 2, required: 3 },
    teamAlignment: { value: 85, change: 12 },
    points: { total: 450, weeklyChange: 50 },
    feedbackScore: { value: 4.8, change: 0.3 }
  });

  const metricsConfig = [
    {
      name: 'My Office Days',
      value: `${metrics.officeDays.completed}/${metrics.officeDays.required}`,
      change: 'On Track',
      icon: Building2,
      color: 'primary'
    },
    {
      name: 'Team Alignment',
      value: `${metrics.teamAlignment.value}%`,
      change: `${metrics.teamAlignment.change >= 0 ? '+' : ''}${metrics.teamAlignment.change}%`,
      icon: Users,
      color: 'success'
    },
    {
      name: 'My Points',
      value: metrics.points.total.toString(),
      change: `+${metrics.points.weeklyChange} this week`,
      icon: Trophy,
      color: 'warning'
    },
    {
      name: 'My Feedback',
      value: `${metrics.feedbackScore.value.toFixed(1)}/5`,
      change: `${metrics.feedbackScore.change >= 0 ? '+' : ''}${metrics.feedbackScore.change}`,
      icon: Target,
      color: 'info'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
      {metricsConfig.map((metric, i) => (
        <motion.div 
          key={metric.name}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center bg-${metric.color}/10 dark:bg-${metric.color}/20`}>
              <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${metric.color}`} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{metric.name}</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
              <p className={`text-xs ${
                metric.change.startsWith('+') ? 'text-success' : 
                metric.change.startsWith('-') ? 'text-error' : 
                'text-gray-500 dark:text-gray-400'
              }`}>
                {metric.change}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}