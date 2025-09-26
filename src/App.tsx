import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Results from './pages/Results';
import { Layout } from './components/layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AIAssistant from './components/AIAssistant';


// Page imports
import {
  Login,
  Register,
  Dashboard,
  Upload,
  Payment,
  Settings,
  GoogleAuthCallback,
  ForgotPassword,
  ResetPassword
} from './pages';

// Admin imports
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSystem from './pages/admin/AdminSystem';
import AdminCredits from './pages/admin/AdminCredits';
import AdminMonitoring from './pages/AdminMonitoring';

// Batch imports
import BatchUpload from './pages/BatchUpload';
import BatchResults from './pages/BatchResults';

// Route guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';




const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* BACKWARDS COMPATIBILITY REDIRECTS */}
              <Route path="/single-analysis" element={<Navigate to="/upload" replace />} />
              <Route path="/batch-processing" element={<Navigate to="/batch-upload" replace />} />

              {/* PROTECTED USER ROUTES */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/results/:id" element={<Results />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/batch-upload" element={<BatchUpload />} />
                <Route path="/batch-results/:id" element={<BatchResults />} />
              </Route>

              {/* ADMIN ROUTES */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="system" element={<AdminSystem />} />
                <Route path="credits" element={<AdminCredits />} />
                <Route path="monitoring" element={<AdminMonitoring />} />
              </Route>

              {/* DEFAULT ROUTES */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <AIAssistant />
            
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                },
              }} 
            />
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
          </div>
        </Router>
      </AuthProvider>
      </QueryClientProvider>
      
    );

}
      
export default App;
