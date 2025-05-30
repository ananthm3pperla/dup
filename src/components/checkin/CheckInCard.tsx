import React, { useEffect, useState } from 'react';
import { Camera, MapPin, Check } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { CheckInButton } from '@/components/checkin';
import { format } from 'date-fns';
import { getUserCheckIns } from '@/lib/checkin';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface LastCheckIn {
  checkin_time: string;
  status: 'pending' | 'approved' | 'rejected';
  location_verified: boolean;
}

interface CheckInCardProps {
  className?: string;
}

export default function CheckInCard({ className }: CheckInCardProps) {
  const { user } = useAuth();
  const [lastCheckIn, setLastCheckIn] = useState<LastCheckIn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCheckIns = async () => {
      if (!user) return;
      
      try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 1); // Last 24 hours
        
        const checkIns = await getUserCheckIns(
          user.id,
          startDate.toISOString(),
          today.toISOString()
        );
        
        if (checkIns && checkIns.length > 0) {
          setLastCheckIn(checkIns[0] as LastCheckIn);
        }
      } catch (error) {
        console.error('Error loading check-ins:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCheckIns();
  }, [user]);

  return (
    <Card 
      className={`p-4 sm:p-6 ${className} dark:border dark:border-gray-700 check-in-card overflow-hidden`}
      variant="elevated"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg dark:bg-primary/20">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Office Check-in</h3>
        </div>
        {lastCheckIn && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${lastCheckIn.status === 'approved' ? 'bg-success/10 text-success' :
                lastCheckIn.status === 'rejected' ? 'bg-error/10 text-error' :
                'bg-warning/10 text-warning'}
            `}
          >
            {lastCheckIn.status.charAt(0).toUpperCase() + lastCheckIn.status.slice(1)}
          </motion.span>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      ) : lastCheckIn ? (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Last Check-in</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {format(new Date(lastCheckIn.checkin_time), 'h:mm a')}
            </span>
          </div>
          {lastCheckIn.location_verified && (
            <div className="flex items-center gap-2 text-sm text-success">
              <MapPin className="h-4 w-4" />
              <span>Location verified</span>
              <Check className="h-4 w-4" />
            </div>
          )}
          <Button 
            className="w-full justify-center bg-primary hover:bg-primary-dark text-white"
            leftIcon={<Camera className="h-4 w-4" />}
            onClick={() => {
              const checkInButton = document.querySelector('.check-in-card button') as HTMLButtonElement;
              if (checkInButton) checkInButton.click();
            }}
          >
            Check In Again
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          className="text-center py-6 sm:py-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
            No check-ins recorded today
          </p>
          <CheckInButton className="w-full justify-center" />
        </motion.div>
      )}
    </Card>
  );
}