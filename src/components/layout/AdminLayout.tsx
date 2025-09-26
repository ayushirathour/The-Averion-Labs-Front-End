import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/analytics', label: 'Analytics' },
    { path: '/admin/system', label: 'System' },
    { path: '/admin/credits', label: 'Credits' }
  ];

  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`bg-white shadow-sm border-r border-gray-200 ${open ? 'w-64' : 'w-16'} transition-all duration-300`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className={`flex items-center space-x-2 ${!open && 'hidden'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="mt-4 px-2">
          {adminMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium mb-1 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <span className={`${!open && 'mx-auto'}`}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className={`${!open && 'hidden'} bg-gray-50 rounded-lg p-3`}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full text-left text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
