import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const renderError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (Array.isArray(error)) {
    return error.map(e => renderError(e)).join(', ');
  }

  if (typeof error === 'object' && error !== null) {
    if (error.detail && Array.isArray(error.detail)) {
      return error.detail.map((err: any) => {
        const location = err.loc ? err.loc.join('.') : 'field';
        return `${location}: ${err.msg || 'validation error'}`;
      }).join(', ');
    }

    if (error.detail) {
      return renderError(error.detail);
    }

    if (error.msg) {
      return error.msg;
    }

    if (error.message) {
      return error.message;
    }

    return JSON.stringify(error);
  }

  return String(error || 'Unknown error');
};

export const useLLMAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const { user } = useAuth();

  const callLLM = useCallback(async (
    query: string,
    responseMode: 'casual' | 'medical' | 'comprehensive' = 'casual',
    includePredictionContext: boolean = true
  ): Promise<string | null> => {
    if (!user) {
      toast.error('Please login to use AI Assistant');
      return null;
    }

    if (!query.trim()) {
      toast.error('Please enter a question');
      return null;
    }

    if (query.trim().length < 3) {
      toast.error('Query too short. Please provide more detail.');
      return null;
    }

    setLoading(true);
    setLastQuery(query);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Authentication token missing. Please login again.');
        return null;
      }

      let backendResponseMode: string;
      switch (responseMode) {
        case 'casual':
          backendResponseMode = 'ai_assistant';
          break;
        case 'medical':
          backendResponseMode = 'comprehensive';
          break;
        case 'comprehensive':
          backendResponseMode = 'comprehensive';
          break;
        default:
          backendResponseMode = 'ai_assistant';
      }

      const requestBody = {
        query: query.trim(),
        response_mode: backendResponseMode,
        include_prediction_context: includePredictionContext,
        conversation_context: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };

      const response = await fetch('https://the-averion-labs.onrender.com/llm/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 422) {
        const errorData = await response.json().catch(() => ({ detail: 'Validation error' }));
        const errorMessage = renderError(errorData);
        console.error('422 Validation error:', errorData);
        toast.error(`Request Error: ${errorMessage}`);
        return null;
      }

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        return null;
      }

      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.detail?.error === "No Credits Available") {
          toast.error('No credits remaining. Purchase credits to continue using LLM features.');
        } else {
          toast.error('Daily LLM limit exceeded. Try again later.');
        }
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = renderError(errorData.detail || `HTTP ${response.status} error`);
        toast.error(errorMessage);
        return null;
      }

      const data = await response.json();
      const aiResponse = data.response || 'No response from AI';

      const newMessages: ConversationMessage[] = [
        {
          role: 'user',
          content: query,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: data.timestamp || new Date().toISOString()
        }
      ];

      setConversationHistory(prev => [...prev, ...newMessages]);
      setResponse(aiResponse);
      toast.success('AI response generated successfully!');
      return aiResponse;

    } catch (error: any) {
      console.error('LLM API Error:', error);
      const errorMessage = renderError(error);
      toast.error(`Connection error: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, conversationHistory]);

  const summarizePrediction = useCallback(async (predictionId: string): Promise<string | null> => {
    if (!user) {
      toast.error('Please login to use AI features');
      return null;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Authentication token missing. Please login again.');
        return null;
      }

      const response = await fetch('https://the-averion-labs.onrender.com/llm/summarize-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prediction_id: predictionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = renderError(errorData.detail || `HTTP ${response.status} error`);
        toast.error(errorMessage);
        return null;
      }

      const data = await response.json();
      const summary = data.response || 'No summary available';
      toast.success('Summary generated successfully!');
      return summary;

    } catch (error: any) {
      console.error('Summarization Error:', error);
      const errorMessage = renderError(error);
      toast.error(`Summarization error: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getClinicalSuggestions = useCallback(async (predictionId: string): Promise<string | null> => {
    if (!user) {
      toast.error('Please login to use AI features');
      return null;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Authentication token missing. Please login again.');
        return null;
      }

      const response = await fetch('https://the-averion-labs.onrender.com/llm/clinical-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prediction_id: predictionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = renderError(errorData.detail || `HTTP ${response.status} error`);
        toast.error(errorMessage);
        return null;
      }

      const data = await response.json();
      const suggestions = data.response || 'No suggestions available';
      toast.success('Clinical suggestions generated successfully!');
      return suggestions;

    } catch (error: any) {
      console.error('Clinical Suggestions Error:', error);
      const errorMessage = renderError(error);
      toast.error(`Clinical suggestions error: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteConversationHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('https://the-averion-labs.onrender.com/llm/conversation-history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setConversationHistory([]);
        toast.success('Conversation history cleared');
      } else {
        throw new Error(`Failed to clear history: ${response.status}`);
      }

    } catch (error: any) {
      console.error('Clear history error:', error);
      const errorMessage = renderError(error);
      toast.error(`Failed to clear history: ${errorMessage}`);
    }
  }, []);

  const clearResponse = useCallback(() => {
    setResponse('');
  }, []);

  return {
    loading,
    response,
    lastQuery,
    conversationHistory,
    callLLM,
    summarizePrediction,
    getClinicalSuggestions,
    deleteConversationHistory,
    clearResponse
  };
};
