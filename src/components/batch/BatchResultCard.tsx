import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';

interface BatchResultCardProps {
  batchResult: {
    batch_id: string;
    status: string;
    timestamp: string;
    model_type: string;
    results: Array<{
      filename: string;
      prediction: string;
      confidence: number;
      status: string;
    }>;
    summary: {
      total_files: number;
      successful_predictions: number;
      failed_predictions: number;
      average_confidence: number;
    };
  };
  onDownload?: () => void;
  onNewBatch?: () => void;
}

export const BatchResultCard: React.FC<BatchResultCardProps> = ({
  batchResult,
  onDownload,
  onNewBatch
}) => {
  const [error, setError] = useState<string | null>(null);
  const { summary } = batchResult;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'processing':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const handleDownload = async () => {
    try {
      if (onDownload) {
        await onDownload();
      }
    } catch (err) {
      setError('Failed to download results');
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <XCircle className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Error</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => onNewBatch?.()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Start New Batch
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getStatusIcon(batchResult.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Batch Analysis Complete
            </h3>
            <p className="text-sm text-gray-500">
              Processed on {new Date(batchResult.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(batchResult.status)}`}>
          {batchResult.status}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-1">
            {summary.total_files}
          </div>
          <div className="text-sm text-blue-700">Total Files</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900 mb-1">
            {summary.successful_predictions}
          </div>
          <div className="text-sm text-green-700">Successful</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900 mb-1">
            {summary.failed_predictions}
          </div>
          <div className="text-sm text-red-700">Failed</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900 mb-1">
            {summary.average_confidence}%
          </div>
          <div className="text-sm text-purple-700">Avg Confidence</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          disabled={!onDownload}
          className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          <span>Download CSV Results</span>
        </button>

        <button
          onClick={() => onNewBatch?.()}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <FileText className="h-4 w-4" />
          <span>Start New Batch</span>
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium text-gray-900 mb-1">Export Information</p>
            <p>
              <strong>Need detailed results?</strong> Download the CSV export above to see individual 
              file predictions, confidence levels, and recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
