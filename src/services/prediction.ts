import api from './api';
import { PredictionInitiationResponse } from '@/types';

interface PredictionStatus {
  prediction_id: string;
  status: 'processing' | 'completed' | 'failed';
  model_type: 'pneumonia' | 'skin_cancer';
  result?: any;
  created_at?: string;
  completed_at?: string;
  processing_time_ms?: number;
  credits_charged?: number;
  image_dimensions?: string;
  medical_disclaimer?: string;
}

export const predictionService = {
  initiatePrediction: async (
    file: File,
    model: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<PredictionInitiationResponse> => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      if (!model) {
        throw new Error('No model specified');
      }

      const maxSize = 30 * 1024 * 1024; // 30MB
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 30MB.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('model_type', model);

      const response = await api.post('/api/v1/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
        timeout: 60000,
      });

      if (!response || !response.data) {
        throw new Error('Empty response from server');
      }

      const data = response.data;

      const predictionId = data.prediction_id ||
        data.id ||
        data.predictionId ||
        data.job_id ||
        data.jobId ||
        data.task_id ||
        data.taskId;

      if (!predictionId || predictionId === 'undefined' || predictionId === 'null') {
        console.error('Invalid response structure:', data);
        throw new Error('Server response missing prediction ID. Please try again.');
      }

      return {
        prediction_id: predictionId,
        status: data.status || 'processing',
        message: data.message || 'Analysis started successfully',
        credits_remaining: data.credits_remaining || data.remaining_credits || 0,
        check_result_at: data.check_result_at || data.result_url || `/api/v1/predictions/${predictionId}/result`
      };

    } catch (error: any) {
      console.error('Prediction service error:', error);

      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }

      if (error.response?.status === 0) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }

      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (error.response?.status === 402) {
        throw new Error('Insufficient credits. Please purchase more credits.');
      }

      if (error.response?.status === 413) {
        throw new Error('File too large. Please upload a smaller image (max 30MB).');
      }

      if (error.response?.status === 422) {
        throw new Error('Invalid file format. Please upload a JPEG, PNG, or DICOM file.');
      }

      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      if (error.message && !error.message.includes('Network Error')) {
        throw error;
      }

      throw new Error('Upload failed. Please try again.');
    }
  },

  getPredictionResult: async (predictionId: string): Promise<PredictionStatus> => {
    try {
      if (!predictionId || predictionId === 'undefined' || predictionId === 'null') {
        throw new Error('Invalid prediction ID');
      }

      const response = await api.get(`/api/v1/predictions/${predictionId}/result`, {
        timeout: 30000,
      });

      if (!response || !response.data) {
        throw new Error('Empty response from server');
      }

      const data = response.data;

      return {
        prediction_id: predictionId,
        status: data.status || 'processing',
        model_type: data.model_type || data.model || 'pneumonia',
        result: data.result || data,
        created_at: data.created_at,
        completed_at: data.completed_at,
        processing_time_ms: data.processing_time_ms,
        credits_charged: data.credits_charged || data.credits_used,
        image_dimensions: data.image_dimensions,
        medical_disclaimer: data.medical_disclaimer
      };

    } catch (error: any) {
      console.error('Get prediction result error:', error);

      if (error.response?.status === 404) {
        throw new Error('Prediction not found. It may have expired.');
      }

      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }

      throw error;
    }
  },
};
