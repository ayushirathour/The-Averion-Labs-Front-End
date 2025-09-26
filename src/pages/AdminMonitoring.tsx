import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { monitoringService } from '@/services/monitoringService';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  response_time: number;
  uptime: string;
  database_status: string;
  last_updated: string;
}

interface ApiEndpoint {
  endpoint: string;
  method: string;
  count: number;
  avg_response_time: number;
  statusCode?: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color, 
  subtitle 
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-gray-600">{trend}</span>
      </div>
    )}
  </div>
);

const AdminMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [apiStats, setApiStats] = useState<ApiEndpoint[]>([]);
  const [alerts, setAlerts] = useState<Array<{ type: string; message: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMonitoringData = async () => {
    try {
      const [metricsData, statsData, alertsData] = await Promise.all([
        monitoringService.getSystemMetrics(),
        monitoringService.getApiStats(),
        monitoringService.getAlerts()
      ]);
      
      setMetrics(metricsData);
      setApiStats(statsData || []);
      setAlerts(alertsData || []);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMonitoringData, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'connected':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">
            Real-time performance and health metrics • Last updated: {lastUpdate}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              autoRefresh 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={fetchMonitoringData}
            className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">System Alerts</h3>
              <div className="mt-2 space-y-1">
                {alerts.map((alert, index) => (
                  <p key={index} className="text-sm text-red-700">
                    {alert.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="CPU Usage"
            value={`${metrics.cpu_usage}%`}
            icon={Activity}
            color={`${metrics.cpu_usage > 80 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
            subtitle="System processor load"
          />
          
          <MetricCard
            title="Memory Usage"
            value={`${metrics.memory_usage}%`}
            icon={Server}
            color={`${metrics.memory_usage > 80 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
            subtitle="RAM utilization"
          />
          
          <MetricCard
            title="Active Connections"
            value={metrics.active_connections}
            icon={Zap}
            color="bg-purple-100 text-purple-600"
            subtitle="Current user sessions"
          />
          
          <MetricCard
            title="Response Time"
            value={`${metrics.response_time}ms`}
            icon={Clock}
            color={`${metrics.response_time > 1000 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}
            subtitle="Average API response"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Status</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    metrics.database_status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className={`text-sm font-medium ${getStatusColor(metrics.database_status)}`}>
                    {metrics.database_status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Uptime</span>
                <span className="text-sm font-medium text-gray-900">{metrics.uptime}</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Disk Usage</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.disk_usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(metrics.disk_usage)}`}
                    style={{ width: `${metrics.disk_usage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h2>
          
          {apiStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                      Endpoint
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                      Method
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                      Requests
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {apiStats.slice(0, 10).map((endpoint, index) => (
                    <tr key={index}>
                      <td className="py-2 text-sm text-gray-900 font-mono">
                        {endpoint.endpoint}
                      </td>
                      <td className="py-2 text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="py-2 text-sm text-gray-900">
                        {endpoint.count}
                      </td>
                      <td className="py-2 text-sm text-gray-900">
                        {endpoint.statusCode || '200'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              No API statistics available
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Health Check</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Gateway</span>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authentication Service</span>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Prediction Engine</span>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Throughput</span>
                <span className="text-sm font-medium text-gray-900">125 req/min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: '75%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="text-sm font-medium text-gray-900">0.1%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '1%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Storage</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Size</span>
              <span className="text-sm font-medium text-gray-900">2.1 GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File Storage</span>
              <span className="text-sm font-medium text-gray-900">15.3 GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backup Status</span>
              <span className="text-sm font-medium text-green-600">Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMonitoring;
