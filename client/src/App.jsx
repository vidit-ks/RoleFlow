import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { TeamManagement } from './pages/admin/TeamManagement';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';

// Manager Pages
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { TeamTasksPage } from './pages/manager/TeamTasksPage';
import { TeamMembersPage } from './pages/manager/TeamMembersPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MyTasksPage } from './pages/employee/MyTasksPage';

// Shared Pages
import { ProfilePage } from './pages/shared/ProfilePage';
import { NotFoundPage } from './pages/shared/NotFoundPage';

// Smart Home Index Redirector based on authenticated user's role
const RoleIndexRedirect = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Root smart redirect */}
            <Route path="/" element={<RoleIndexRedirect />} />

            {/* Protected App Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Admin Scoped Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/teams"
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <TeamManagement />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/activity"
                element={
                  <RoleRoute allowedRoles={['admin']}>
                    <ActivityLogsPage />
                  </RoleRoute>
                }
              />

              {/* Manager Scoped Routes */}
              <Route
                path="/manager/dashboard"
                element={
                  <RoleRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/manager/tasks"
                element={
                  <RoleRoute allowedRoles={['manager']}>
                    <TeamTasksPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/manager/team"
                element={
                  <RoleRoute allowedRoles={['manager']}>
                    <TeamMembersPage />
                  </RoleRoute>
                }
              />

              {/* Employee Scoped Routes */}
              <Route
                path="/employee/dashboard"
                element={
                  <RoleRoute allowedRoles={['employee']}>
                    <EmployeeDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/employee/tasks"
                element={
                  <RoleRoute allowedRoles={['employee']}>
                    <MyTasksPage />
                  </RoleRoute>
                }
              />

              {/* Shared Protected Routes */}
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
