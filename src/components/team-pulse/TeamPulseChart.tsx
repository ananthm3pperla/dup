import React, { useState } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Calendar, ArrowLeft, ArrowRight, Frown, Meh, Smile } from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface TeamMoodData {
  date: string;
  challenging: number;
  neutral: number;
  good: number;
  total: number;
}

interface TeamPulseChartProps {
  className?: string;
}

export default function TeamPulseChart({ className = '' }: TeamPulseChartProps) {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 14),
    end: new Date()
  });
  
  // Generate mock data for the chart
  const generateMockData = (): TeamMoodData[] => {
    const days = eachDayOfInterval({ 
      start: dateRange.start,
      end: dateRange.end
    });
    
    return days.map(day => {
      const challenging = Math.floor(Math.random() * 5);
      const neutral = Math.floor(Math.random() * 8);
      const good = Math.floor(Math.random() * 12);
      const total = challenging + neutral + good;
      
      return {
        date: format(day, 'yyyy-MM-dd'),
        challenging,
        neutral,
        good,
        total
      };
    });
  };
  
  const moodData = generateMockData();
  
  // Calculate max value for chart scaling
  const maxValue = Math.max(...moodData.map(d => d.total));
  
  // Navigate through time
  const handlePrevPeriod = () => {
    setDateRange({
      start: subDays(dateRange.start, 14),
      end: subDays(dateRange.end, 14)
    });
  };
  
  const handleNextPeriod = () => {
    const today = new Date();
    if (dateRange.end < today) {
      setDateRange({
        start: subDays(today, 14),
        end: today
      });
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Pulse Trends</h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPeriod}
            className="p-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d')}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPeriod}
            disabled={dateRange.end >= new Date()}
            className="p-1.5"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="h-60 flex items-end gap-1">
        {moodData.map((day) => {
          const dateObj = new Date(day.date);
          const isWeekend = [0, 6].includes(dateObj.getDay());
          const challengingHeight = (day.challenging / maxValue) * 100;
          const neutralHeight = (day.neutral / maxValue) * 100;
          const goodHeight = (day.good / maxValue) * 100;
          
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full rounded-t-sm bg-success-100 dark:bg-success-900/30"
                style={{ height: `${goodHeight}%` }}
                title={`${day.good} feeling good`}
              />
              <div 
                className="w-full bg-warning-100 dark:bg-warning-900/30"
                style={{ height: `${neutralHeight}%` }}
                title={`${day.neutral} feeling neutral`}
              />
              <div 
                className="w-full rounded-b-sm bg-error-100 dark:bg-error-900/30"
                style={{ height: `${challengingHeight}%` }}
                title={`${day.challenging} feeling challenged`}
              />
              
              <div 
                className={`
                  mt-1 text-xs font-medium
                  ${isWeekend ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}
                `}
              >
                {format(dateObj, 'dd')}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-100 dark:bg-success-900/30 rounded-sm" />
            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Smile className="h-3 w-3 text-success" /> Good
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning-100 dark:bg-warning-900/30 rounded-sm" />
            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Meh className="h-3 w-3 text-warning" /> Neutral
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error-100 dark:bg-error-900/30 rounded-sm" />
            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Frown className="h-3 w-3 text-error" /> Challenging
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}