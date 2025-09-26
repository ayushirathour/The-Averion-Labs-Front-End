import api from './api';
import { BatchResult } from '@/types/batch';

export const batchPredictionService = {
  uploadBatch: async (
    files: File[],
    modelType: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<{ batch_id: string; status: string; message: string; results?: any[] }> => {
    try {
      if (files.length === 0) {
        throw new Error('No files provided for batch upload');
      }

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      const response = await api.post(`/api/v1/predict/batch?model_type=${modelType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
        timeout: 180000,
      });

      // Store individual results from upload response
      if (response.data.results && response.data.results.length > 0) {
        const batchId = response.data.batch_id;
        localStorage.setItem(`batch_results_${batchId}`, JSON.stringify(response.data.results));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.detail || 'Invalid batch request');
      }

      if (error.response?.status === 402) {
        throw new Error('Insufficient credits for batch processing');
      }

      if (error.response?.status === 413) {
        throw new Error('Batch size too large. Reduce number of files.');
      }

      throw new Error('Batch upload failed. Please try again.');
    }
  },

  getBatchResults: async (batchId: string): Promise<BatchResult> => {
    try {
      const response = await api.get(`/api/v1/batch/${batchId}/status`);
      const data = response.data;

      // Get individual results from localStorage
      let individualResults = [];
      try {
        const storedResults = localStorage.getItem(`batch_results_${batchId}`);
        if (storedResults) {
          individualResults = JSON.parse(storedResults);
        }
      } catch (e) {
        console.error('Error loading stored results:', e);
      }

      return {
        batch_id: batchId,
        status: data.status || 'completed',
        user: data.user || 'current_user',
        timestamp: data.timestamp || new Date().toISOString(),
        summary: data.summary || {
          total_files: 0,
          successful_predictions: 0,
          failed_predictions: 0,
          average_confidence: 0,
          processing_time_seconds: 0,
          credits_consumed: 0
        },
        results: individualResults,
        credits_remaining: data.credits_remaining || 0
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Batch not found or has expired');
      }

      throw new Error('Failed to get batch status');
    }
  },

  exportBatchCSV: async (batchId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/api/v1/batch/${batchId}/export/csv`, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error: any) {
      throw new Error('Failed to export batch results');
    }
  }
};
