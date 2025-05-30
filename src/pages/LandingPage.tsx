import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Calendar, Users, Award, Check, ArrowRight, UserPlus, Target, User } from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import LandingNavbar from '@/components/LandingNavbar';
import { toast } from 'sonner';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, enterDemoMode } = useAuth();
  const [isEnteringDemo, setIsEnteringDemo] = useState(false);
  const [accountDeactivated, setAccountDeactivated] = useState(false);
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Check if the user was redirected due to account deactivation
  useEffect(() => {
    const deactivatedFlag = sessionStorage.getItem('accountDeactivated');
    if (deactivatedFlag === 'true') {
      setAccountDeactivated(true);
      // Remove the flag to prevent showing the message on future visits
      sessionStorage.removeItem('accountDeactivated');
    }
  }, []);

  const handleDemoClick = () => {
    setIsEnteringDemo(true);
    try {
      enterDemoMode();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to enter demo mode:', error);
    } finally {
      setIsEnteringDemo(false);
    }
  };

  const handleDismissDeactivation = () => {
    setAccountDeactivated(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <LandingNavbar />
      
      {/* Account Deactivation Message */}
      {accountDeactivated && (
        <div className="fixed top-20 left-0 right-0 z-50 mx-auto max-w-md px-4">
          <Alert 
            variant="error"
            title="Account Deactivated"
            onClose={handleDismissDeactivation}
          >
            <p>Your account has been deactivated or no longer exists. If you believe this is an error, please contact support.</p>
          </Alert>
        </div>
      )}
      
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <Building2 className="h-16 w-16 text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white"
            >
              Hi-Bridge
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-3 max-w-md mx-auto text-xl text-gray-500 dark:text-gray-300 sm:text-2xl"
            >
              Bridging Teams, Building Futures
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-5 max-w-prose mx-auto text-base text-gray-500 dark:text-gray-400"
            >
              Hybrid work isn't about forcing people into the office — it's about making it worthwhile.
              Hi-Bridge motivates employees to want to come in, empowers managers with flexible tools, and provides HR leaders with real-time engagement insights.
            </motion.p>
            
            {/* Main Hero CTA - Button Group */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-col items-center"
            >
              <div className="flex gap-4 flex-col sm:flex-row">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-lg bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Create Account
                  </Button>
                </Link>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleDemoClick}
                  className="px-8 py-4 text-lg min-w-[200px]"
                  isLoading={isEnteringDemo}
                  disabled={isEnteringDemo}
                >
                  Try Demo Mode
                </Button>
              </div>
              
              <div className="mt-8 flex gap-4">
                <Link to="/login">
                  <Button variant="outline" className="border-primary text-primary">
                    Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* What We Do Section */}
      <section className="py-12 bg-white dark:bg-gray-800" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              What We Do
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              Hi-Bridge transforms hybrid workforces through:
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Award className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Behavioral Incentives</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Employees earn remote days by participating in office activities, creating a balanced approach to hybrid work.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Coordination</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Managers create anchor days for maximum collaboration, set schedules, and boost team morale.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Engagement Insights</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    HR leaders monitor participation trends and employee satisfaction without micromanagement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900" id="howItWorks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              Simple, effective hybrid work management
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 relative hover:shadow-lg transition-all duration-200">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">1</div>
              <div className="flex flex-col items-center text-center pt-6">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Create Your Account</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Sign up for a new account and set up your profile in minutes.
                </p>
                <Link to="/signup">
                  <Button>Create Account</Button>
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 relative hover:shadow-lg transition-all duration-200">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">2</div>
              <div className="flex flex-col items-center text-center pt-6">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Join Your Team</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Have an invite code? Join your team's workspace instantly.
                </p>
                <Link to="/join-team">
                  <Button variant="outline">Join Team</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Build Section */}
      <section className="py-12 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Ready to Build a Workplace People Love Returning To?
            </h2>
            <div className="mt-8 space-y-4">
              <p className="text-lg text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                Launch a fair, flexible, and rewarding hybrid culture.
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                Capture data that improves well-being and productivity.
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                Turn your office into a magnet — not a mandate.
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="px-8 py-3 text-lg"
                >
                  Create Account
                </Button>
              </Link>
              <Link to="/join-team">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 text-lg"
                >
                  Join a Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Enterprise Ready | Built for scalability. Integrated for security. Trusted by teams.
              </p>
            </div>
            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 md:mt-0 md:order-1">
              &copy; 2025 Hi-Bridge — Where Hybrid Work Works for Everyone
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}