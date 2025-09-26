// src/pages/auth/Register.tsx - GLASSMORPHIC VERSION
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

// ✅ PASSWORD VALIDATION FUNCTION (unchanged)
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }
  
  return null; // Password is valid
};

// ✅ UPDATED: Password Strength Indicator with glassmorphic styling
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const requirements = [
    { test: /.{8,}/, label: 'At least 8 characters' },
    { test: /[A-Z]/, label: 'One uppercase letter (A-Z)' },
    { test: /[a-z]/, label: 'One lowercase letter (a-z)' },
    { test: /[0-9]/, label: 'One number (0-9)' },
    { test: /[!@#$%^&*(),.?":{}|<>]/, label: 'One special character (!@#$%*)' }
  ];

  return (
    <div className="mt-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
      <div className="text-sm font-medium text-white mb-3">Password Requirements:</div>
      <div className="space-y-2">
        {requirements.map((req, index) => {
          const isValid = req.test.test(password);
          return (
            <div key={index} className={`text-xs flex items-center space-x-2 ${
              isValid ? 'text-green-300' : 'text-red-300'
            }`}>
              {isValid ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Glassmorphic styles
  const glassmorphicStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  };

  // ✅ Background container style
  const backgroundStyle = {
    backgroundImage: `url('/images/averion-hero.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };

  // ✅ All your existing logic remains unchanged
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.username || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Strong password validation matching backend
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Username validation
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🚀 Starting registration process...');
      
      await register(formData);
      
      console.log('✅ Registration successful');
      toast.success('🎉 Registration successful! Welcome to Averion Labs!');
      
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const validationError = err.response.data.detail[0];
          if (validationError?.msg) {
            errorMessage = validationError.msg;
          }
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid registration data. Please check your inputs.';
      } else if (err.response?.status === 409 || err.response?.status === 422) {
        errorMessage = 'Username or email already exists, or validation failed.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={backgroundStyle}
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Glassmorphic Register Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-auto p-8"
        style={glassmorphicStyle}
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Glassmorphic User Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-gray-200 text-sm">for AI-powered medical analysis</p>
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg backdrop-blur-sm"
          >
            <p className="text-red-100 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Register Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="space-y-5"
        >
          <div className="space-y-4">
            {/* Full Name Input */}
            <Input
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              icon={<User className="h-5 w-5 text-gray-300" />}
              className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-blue-400/50"
              disabled={isLoading}
            />

            {/* Email Input */}
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              icon={<Mail className="h-5 w-5 text-gray-300" />}
              className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-blue-400/50"
              disabled={isLoading}
            />

            {/* Username Input */}
            <Input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              icon={<User className="h-5 w-5 text-gray-300" />}
              className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-blue-400/50"
              disabled={isLoading}
            />

            {/* Password Input */}
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                icon={<Lock className="h-5 w-5 text-gray-300" />}
                className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-blue-400/50"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <PasswordStrengthIndicator password={formData.password} />
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start space-x-3">
            <input 
              type="checkbox" 
              required
              className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500/50 mt-1" 
            />
            <span className="text-xs text-gray-200 leading-relaxed">
              I agree to the{' '}
              <Link to="/terms" className="text-blue-300 hover:text-blue-200 transition-colors">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-300 hover:text-blue-200 transition-colors">
                Privacy Policy
              </Link>
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600/80 hover:bg-blue-700/80 text-white font-semibold py-3"
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-200 pt-4">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-300 hover:text-blue-200 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </motion.form>

        {/* Branding Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-300">
            <span className="font-semibold">Averion Labs</span> - Clinical-grade AI for Medical Screening
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
