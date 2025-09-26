import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Shield,
  Database,
  AlertTriangle
} from 'lucide-react';
import { adminService } from '@/services/admin';
import { useAuth } from '@/contexts/AuthContext';

interface AdminStats {
  total_users: number;
  total_predictions: number;
  revenue: number;
  active_sessions: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  credits: number;
  last_login: string;
  is_active: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsData, usersData] = await Promise.all([
          adminService.getSystemStats(),
          adminService.getRecentUsers()
        ]);
        
        setStats(statsData);
        setRecentUsers(usersData.users || []);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError('Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and user management.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-600 font-medium">Admin Access</span>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.total_users.toLocaleString()}
            icon={Users}
            color="bg-blue-100 text-blue-600"
          />
          
          <StatCard
            title="Total Predictions"
            value={stats.total_predictions.toLocaleString()}
            icon={Activity}
            color="bg-green-100 text-green-600"
          />
          
          <StatCard
            title="Revenue"
            value={`₹${stats.revenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-purple-100 text-purple-600"
          />
          
          <StatCard
            title="Active Sessions"
            value={stats.active_sessions}
            icon={TrendingUp}
            color="bg-orange-100 text-orange-600"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          
          {recentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                      User
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                      Credits
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                      Last Login
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentUsers.slice(0, 5).map((user) => (
                    <tr key={user.id}>
                      <td className="py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-2 text-sm text-gray-900">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          User
                        </span>
                      </td>
                      <td className="py-2 text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2 text-sm text-gray-900">
                        {user.credits}
                      </td>
                      <td className="py-2 text-sm text-gray-500">
                        {user.last_login ? formatRelativeTime(user.last_login) : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              No users found
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <Settings className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Users className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Manage Users</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Activity className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">System Monitoring</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Database className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Analytics</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
