import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load all pages for code splitting (reduces initial bundle size)
const AppLayout = React.lazy(() => import('./components/layout/AppLayout'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Calculators = React.lazy(() => import('./pages/Calculators'));
const Documents = React.lazy(() => import('./pages/Documents'));
const Reports = React.lazy(() => import('./pages/Reports'));
const TaskManager = React.lazy(() => import('./pages/TaskManager'));
const NewsUpdates = React.lazy(() => import('./pages/NewsUpdates'));
const Messages = React.lazy(() => import('./pages/Messages'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));

const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="loading-spinner" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="calculators" element={<Calculators />} />
          <Route path="documents" element={<Documents />} />
          <Route path="reports" element={<Reports />} />
          <Route path="tasks" element={<TaskManager />} />
          <Route path="news" element={<NewsUpdates />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<div style={{ padding: '2rem' }}><h2>Settings</h2><p className="text-muted">Coming soon...</p></div>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
