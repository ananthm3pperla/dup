import React from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Building2,
  LayoutDashboard,
  Calendar, 
  Users, 
  X, 
  Home,
  User,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { isDemoMode, DEMO_USER } from '@/lib/demo';

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { theme } = useTheme();
  const { user, signOut, isDemo } = useAuth();
  const navigate = useNavigate();
  const { currentTeam, isTeamLeader } = useTeam();
  const { sidebarState, toggleSidebar } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, id: 'nav-dashboard' },
    { name: 'Schedule', href: '/schedule', icon: Calendar, id: 'nav-schedule' },
    { name: 'Teams', href: '/teams', icon: Users, id: 'nav-teams' },
    { name: 'Profile', href: `/profile/${user?.id}`, icon: User, id: 'nav-profile' },
    { name: 'Settings', href: '/settings', icon: Settings, id: 'nav-settings' }
  ];

  // Add Team Pulse for team leaders
  if (isTeamLeader) {
    navigation.splice(4, 0, { name: 'Team Pulse', href: '/team/pulse', icon: MessageSquare, id: 'nav-team-pulse' });
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div 
      className="flex h-full flex-col overflow-y-auto border-r border-default bg-card dark:bg-gray-900 transition-all duration-300 w-full relative"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Mobile close button */}
      <div className="lg:hidden flex items-center justify-between p-4">
        <div className="flex items-center">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Building2 className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="ml-2 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light"
          >
            Hi-Bridge
          </motion.span>
        </div>
        <button
          type="button"
          className="text-muted hover:text-default focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md p-1"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop logo */}
      <div className="hidden lg:flex h-16 flex-shrink-0 items-center px-4 justify-between">
        <div className="flex items-center">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Building2 className="h-8 w-8 text-primary" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="ml-2 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light dark:from-primary-light dark:to-primary"
              >
                Hi-Bridge
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md text-muted hover:text-default hover:bg-card-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4" aria-label="Sidebar">
        <div className="mb-4 px-3">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Navigation
              </motion.h3>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              id={item.id}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  isActive
                    ? 'bg-primary text-white shadow-md dark:bg-primary-dark'
                    : 'text-muted hover:bg-card-hover hover:text-default dark:hover:bg-gray-800'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              onClick={() => {
                // Close sidebar on mobile when a navigation item is clicked
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
              aria-label={item.name}
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-muted group-hover:text-default'
                      }`}
                      aria-hidden="true"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-3 flex-1 whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-default p-4 dark:border-gray-800 mt-auto">
        <div className="flex flex-col space-y-3">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between"
              >
                <p className="text-xs text-muted">
                  Hi-Bridge v0.1.0
                </p>
                <Link 
                  to="/help" 
                  className="text-xs text-primary hover:text-primary-light"
                  aria-label="Help"
                >
                  <HelpCircle className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleSignOut}
            className={`flex items-center ${isCollapsed ? 'justify-center' : ''} gap-3 px-3 py-2 text-sm font-medium rounded-md text-error hover:bg-error/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}