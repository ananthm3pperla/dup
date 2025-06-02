import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ScheduleProvider } from "./contexts/ScheduleContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import AuthCallback from "./pages/auth/AuthCallback";
import JoinTeam from "./pages/join-team";
import Dashboard from "./pages/Dashboard";
import UserOnboarding from "./pages/UserOnboarding";
import Schedule from "./pages/Schedule";
import TeamPulse from "./pages/TeamPulse";
import Teams from "./pages/Teams";
import CreateTeam from "./pages/team/Create";
import JoinTeamPage from "./pages/team/Join";
import TeamSettings from "./pages/team/Settings";
import Rewards from "./pages/Rewards";
import Games from "./pages/Games";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import AppErrorBoundary from "./components/error/AppErrorBoundary";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ScheduleProvider>
            <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/join-team" element={<JoinTeam />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <PrivateRoute>
                    <Layout>
                      <UserOnboarding />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/schedule"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Schedule />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/team-pulse"
                element={
                  <PrivateRoute>
                    <Layout>
                      <TeamPulse />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/teams"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Teams />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/teams/create"
                element={
                  <PrivateRoute>
                    <Layout>
                      <CreateTeam />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/teams/join"
                element={
                  <PrivateRoute>
                    <Layout>
                      <JoinTeamPage />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/teams/settings"
                element={
                  <PrivateRoute>
                    <Layout>
                      <TeamSettings />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/rewards"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Rewards />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/games"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Games />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          </ScheduleProvider>
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;