import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingFallback from './components/LoadingFallback';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Team = React.lazy(() => import('./pages/Team'));
const Profile = React.lazy(() => import('./components/Profile'));
const Schedule = React.lazy(() => import('./pages/Schedule'));
const Settings = React.lazy(() => import('./pages/Settings'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route
        path="/team"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Team />
          </Suspense>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Profile />
          </Suspense>
        }
      />
      <Route
        path="/profile"
        element={<Navigate to="/team" replace />}
      />
      <Route
        path="/schedule"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Schedule />
          </Suspense>
        }
      />
      <Route
        path="/settings"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        }
      />
    </Routes>
  );
} 