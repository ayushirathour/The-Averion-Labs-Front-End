import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  FileText, 
  Upload, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/user';
import { predictionService } from '@/services/prediction';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface DashboardStats {
  total_predictions: number;
  this_week_predictions: number;
  accuracy_rate: number;
  credits_used_this_month: number;
  recent_predictions: Array<{
    id: string;
    filename: string;
    prediction: string;
    confidence: number;
    created_at: string;
  }>;
}

interface BatchLimits {
  maxFiles: number;
  maxBatchesPerDay: number;
  description: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [batchLimits, setBatchLimits] = useState<BatchLimits>({
    maxFiles: 10,
    maxBatchesPerDay: 5,
    description: "Process multiple images simultaneously"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, limits] = await Promise.all([
          userService.getDashboardStats(),
          predictionService.getBatchLimits()
        ]);
        
        setStats(dashboardStats);
        if (limits) setBatchLimits(limits);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickStats = [
    {
      name: 'Total Analyses',
      value: stats?.total_predictions || 0,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'This Week',
      value: stats?.this_week_predictions || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Accuracy Rate',
      value: `${stats?.accuracy_rate || 94}%`,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      name: 'Credits Used',
      value: stats?.credits_used_this_month || 0,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Preparing your medical AI analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error || 'Something went wrong. Please try again.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Doctor'}
        </h1>
        <p className="text-gray-600">
          Here's your medical AI analysis overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/upload"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Single Upload</h3>
                  <p className="text-sm text-gray-600">Analyze one medical image</p>
                </div>
              </Link>

              <Link 
                to="/batch-upload"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Batch Processing</h3>
                  <p className="text-sm text-gray-600">
                    {batchLimits.description} • Up to {batchLimits.maxFiles} files per batch
                  </p>
                </div>
              </Link>

              <Link 
                to="/results"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">View Results</h3>
                  <p className="text-sm text-gray-600">Access your analysis history</p>
                </div>
              </Link>

              <Link 
                to="/payment"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Buy Credits</h3>
                  <p className="text-sm text-gray-600">Purchase analysis credits</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Credits</h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {user?.credits || 0}
              </div>
              <p className="text-sm text-gray-600 mb-4">Credits remaining</p>
              <Link to="/payment">
                <Button className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase Credits
                </Button>
              </Link>
            </div>
          </Card>

          {stats?.recent_predictions && stats.recent_predictions.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Analyses</h2>
              <div className="space-y-3">
                {stats.recent_predictions.slice(0, 3).map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {prediction.filename}
                      </p>
                      <p className="text-xs text-gray-600">
                        {prediction.confidence}% confidence
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {new Date(prediction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/results" className="block mt-4">
                <Button variant="outline" className="w-full text-sm">
                  View All Results
                </Button>
              </Link>
            </Card>
          )}

          {(!stats?.recent_predictions || stats.recent_predictions.length === 0) && (
            <Card className="p-6 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">Get Started</h3>
              <p className="text-xs text-gray-600 mb-4">
                Upload your first medical image to get started
              </p>
              <Link to="/upload">
                <Button className="text-sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Start Analysis
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              AI analyses are for informational purposes only. Always consult healthcare professionals for medical decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
