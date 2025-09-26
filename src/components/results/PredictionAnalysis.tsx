// src/components/results/PredictionAnalysis.tsx
import React, { useState } from 'react';
import { Brain, FileText, Stethoscope, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface PredictionAnalysisProps {
  predictionId?: string;
  batchId?: string;
  predictionType: 'single' | 'batch';
}

const PredictionAnalysis: React.FC<PredictionAnalysisProps> = ({
  predictionId,
  batchId,
  predictionType
}) => {
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'suggestions' | null>(null);

  const { user } = useAuth();

  // Call summarize prediction endpoint
  const handleSummarize = async () => {
    if (!user) {
      toast.error('Please login to use this feature');
      return;
    }

    setSummaryLoading(true);
    setSummary('');
    setActiveTab('summary');

    try {
      const token = localStorage.getItem('access_token');
      
      const requestBody = {
        prediction_id: predictionType === 'single' ? predictionId : batchId
      };

      const response = await fetch('https://the-averion-labs.onrender.com/llm/summarize-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Failed to generate summary');
        return;
      }

      const data = await response.json();
      setSummary(data.summary || data.response || 'No summary available');
      toast.success('Prediction summary generated successfully!');

    } catch (error: any) {
      console.error('Summary API Error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Call clinical suggestions endpoint
  const handleGetSuggestions = async () => {
    if (!user) {
      toast.error('Please login to use this feature');
      return;
    }

    setSuggestionsLoading(true);
    setSuggestions('');
    setActiveTab('suggestions');

    try {
      const token = localStorage.getItem('access_token');
      
      const requestBody = {
        prediction_id: predictionType === 'single' ? predictionId : batchId
      };

      const response = await fetch('https://the-averion-labs.onrender.com/llm/clinical-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Failed to generate suggestions');
        return;
      }

      const data = await response.json();
      setSuggestions(data.suggestions || data.response || 'No suggestions available');
      toast.success('Clinical suggestions generated successfully!');

    } catch (error: any) {
      console.error('Suggestions API Error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Don't render if no prediction data
  if (!predictionId && !batchId) {
    return null;
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Analysis & Insights</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Get detailed summaries and clinical suggestions for your {predictionType} prediction results
        </p>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSummarize}
            disabled={summaryLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {summaryLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>
              {summaryLoading ? 'Generating Summary...' : 'Get Prediction Summary'}
            </span>
          </button>

          <button
            onClick={handleGetSuggestions}
            disabled={suggestionsLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {suggestionsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Stethoscope className="w-4 h-4" />
            )}
            <span>
              {suggestionsLoading ? 'Generating Suggestions...' : 'Get Clinical Suggestions'}
            </span>
          </button>
        </div>
      </div>

      {/* Results Display */}
      {(summary || suggestions || summaryLoading || suggestionsLoading) && (
        <div className="p-4">
          {/* Tab Navigation */}
          {(summary || suggestions) && (
            <div className="flex border-b border-gray-200 mb-4">
              {summary && (
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'summary'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Summary
                </button>
              )}
              {suggestions && (
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'suggestions'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 inline mr-2" />
                  Clinical Suggestions
                </button>
              )}
            </div>
          )}

          {/* Loading States */}
          {summaryLoading && activeTab === 'summary' && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600">Analyzing your prediction results...</p>
              </div>
            </div>
          )}

          {suggestionsLoading && activeTab === 'suggestions' && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
                <p className="text-gray-600">Generating clinical suggestions...</p>
              </div>
            </div>
          )}

          {/* Summary Content */}
          {summary && activeTab === 'summary' && !summaryLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-2">Prediction Summary</h4>
                  <div className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                    {summary}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions Content */}
          {suggestions && activeTab === 'suggestions' && !suggestionsLoading && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Stethoscope className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 mb-2">Clinical Suggestions</h4>
                  <div className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed">
                    {suggestions}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical Disclaimer */}
          {(summary || suggestions) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-800">
                  <strong>Medical Disclaimer:</strong> These AI-generated summaries and suggestions are for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionAnalysis;
