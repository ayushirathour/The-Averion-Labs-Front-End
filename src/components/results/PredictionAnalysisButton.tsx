// src/components/results/PredictionAnalysisButton.tsx - COMPLETELY FIXED
import React, { useState } from 'react';
import { Brain, FileText, Stethoscope, Loader2 } from 'lucide-react';
import { useLLMAssistant } from '@/hooks/useLLMAssistant';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface PredictionAnalysisButtonProps {
  predictionId: string;
  batchId?: string;
  type: 'single' | 'batch';
}

const PredictionAnalysisButton: React.FC<PredictionAnalysisButtonProps> = ({
  predictionId,
  batchId,
  type
}) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [showResults, setShowResults] = useState(false);

  // ✅ FIXED: Use dedicated endpoint functions
  const { summarizePrediction, getClinicalSuggestions } = useLLMAssistant();
  const { user } = useAuth();

  const handleAIAnalysis = async () => {
    if (!user) {
      toast.error('Please login to use AI analysis');
      return;
    }

    // ✅ Use correct ID (backend can handle both single and batch)
    const targetId = batchId || predictionId;
    
    console.log('🔍 Analyzing prediction/batch ID:', targetId);
    
    setLoading(true);
    setShowResults(true);

    try {
      // ✅ CORRECT: Use dedicated backend endpoints
      const [summaryResult, suggestionsResult] = await Promise.all([
        summarizePrediction(targetId),           // Calls /llm/summarize-prediction
        getClinicalSuggestions(targetId)         // Calls /llm/clinical-suggestions
      ]);

      if (summaryResult) {
        setSummary(summaryResult);
        console.log('✅ Summary received for ID:', targetId);
      }

      if (suggestionsResult) {
        setSuggestions(suggestionsResult);
        console.log('✅ Suggestions received for ID:', targetId);
      }

      if (summaryResult || suggestionsResult) {
        toast.success('AI analysis completed!');
      } else {
        toast.error('No AI response received. Please try again.');
      }

    } catch (error: any) {
      console.error('❌ AI Analysis Error:', error);
      toast.error('Failed to generate AI analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleAIAnalysis}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
        {loading ? 'Generating AI Analysis...' : `Analyze ${type} result with AI`}
      </button>

      {/* Results Display */}
      {showResults && (summary || suggestions) && (
        <div className="mt-6 space-y-4">
          {summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">AI Summary</h4>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          )}

          {suggestions && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Clinical Suggestions</h4>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">
                {suggestions}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Medical Disclaimer:</strong> This AI analysis is for preliminary screening only.
              Always consult qualified healthcare professionals for medical decisions.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PredictionAnalysisButton;
