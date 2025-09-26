import api from './api';

export interface ParsedMetrics {
  httpRequests: {
    endpoint: string;
    method: string;
    count: number;
    avgDuration: number;
    statusCode: string;
  }[];
  systemResources: {
    memoryUsage: number;
    virtualMemory: number;
    cpuTime: number;
    openFiles: number;
  };
  businessMetrics: {
    totalUsers: number;
    totalPredictions: number;
    activeUsers: number;
    batchPredictions: number;
  };
  timestamp: string;
}

export const parsePrometheusMetrics = (text: string): ParsedMetrics => {
  const lines = text.trim().split('\n');
  const metrics: Record<string, any[]> = {};

  // Parse Prometheus format
  lines.forEach(line => {
    if (line.startsWith('#') || !line.trim()) return;

    const spaceIndex = line.lastIndexOf(' ');
    const metricPart = line.substring(0, spaceIndex);
    const value = parseFloat(line.substring(spaceIndex + 1));
    const braceIndex = metricPart.indexOf('{');
    const metricName = braceIndex === -1 ? metricPart : metricPart.substring(0, braceIndex);

    if (!metrics[metricName]) metrics[metricName] = [];

    // Parse labels if present
    let labels = {};
    if (braceIndex !== -1) {
      const labelStr = metricPart.substring(braceIndex + 1, metricPart.length - 1);
      const labelPairs = labelStr.split(',');
      labelPairs.forEach(pair => {
        const [key, val] = pair.split('=');
        if (key && val) {
          labels[key] = val.replace(/"/g, '');
        }
      });
    }

    metrics[metricName].push({ value, labels });
  });

  // Transform into structured data
  const httpRequests = (metrics['averionlabs_http_requests_total'] || []).map(m => ({
    endpoint: m.labels.endpoint || 'unknown',
    method: m.labels.method || 'GET',
    count: m.value,
    statusCode: m.labels.status_code || '200',
    avgDuration: 0
  }));

  return {
    httpRequests,
    systemResources: {
      memoryUsage: (metrics['process_resident_memory_bytes']?.[0]?.value || 0) / (1024 * 1024), // MB
      virtualMemory: (metrics['process_virtual_memory_bytes']?.[0]?.value || 0) / (1024 * 1024 * 1024), // GB
      cpuTime: metrics['process_cpu_seconds_total']?.[0]?.value || 0,
      openFiles: metrics['process_open_fds']?.[0]?.value || 0
    },
    businessMetrics: {
      totalUsers: 0, // Will be filled from health endpoint
      totalPredictions: 0,
      activeUsers: metrics['averionlabs_active_users_current']?.[0]?.value || 0,
      batchPredictions: 0
    },
    timestamp: new Date().toISOString()
  };
};

export const monitoringService = {
  async fetchMetrics(): Promise<ParsedMetrics> {
    const [metricsResponse, healthResponse] = await Promise.all([
      api.get('/metrics', { headers: { 'Accept': 'text/plain' } }),
      api.get('/health/database')
    ]);

    const parsedMetrics = parsePrometheusMetrics(metricsResponse.data);

    // Enrich with health data
    const healthData = healthResponse.data;
    parsedMetrics.businessMetrics.totalUsers = healthData.collections.users_count;
    parsedMetrics.businessMetrics.totalPredictions = healthData.collections.predictions_count;
    parsedMetrics.businessMetrics.batchPredictions = healthData.collections.batch_predictions_count;

    return parsedMetrics;
  },

  async fetchSystemHealth() {
    const [health, monitoring] = await Promise.all([
      api.get('/health'),
      api.get('/monitoring/status')
    ]);

    return {
      health: health.data,
      monitoring: monitoring.data
    };
  }
};
