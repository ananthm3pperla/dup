import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TeamProvider } from './contexts/TeamContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import AppErrorBoundary from './components/error/AppErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import AuthRedirect from './components/auth/AuthRedirect';
import SessionHandler from './components/SessionHandler';
import AuthErrorHandler from './components/AuthErrorHandler';
import RouteLoadingFallback from './components/loading/RouteLoadingFallback';
import LoadingState from './components/ui/LoadingState';
import Toaster from './components/ui/Toast';
import { isDemoMode } from './lib/demo';
import { SessionManager } from './components/auth';

// Custom error handler for lazy loading
const handleLazyLoadError = (error: Error, info: React.ErrorInfo) => {
  console.error('Error loading component:', error, info);
};

// Custom fallback for lazy loading errors
const LazyLoadFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className="min-h-screen flex items-center justify-center bg-app p-4">
    <div className="bg-card rounded-lg shadow-lg p-6 max-w-lg w-full">
      <h2 className="text-xl font-semibold text-default mb-4">Failed to load component</h2>
      <p className="text-sm text-muted mb-4">There was an error loading this page. Please try again.</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Lazy load pages with error boundaries for better performance
// Public pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Signup = React.lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = React.lazy(() => import('./pages/auth/VerifyEmail'));
const AuthCallback = React.lazy(() => import('./pages/auth/AuthCallback'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const JoinTeam = React.lazy(() => import('./pages/join-team'));

// Protected pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Teams = React.lazy(() => import('./pages/Teams'));
const TeamCreate = React.lazy(() => import('./pages/team/Create'));
const TeamJoin = React.lazy(() => import('./pages/team/Join'));
const TeamSettings = React.lazy(() => import('./pages/team/Settings'));
const Schedule = React.lazy(() => import('./pages/Schedule'));
const Profile = React.lazy(() => import('./pages/Profile'));
const UserOnboarding = React.lazy(() => import('./pages/UserOnboarding'));
const ColorSystem = React.lazy(() => import('./pages/design/ColorSystem'));
const Rewards = React.lazy(() => import('./pages/Rewards'));
const TeamPulse = React.lazy(() => import('./pages/TeamPulse'));
const Settings = React.lazy(() => import('./pages/Settings'));

// 404 Page
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  // Apply system theme on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
  }, []);

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ThemeProvider>
            <SidebarProvider>
              <TeamProvider>
                <ScheduleProvider>
                  <AuthErrorHandler>
                    <SessionManager>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={
                          <Suspense fallback={<LoadingState message="Loading..." />}>
                            <LandingPage />
                          </Suspense>
                        } />
                        
                        {/* Join team with specific route */}
                        <Route path="/join-team" element={
                          <Suspense fallback={<LoadingState message="Loading..." />}>
                            <JoinTeam />
                          </Suspense>
                        } />
                        
                        {/* Auth routes - redirect to dashboard if already logged in */}
                        <Route path="/login" element={
                          <AuthRedirect redirectAuthenticated={true} redirectPath="/dashboard">
                            <Suspense fallback={<LoadingState message="Loading..." />}>
                              <Login />
                            </Suspense>
                          </AuthRedirect>
                        } />
                        <Route path="/signup" element={
                          <AuthRedirect redirectAuthenticated={true} redirectPath="/dashboard">
                            <Suspense fallback={<LoadingState message="Loading..." />}>
                              <Signup />
                            </Suspense>
                          </AuthRedirect>
                        } />
                        <Route path="/forgot-password" element={
                          <AuthRedirect redirectAuthenticated={true} redirectPath="/dashboard">
                            <Suspense fallback={<LoadingState message="Loading..." />}>
                              <ForgotPassword />
                            </Suspense>
                          </AuthRedirect>
                        } />
                        <Route path="/reset-password" element={
                          <Suspense fallback={<LoadingState message="Loading..." />}>
                            <ResetPassword />
                          </Suspense>
                        } />
                        <Route path="/verify-email" element={
                          <Suspense fallback={<LoadingState message="Loading..." />}>
                            <VerifyEmail />
                          </Suspense>
                        } />
                        <Route path="/auth/callback" element={
                          <Suspense fallback={<LoadingState message="Loading..." />}>
                            <AuthCallback />
                          </Suspense>
                        } />
                      
                        {/* Protected routes with session handling */}
                        <Route element={<SessionHandler><PrivateRoute /></SessionHandler>}>
                          <Route path="/dashboard" element={
                            <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                              <Suspense fallback={<RouteLoadingFallback />}>
                                <Dashboard />
                              </Suspense>
                            </ErrorBoundary>
                          } />
                          <Route path="/onboarding" element={
                            <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                              <Suspense fallback={<RouteLoadingFallback />}>
                                <UserOnboarding />
                              </Suspense>
                            </ErrorBoundary>
                          } />
                          <Route path="/teams" element={
                            <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                              <Suspense fallback={<RouteLoadingFallback />}>
                                <Teams />
                              </Suspense>
                            </ErrorBoundary>
                          } />
                          <Route path="/team">
                            <Route path="create" element={
                              <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                                <Suspense fallback={<RouteLoadingFallback />}>
                                  <TeamCreate />
                                </Suspense>
                              </ErrorBoundary>
                            } />
                            <Route path="join/:inviteCode" element={
                              <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                                <Suspense fallback={<RouteLoadingFallback />}>
                                  <TeamJoin />
                                </Suspense>
                              </ErrorBoundary>
                            } />
                            <Route path="settings" element={
                              <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                                <Suspense fallback={<RouteLoadingFallback />}>
                                  <TeamSettings />
                                </Suspense>
                              </ErrorBoundary>
                            } />
                            <Route path="pulse" element={
                              <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                                <Suspense fallback={<RouteLoadingFallback />}>
                                  <TeamPulse />
                                </Suspense>
                              </ErrorBoundary>
                            } />
                          </Route>
                          <Route path="/schedule" element={
                            <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                              <Suspense fallback={<RouteLoadingFallback />}>
                                <Schedule />
                              </Suspense>
                            </ErrorBoundary>
                          } />
                          <Route path="/profile/:id" element={
                            <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                              <Suspense fallback={<RouteLoadingFallback />}>
                                <Profile />
                              </Suspense>
                            </ErrorBoundary>
                          } />
                          <Route path="/settings" element={
                            <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                              <Suspense fallback={<RouteLoadingFallback />}>
                                <Settings />
                              </Suspense>
                            </ErrorBoundary>
                          } />
                          <Route path="/design/colors" element={
                            <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                              <Suspense fallback={<RouteLoadingFallback />}>
                                <ColorSystem />
                              </Suspense>
                            </ErrorBoundary>
                          } />
                          <Route path="/rewards" element={
                            <ErrorBoundary FallbackComponent={LazyLoadFallback} onError={handleLazyLoadError}>
                              <Suspense fallback={<RouteLoadingFallback />}>
                                <Rewards />
                              </Suspense>
                            </ErrorBoundary>
                          } />
                        </Route>

                        {/* 404 Catch-all */}
                        <Route path="*" element={
                          <Suspense fallback={<LoadingState message="Loading..." />}>
                            <NotFound />
                          </Suspense>
                        } />
                      </Routes>
                      <Toaster />
                    </SessionManager>
                  </AuthErrorHandler>
                </ScheduleProvider>
              </TeamProvider>
            </SidebarProvider>
          </ThemeProvider>
        </BrowserRouter>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;