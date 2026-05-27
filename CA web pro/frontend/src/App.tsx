import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ─── Public pages ────────────────────────────────────────────────────────────
const LandingPage  = React.lazy(() => import('./pages/LandingPage'));
const Login        = React.lazy(() => import('./pages/Login'));
const Register     = React.lazy(() => import('./pages/Register'));

// ─── CA Interface ─────────────────────────────────────────────────────────
const CALayout          = React.lazy(() => import('./pages/ca/CALayout'));
const CADashboard       = React.lazy(() => import('./pages/ca/CADashboard'));
const ClientManagement  = React.lazy(() => import('./pages/ca/ClientManagement'));
const ServiceRequests   = React.lazy(() => import('./pages/ca/ServiceRequests'));
const CADocuments       = React.lazy(() => import('./pages/ca/CADocuments'));
const CATaskManager     = React.lazy(() => import('./pages/ca/CATaskManager'));
const CAMessages        = React.lazy(() => import('./pages/ca/CAMessages'));
const CASettings        = React.lazy(() => import('./pages/ca/CASettings'));

// ─── User Interface ───────────────────────────────────────────────────────
const UserLayout       = React.lazy(() => import('./pages/user/UserLayout'));
const UserDashboard    = React.lazy(() => import('./pages/user/UserDashboard'));
const RequestService   = React.lazy(() => import('./pages/user/RequestService'));
const UserDocuments    = React.lazy(() => import('./pages/user/UserDocuments'));
const RequestTracking  = React.lazy(() => import('./pages/user/RequestTracking'));
const UserMessages     = React.lazy(() => import('./pages/user/UserMessages'));
const UserProfile      = React.lazy(() => import('./pages/user/UserProfile'));
const FindCA           = React.lazy(() => import('./pages/user/FindCA'));

const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
    <div className="loading-spinner" />
  </div>
);

// Guard: must be logged in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Guard: only CA
const CARoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ca') return <Navigate to="/user/dashboard" replace />;
  return <>{children}</>;
};

// Guard: only User
const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'user') return <Navigate to="/ca/dashboard" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();

  // After login, redirect to correct dashboard based on role
  const dashboardRedirect = user
    ? user.role === 'ca'
      ? <Navigate to="/ca/dashboard" replace />
      : <Navigate to="/user/dashboard" replace />
    : null;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"         element={user ? dashboardRedirect : <LandingPage />} />
        <Route path="/login"    element={user ? dashboardRedirect : <Login />} />
        <Route path="/register" element={user ? dashboardRedirect : <Register />} />

        {/* ── CA Dashboard ── */}
        <Route path="/ca" element={<CARoute><CALayout /></CARoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CADashboard />} />
          <Route path="clients"   element={<ClientManagement />} />
          <Route path="requests"  element={<ServiceRequests />} />
          <Route path="documents" element={<CADocuments />} />
          <Route path="tasks"     element={<CATaskManager />} />
          <Route path="messages"  element={<CAMessages />} />
          <Route path="settings"  element={<CASettings />} />
        </Route>

        {/* ── User Dashboard ── */}
        <Route path="/user" element={<UserRoute><UserLayout /></UserRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"  element={<UserDashboard />} />
          <Route path="services"   element={<RequestService />} />
          <Route path="documents"  element={<UserDocuments />} />
          <Route path="tracking"   element={<RequestTracking />} />
          <Route path="messages"   element={<UserMessages />} />
          <Route path="profile"    element={<UserProfile />} />
          <Route path="find-ca"    element={<FindCA />} />
        </Route>

        {/* Legacy /dashboard redirect */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            {user?.role === 'ca'
              ? <Navigate to="/ca/dashboard" replace />
              : <Navigate to="/user/dashboard" replace />}
          </ProtectedRoute>
        } />

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
