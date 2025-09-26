import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import authService from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../utils/constants';
import toast from 'react-hot-toast';

interface GoogleAuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id?: string;
    username: string;
    email: string;
    name: string;
    role: string;
    credits: number;
    profile_picture?: string;
    plan?: string;
    member_since?: string;
  };
  token_type?: string;
  message?: string;
}

const GoogleAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing your Google sign-in...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Google');
        }

        setMessage('Verifying your Google account...');

        const response = await authService.handleGoogleCallback(code) as GoogleAuthResponse;

        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }

        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }

        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        setMessage('Updating your profile...');
        await refreshUser();

        setStatus('success');
        setMessage('Welcome to Averion Labs!');
        toast.success('Successfully signed in with Google!');

        const userRole = response.user?.role || 'user';

        setTimeout(() => {
          navigate(ROUTES.DASHBOARD, { replace: true });
        }, 800);

      } catch (error: any) {
        setStatus('error');
        setMessage('Google sign-in failed. Please try again.');
        toast.error('Google sign-in failed. Please try again.');

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        setTimeout(() => {
          navigate(ROUTES.LOGIN, { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4"
      >
        <div className="mb-6">
          {status === 'processing' && (
            <Loader2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          )}
          {status === 'error' && (
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {message}
        </h2>

        {status === 'processing' && (
          <p className="text-gray-600 text-sm">
            Processing your authentication...
          </p>
        )}

        {status === 'error' && (
          <p className="text-gray-600 text-sm">
            Redirecting to login page...
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleAuthCallback;
