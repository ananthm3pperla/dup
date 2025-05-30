import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Menu, X, LogIn, UserPlus, Target } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 dark:bg-gray-900/90 shadow-md backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link to="/" className="flex items-center">
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
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 -my-2 md:hidden">
            <button
              type="button"
              className="rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setIsMenuOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-10">
            <a href="#features" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Features
            </a>
            <a href="#howItWorks" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              How It Works
            </a>
          </nav>
          
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 gap-4">
            <Link
              to="/login"
              className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link to="/signup">
              <Button
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Sign up
              </Button>
            </Link>
            <Link to="/join-team">
              <Button
                variant="outline"
              >
                Join Team
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl md:hidden flex flex-col"
            >
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-primary" />
                  <span className="ml-2 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">
                    Hi-Bridge
                  </span>
                </div>
                <button
                  type="button"
                  className="rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex-1 px-4 py-6 sm:px-6 overflow-auto">
                <div className="flex flex-col space-y-6">
                  <a 
                    href="#features" 
                    className="text-base font-medium text-gray-900 hover:text-primary dark:text-gray-100 dark:hover:text-primary-light"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a 
                    href="#howItWorks" 
                    className="text-base font-medium text-gray-900 hover:text-primary dark:text-gray-100 dark:hover:text-primary-light"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How It Works
                  </a>
                </div>
              </div>
              
              <div className="px-4 py-6 sm:px-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <Link to="/login" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full"
                    leftIcon={<LogIn className="h-4 w-4" />}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button
                    className="w-full"
                    leftIcon={<UserPlus className="h-4 w-4" />}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Button>
                </Link>
                <Link to="/join-team" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full"
                    leftIcon={<Target className="h-4 w-4" />}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Join Team
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}