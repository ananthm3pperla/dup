import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';
import MobileNavBar from '../ui/MobileNavBar';
import { usePulseStore } from '@/lib/store/pulseStore';
import { useNotificationStore } from '@/lib/store/notificationStore';
import { isDemoMode } from '@/lib/demo';
import { EmailVerificationBanner } from '@/components/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { sidebarState } = useSidebar();
  const initializePulse = usePulseStore(state => state.initialize);
  const initializeNotifications = useNotificationStore(state => state.initialize);

  // Initialize stores in demo mode
  useEffect(() => {
    if (isDemoMode()) {
      initializePulse();
      initializeNotifications();
    }
  }, [initializePulse, initializeNotifications]);

  // Animation variants
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-app relative dark:bg-gray-900 overflow-x-hidden">
      {/* Email verification banner for unverified users */}
      {user && !user.email_confirmed_at && !isDemoMode() && (
        <EmailVerificationBanner email={user.email || ''} />
      )}
      
      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col z-10 transition-all duration-300 ${
        sidebarState === 'expanded' ? 'lg:w-64' : 'lg:w-20'
      }`}>
        <Sidebar onClose={() => {}} />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-30 w-full max-w-[280px] lg:hidden"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`transition-all duration-300 ${
        sidebarState === 'expanded' ? 'lg:pl-64' : 'lg:pl-20'
      } min-h-screen flex flex-col pb-16 lg:pb-0`}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 py-4 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-[100vw] overflow-x-hidden bg-app dark:bg-gray-900 relative">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="mx-auto w-full max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
        
        {/* Mobile Navigation */}
        <MobileNavBar onMenuClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}