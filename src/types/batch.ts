// types/batch.ts
export interface BatchUploadRequest {
    files: File[];
    modelType: 'pneumonia' | 'skin_cancer';
  }
  
  export interface BatchResult {
    batch_id: string;
    status: 'processing' | 'completed' | 'failed' | 'partial';
    user: string;
    timestamp: string;
    summary: BatchSummary;
    results: BatchFileResult[];
    credits_remaining: number;
  }
  
  export interface BatchFileResult {
    filename: string;
    file_index: number;
    success: boolean;
    diagnosis?: string;
    confidence?: number;
    confidence_level?: string;
    recommendation?: string;
    raw_score?: number;
    file_type: string;
    processing_time_ms?: number;
    error_message?: string;
  }
  
  export interface BatchSummary {
    total_files: number;
    successful_predictions: number;
    failed_predictions: number;
    pneumonia_detected?: number;
    skin_cancer_detected?: number;
    normal_cases: number;
    average_confidence: number;
    processing_time_seconds: number;
    credits_consumed: number;
  }
  