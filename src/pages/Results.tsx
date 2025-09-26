import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Download, 
  ChevronLeft, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Share2, 
  RefreshCw,
  TrendingUp,
  Zap,
  Shield,
  Calendar
} from 'lucide-react';
import { predictionService } from '@/services/prediction';
import { reportDataService } from '@/services/reportDataService';
import PredictionAnalysisButton from '@/components/results/PredictionAnalysisButton';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/constants';
import { PDFReportGenerator } from '@/components/reports/PDFReportGenerator';
import toast from 'react-hot-toast';

interface PredictionResult {
  id: string;
  filename: string;
  prediction: string;
  confidence: number;
  model_type: string;
  status: string;
  created_at: string;
  analysis?: string;
  recommendation?: string;
  image_url?: string;
  credits_used: number;
}

const MAX_POLLING_ATTEMPTS = 20;
const POLLING_INTERVAL = 3000;

const Results: React.FC = () => {
  const { predictionId } = useParams<{ predictionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (!predictionId) {
      setError('No prediction ID provided');
      setLoading(false);
      return;
    }

    let pollInterval: NodeJS.Timeout;
    
    const pollResults = async () => {
      try {
        const data = await predictionService.getResult(predictionId);
        setResult(data.result);
        setStatus(data.status);
        
        if (data.result?.status === 'completed' || data.result?.status === 'failed') {
          clearInterval(pollInterval);
          setLoading(false);
        } else if (pollingCount >= MAX_POLLING_ATTEMPTS) {
          clearInterval(pollInterval);
          setError('Analysis timed out. Please try again.');
          setLoading(false);
        } else {
          setPollingCount(prev => prev + 1);
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to fetch results');
        setLoading(false);
        clearInterval(pollInterval);
      }
    };

    pollResults();
    pollInterval = setInterval(pollResults, POLLING_INTERVAL);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [predictionId, pollingCount]);

  const handleDownloadReport = async () => {
    if (!result) return;

    try {
      setGeneratingReport(true);
      const reportData = await reportDataService.generateReport(result.id);
      
      const generator = new PDFReportGenerator();
      await generator.generateReport(reportData);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your session...</h2>
            <p className="text-gray-600 mb-4">
              Our AI is carefully examining your medical image. This process typically takes 30-60 seconds.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">
                  {pollingCount}/{MAX_POLLING_ATTEMPTS} checks completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Analysis Error</h2>
          </div>
          <p className="text-red-700 mb-4">
            {error || "We're sorry, but the analysis could not be completed. Please try again."}
          </p>
          <div className="flex space-x-3">
            <Link 
              to="/upload" 
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </Link>
            <Link 
              to="/dashboard" 
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-gray-600">Unable to find the requested analysis results.</p>
        </div>
      </div>
    );
  }

  const { model_type } = result;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/upload" 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>New Analysis</span>
          </Link>
        </div>
        
        {result.status === 'completed' && (
          <button
            onClick={handleDownloadReport}
            disabled={generatingReport}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{generatingReport ? 'Generating...' : 'Download Report'}</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg font-semibold">Analysis Complete</span>
              </div>
              <h1 className="text-2xl font-bold mb-1">
                Your medical image has been successfully analyzed by our advanced AI system
              </h1>
              <p className="text-blue-100">
                AI-powered medical analysis
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Analysis Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">File Name</span>
                    <span className="text-sm font-medium text-gray-900">{result.filename}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Analysis Type</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {model_type.replace('_', ' ')} Detection
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Date & Time</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(result.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Credits Used</span>
                    <span className="text-sm font-medium text-gray-900">{result.credits_used}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Prediction Result</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(result.status)}`}>
                    {result.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Prediction</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.prediction.toLowerCase().includes('positive') || 
                        result.prediction.toLowerCase().includes('detected')
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.prediction}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Confidence Level</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getConfidenceColor(result.confidence)}`}>
                        {result.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {result.recommendation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Recommendation</h3>
                  <p className="text-sm text-blue-800">{result.recommendation}</p>
                  
                  {model_type === 'skin_cancer' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <p className="text-sm text-red-800">
                          <strong>Important:</strong> Melanoma and Basal Cell Carcinoma require immediate medical evaluation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {result.image_url && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Analyzed Image</h3>
                  <div className="relative">
                    <img 
                      src={result.image_url} 
                      alt="Analyzed medical image" 
                      className="w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {result.analysis && (
                <PredictionAnalysisButton 
                  analysis={result.analysis}
                  filename={result.filename}
                />
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="text-sm font-semibold text-green-900">Model Information</h3>
                </div>
                <p className="text-sm text-green-800">
                  {model_type === 'pneumonia' 
                    ? 'Validated on pediatric patients (1-5 years) with 96.4% sensitivity for pneumonia detection.' 
                    : 'Advanced multi-class skin lesion classifier. Professional dermatological consultation recommended.'
                  }
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  <Link 
                    to="/upload" 
                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Analyze Another Image
                  </Link>
                  <Link 
                    to="/results" 
                    className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 text-sm"
                  >
                    View All Results
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 mb-1">Medical Disclaimer</h3>
            <p className="text-sm text-yellow-700">
              {status?.medical_disclaimer || (
                model_type === 'skin_cancer' 
                  ? "This AI screening tool is designed for informational and educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified dermatologist or healthcare professional for proper evaluation of any skin concerns."
                  : "This AI analysis is provided for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare professionals with any questions regarding medical conditions."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
