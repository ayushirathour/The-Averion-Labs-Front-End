import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  Settings,
  LogOut,
  CreditCard,
  Upload,
  BarChart3,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/constants';
import { Button } from '@/components/ui';
import { cn } from '@/utils/helpers';

const Header: React.FC = () => {
  const [, forceUpdate] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    console.log('Header user data:', user);
    console.log('Header user credits:', user?.credits);
    console.log('Profile picture:', user?.profile_picture);
  }, [user]);

  React.useEffect(() => {
    console.log('Header credits changed, forcing re-render:', user?.credits);
    forceUpdate(prev => prev + 1);
  }, [user?.credits]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const baseNavigation = [
    { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: BarChart3 },
    { name: 'Upload', href: ROUTES.UPLOAD, icon: Upload },
    { name: 'Payment', href: ROUTES.PAYMENT, icon: CreditCard },
  ];

  const navigation = user?.role === 'admin'
    ? [...baseNavigation, { name: 'Admin', href: '/admin', icon: Shield }]
    : baseNavigation;

  if (!isAuthenticated) return null;

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to={ROUTES.DASHBOARD} className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Averion Labs</span>
                </div>
              </Link>

              <nav className="hidden lg:flex space-x-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <CreditCard className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {user?.credits || 0} Credits
                </span>
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role || 'user'}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.name || 'User'}
                        </div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>

                      <div className="sm:hidden px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <CreditCard className="h-4 w-4 text-blue-500" />
                          <span>{user?.credits || 0} Credits</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to={ROUTES.SETTINGS}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200 shadow-lg"
            >
              <div className="px-4 py-4 space-y-2">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border mb-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <CreditCard className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {user?.credits || 0} Credits
                  </span>
                </div>

                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )
                    }
                    onClick={closeMobileMenu}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}

                <hr className="my-4" />

                <Link
                  to={ROUTES.SETTINGS}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
