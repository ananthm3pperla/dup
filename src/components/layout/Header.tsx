import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Menu,
  LogOut,
  ChevronDown,
  User,
  Bell,
  Search,
  Building2,
} from "lucide-react";
import NotificationBell from "../notifications/NotificationBell";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "../ui/Avatar";
import LogoutDialog from "../ui/LogoutDialog";
import { Button } from "@/components/ui";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { DEMO_USER, isDemoMode } from "@/lib/demo";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut, isDemo } = useAuth();
  const { currentTeam } = useTeam();
  const { sidebarState } = useSidebar();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      // Navigation is handled in LogoutDialog component
      setIsLogoutDialogOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Close menus when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would navigate to search results
      console.log(`Searching for: ${searchQuery}`);
    }
  };

  return (
    <header className="bg-card/80 backdrop-blur-md shadow-lg border-b border-default/30 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden -ml-1 mr-2 p-2 text-muted hover:text-default hover:bg-card-hover rounded-md focus:outline-none"
              onClick={onMenuClick}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="hidden md:block flex-1 mx-8">
              <Breadcrumbs />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle size="sm" />
            <NotificationBell />

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md p-1"
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <Avatar
                  src={
                    isDemoMode()
                      ? DEMO_USER.avatar_url
                      : user?.user_metadata?.avatar_url
                  }
                  alt={
                    isDemoMode()
                      ? DEMO_USER.full_name
                      : user?.user_metadata?.full_name || "User"
                  }
                  fallback={
                    isDemoMode()
                      ? DEMO_USER.full_name
                      : user?.user_metadata?.full_name || user?.email || "User"
                  }
                  size="sm"
                  className="ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/40"
                />
                <span className="hidden sm:block font-medium text-default max-w-[150px] truncate">
                  {isDemoMode()
                    ? DEMO_USER.full_name
                    : user?.user_metadata?.full_name ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  {isDemo && (
                    <span className="ml-1 text-xs text-primary">(Demo)</span>
                  )}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200 dark:border-gray-700"
                  >
                    <div
                      className="py-1 divide-y divide-default"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="px-4 py-3 text-xs text-muted">
                        <p>Signed in as</p>
                        <p className="truncate font-medium text-default mt-1 dark:text-gray-300">
                          {isDemoMode() ? DEMO_USER.email : user?.email}
                          {isDemo && (
                            <span className="ml-1 text-primary">(Demo)</span>
                          )}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate(`/profile/${user?.id}`);
                          }}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-default hover:bg-card-hover transition-colors"
                          role="menuitem"
                        >
                          <User className="mr-3 h-5 w-5 text-muted" />
                          <span className="dark:text-gray-300">
                            Your Profile
                          </span>
                        </button>
                      </div>

                      <div className="py-1">
                        <button
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsLogoutDialogOpen(true);
                          }}
                          role="menuitem"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          <span className="dark:text-gray-300">Sign out</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile breadcrumbs */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4">
        <Breadcrumbs />
      </div>

      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleSignOut}
        isLoading={isLoggingOut}
        isDemo={isDemo}
      />
    </header>
  );
}
