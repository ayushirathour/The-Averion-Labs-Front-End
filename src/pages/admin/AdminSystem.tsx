import React, { useState, useEffect } from 'react';

const AdminSystem: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock system health check
    setTimeout(() => {
      setSystemHealth({
        database: 'healthy',
        api_status: 'running',
        uptime: '24h 30m',
        memory_usage: '45%'
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Health</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Database Status</h3>
          <p className="text-2xl font-bold text-green-600">● Connected</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">API Status</h3>
          <p className="text-2xl font-bold text-green-600">● Running</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">System Uptime</h3>
          <p className="text-2xl font-bold text-blue-600">{systemHealth.uptime}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Memory Usage</h3>
          <p className="text-2xl font-bold text-orange-600">{systemHealth.memory_usage}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSystem;
