import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import authService from '../../services/auth';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const glassmorphicStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  };

  const backgroundStyle = {
    backgroundImage: `url('/images/averion-hero.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const userRole = user?.role;
      if (userRole === 'admin') {
        toast.success('Welcome back, Admin!');
        navigate('/admin', { replace: true });
      } else {
        toast.success('Login successful!');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please try again.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    setError('');

    try {
      await authService.forgotPassword({ email: forgotEmail });
      setForgotSuccess(true);
      toast.success('Password reset link sent to your email!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to send reset email';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsForgotLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setError('');
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const status = await authService.checkGoogleStatus();
      
      if (!status.available) {
        throw new Error('Google authentication is not available');
      }

      const { login_url } = await authService.initiateGoogleLogin();
      window.location.href = login_url;
    } catch (err: any) {
      let errorMessage = 'Google login failed. Please try again.';
      
      if (err.response?.status === 404) {
        errorMessage = 'Google login temporarily unavailable. Please use regular login.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (forgotSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={backgroundStyle}>
        <div className="w-full max-w-md p-8 m-4" style={glassmorphicStyle}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to
              <br />
              <strong>{forgotEmail}</strong>
            </p>
            <Button
              onClick={resetForgotPassword}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Back to Login
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={backgroundStyle}>
      <div className="w-full max-w-md p-8 m-4" style={glassmorphicStyle}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <img
              src="/images/averion-logo.png"
              alt="Averion Labs"
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">
            {showForgotPassword 
              ? 'Enter your email address and we\'ll send you a reset link'
              : 'Sign in to your Averion Labs account'
            }
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isForgotLoading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isForgotLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={resetForgotPassword}
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Username or Email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <img src="/images/google-logo.png" alt="Google" className="w-5 h-5 mr-2" />
              {isGoogleLoading ? 'Connecting...' : 'Google'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          Averion Labs - Clinical-grade AI for Medical Screening
        </div>
      </div>
    </div>
  );
};

export default Login;
