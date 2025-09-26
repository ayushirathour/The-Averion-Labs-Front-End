import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Download, 
  ChevronLeft, 
  FileText, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Image, 
  RefreshCw, 
  TrendingUp, 
  Zap, 
  Calendar 
} from 'lucide-react';
import { batchPredictionService } from '@/services/batchPrediction';
import { reportDataService } from '@/services/reportDataService';
import PredictionAnalysisButton from '@/components/results/PredictionAnalysisButton';
import { BatchResult } from '@/types/batch';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/constants';
import { PDFReportGenerator } from '@/components/reports/PDFReportGenerator';
import toast from 'react-hot-toast';

const ConfidenceBar: React.FC<{ confidence: number }> = ({ confidence }) => {
  const width = Math.min(Math.max(confidence, 0), 100);
  
  const getBarColor = (conf: number) => {
    if (conf >= 90) return 'from-green-400 to-green-600';
    if (conf >= 70) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getTextColor = (conf: number) => {
    if (conf >= 90) return 'text-green-700';
    if (conf >= 70) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Confidence</span>
        <span className={`text-sm font-semibold ${getTextColor(confidence)}`}>
          {confidence.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${getBarColor(confidence)} transition-all duration-500`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

const ResultCard: React.FC<{ 
  result: BatchResult; 
  index: number; 
}> = ({ result, index }) => {
  const getStatusIcon = () => {
    if (result.status === 'completed' && result.prediction) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (result.status === 'failed' || result.error) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    } else {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    if (result.status === 'completed' && result.prediction) return 'border-green-200 bg-green-50';
    if (result.status === 'failed' || result.error) return 'border-red-200 bg-red-50';
    return 'border-yellow-200 bg-yellow-50';
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <h3 className="font-medium text-gray-900 truncate">
            {result.filename || `File ${index + 1}`}
          </h3>
        </div>
        <span className="text-xs text-gray-500">
          {result.file_size ? `${(result.file_size / 1024).toFixed(1)}KB` : 'Processing complete'}
        </span>
      </div>

      {result.status === 'completed' && result.prediction && (
        <div className="space-y-3">
          <div className="bg-white rounded-md p-3 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Prediction</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                result.prediction.toLowerCase().includes('positive') 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {result.prediction}
              </span>
            </div>
            
            {result.confidence !== undefined && (
              <ConfidenceBar confidence={result.confidence} />
            )}
          </div>

          {result.analysis && (
            <PredictionAnalysisButton 
              analysis={result.analysis}
              filename={result.filename || ''}
            />
          )}
        </div>
      )}

      {result.status === 'failed' && (
        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">
              {result.error || 'Processing failed'}
            </span>
          </div>
        </div>
      )}

      {result.status === 'processing' && (
        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
            <span className="text-sm text-yellow-800">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

const BatchResults: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<BatchResult[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchResults = async () => {
    if (!batchId) return;

    try {
      const data = await batchPredictionService.getBatchResults(batchId);
      setResults(data.results || []);
      setSummary(data.summary);
      
      const hasProcessing = data.results?.some((r: BatchResult) => 
        r.status === 'processing' || r.status === 'queued'
      );
      setIsProcessing(hasProcessing);
      
      if (!hasProcessing && pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    } catch (err) {
      console.error('Failed to fetch batch results:', err);
      setError('Failed to load batch results');
    }
  };

  useEffect(() => {
    const initializeResults = async () => {
      setLoading(true);
      await fetchResults();
      setLoading(false);
    };

    initializeResults();
  }, [batchId]);

  useEffect(() => {
    if (isProcessing && !pollingInterval.current) {
      pollingInterval.current = setInterval(fetchResults, 3000);
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isProcessing]);

  const handleDownloadReport = async () => {
    if (!batchId) return;

    try {
      setGeneratingReport(true);
      const reportData = await reportDataService.generateBatchReport(batchId);
      
      const generator = new PDFReportGenerator();
      await generator.generateBatchReport(reportData);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-600 mx-auto animate-spin mb-4" />
            <p className="text-gray-600">Loading batch results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Results</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/batch-upload')}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Start New Batch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/batch-upload" 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Batch Upload</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isProcessing && results.length > 0 && (
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
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Batch Results</h1>
          <span className="text-sm text-gray-500">Batch ID: {batchId}</span>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Files</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {summary?.total_files || 0}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Successful</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {summary?.successful_predictions || 0}
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {summary?.failed_predictions || 0}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Avg Confidence</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {summary?.average_confidence || 0}%
              </p>
            </div>
          </div>
        )}

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <ResultCard 
                key={index} 
                result={result} 
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Your Batch</h3>
            <p className="text-gray-600 mb-4">
              The batch processing completed but no individual results were returned.
            </p>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 mb-1">Report Generation</h3>
            <p className="text-sm text-yellow-700">
              {generatingReport ? (
                <>
                  <RefreshCw className="inline h-4 w-4 animate-spin mr-1" />
                  Generating your detailed PDF report...
                </>
              ) : (
                <>
                  {isProcessing 
                    ? 'Your batch is being processed. This page will automatically update with results.'
                    : 'PDF report will be available once your batch processing is completed.'
                  }
                  {isProcessing && (
                    <RefreshCw className="inline h-4 w-4 animate-spin ml-1" />
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchResults;
