import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  BarChart3,
  Upload,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/helpers';

const NavigationBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const baseNavigation = [
    { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: BarChart3 },
    { name: 'Upload', href: ROUTES.UPLOAD, icon: Upload },
    { name: 'Payment', href: ROUTES.PAYMENT, icon: CreditCard },
  ];

  const navigation = user?.role === 'admin'
    ? [...baseNavigation, { name: 'Admin', href: '/admin', icon: Shield }]
    : baseNavigation;

  const handleLogout = async () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to={ROUTES.DASHBOARD} 
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AL</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  Averion Labs
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      )
                    }
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              <div className="hidden sm:flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                <CreditCard size={16} />
                <span>{user?.credits || 0} credits</span>
              </div>

              {/* Desktop Profile Dropdown */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0] || 'User'}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5"
                    >
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t"
            >
              <div className="px-4 pt-2 pb-4 space-y-1">
                {/* Mobile Credits */}
                <div className="sm:hidden flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium mb-2">
                  <CreditCard size={16} />
                  <span>{user?.credits || 0} credits</span>
                </div>

                {/* Mobile Navigation Links */}
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors',
                          isActive
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )
                      }
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}

                {/* Mobile Profile Section */}
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  
                  <Link
                    to="/settings"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <Settings size={20} />
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <LogOut size={20} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-20 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};

export default NavigationBar;
