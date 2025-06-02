import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { ThemeContext } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import Teams from './pages/Teams';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';
import { AppErrorBoundary } from './components/error/AppErrorBoundary';

function App() {
  return (
    <AppErrorBoundary>
      <ThemeContext>
        <AuthContext>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/profile" element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/schedule" element={
                <PrivateRoute>
                  <Layout>
                    <Schedule />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/teams" element={
                <PrivateRoute>
                  <Layout>
                    <Teams />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/settings" element={
                <PrivateRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </PrivateRoute>
              } />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthContext>
      </ThemeContext>
    </AppErrorBoundary>
  );
}

export default App;