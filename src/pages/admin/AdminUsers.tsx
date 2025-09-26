import React, { useState, useEffect } from 'react';
import { adminService, UserOut } from '@/services/admin'; 

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, csrfData] = await Promise.all([
          adminService.getUsers(),
          adminService.getCsrfToken()
        ]);
        setUsers(usersData.users);
        setCsrfToken(csrfData.csrf_token);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBlockUser = async (username: string, blocked: boolean) => {
    try {
      await adminService.blockUser(username, blocked, csrfToken);
      // Refresh users list
      const usersData = await adminService.getUsers();
      setUsers(usersData.users);
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">Export CSV</button>
          <button className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Create Demo User</button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden responsive-table">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Credits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user: UserOut) => (
              <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4" data-label="User">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4" data-label="Role">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100" data-label="Credits">{user.credits}</td>
                <td className="px-6 py-4" data-label="Status">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium" data-label="Actions">
                  <button
                    onClick={() => handleBlockUser(user.username, !user.is_blocked)}
                    className={`text-sm px-3 py-1 rounded ${
                      user.is_blocked 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {user.is_blocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
