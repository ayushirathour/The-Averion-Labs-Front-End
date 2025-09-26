import { userService } from './user';
import { batchPredictionService } from './batchPrediction';

export interface ComprehensiveReportData {
  user: {
    name: string;
    email: string;
    username: string;
    credits: number;
    plan: string;
    member_since: string;
    total_predictions: number;
  };
  currentAnalysis?: {
    type: 'single' | 'batch';
    data: any;
  };
  predictions: Array<{
    id: string;
    filename: string;
    diagnosis: string;
    confidence: number;
    model_type: string;
    timestamp: string;
    recommendation?: string;
    processing_time_ms?: number;
    batch_id?: string;
  }>;
  batchData?: {
    batch_id: string;
    total_files: number;
    successful_predictions: number;
    failed_predictions: number;
    average_confidence: number;
    credits_consumed: number;
    processing_time_seconds: number;
    timestamp: string;
    model_type: string;
  };
  statistics: {
    total_predictions: number;
    this_week_predictions: number;
    this_month_predictions: number;
    credits_used: number;
    pneumonia_detected: number;
    normal_cases: number;
    skin_cancer_cases: number;
  };
  reportMeta: {
    generated_at: string;
    report_type: 'single_analysis' | 'batch_analysis' | 'comprehensive';
    report_id: string;
  };
}

class ReportDataService {
  async generateSingleAnalysisReport(
    predictionId: string,
    predictionResult: any,
    userInfo: any
  ): Promise<ComprehensiveReportData> {
    try {
      const dashboardData = await userService.getDashboard();
      const dd: any = dashboardData as any;

      const singlePrediction = {
        id: predictionId,
        filename: predictionResult.filename || 'Unknown',
        diagnosis: predictionResult.result?.diagnosis || predictionResult.diagnosis || 'Unknown',
        confidence: predictionResult.result?.confidence || predictionResult.confidence || 0,
        model_type: predictionResult.model_type || 'pneumonia',
        timestamp: predictionResult.completed_at || new Date().toISOString(),
        recommendation: predictionResult.result?.recommendation || predictionResult.recommendation,
        processing_time_ms: predictionResult.processing_time_ms || 0,
      };

      const reportData: ComprehensiveReportData = {
        user: {
          name: userInfo.name || 'Unknown Patient',
          email: userInfo.email || 'Unknown Email',
          username: userInfo.username || 'Unknown',
          credits: userInfo.credits || 0,
          plan: userInfo.plan || 'Free Plan',
          member_since: userInfo.created_at || new Date().toISOString(),
          total_predictions: dashboardData.total_predictions || 1,
        },
        currentAnalysis: {
          type: 'single',
          data: singlePrediction,
        },
        predictions: [singlePrediction],
        statistics: {
          total_predictions: dashboardData.total_predictions || 1,
          this_week_predictions: dashboardData.this_week_predictions || 1,
          this_month_predictions: dd.this_month_predictions ?? 1,
          credits_used: dashboardData.credits_used || (singlePrediction.model_type === 'skin_cancer' ? 2 : 1),
          pneumonia_detected: singlePrediction.diagnosis === 'PNEUMONIA' ? 1 : (dd.pneumonia_detected ?? 0),
          normal_cases: singlePrediction.diagnosis === 'NORMAL' ? 1 : (dd.normal_cases ?? 0),
          skin_cancer_cases: singlePrediction.model_type === 'skin_cancer' ? 1 : (dd.skin_cancer_cases ?? 0),
        },
        reportMeta: {
          generated_at: new Date().toISOString(),
          report_type: 'single_analysis',
          report_id: `SA_${predictionId}_${Date.now()}`,
        },
      };

      return reportData;
    } catch (error) {
      console.error('Error generating single analysis report data:', error);
      throw new Error('Failed to generate report data');
    }
  }

  async generateBatchAnalysisReport(
    batchId: string,
    batchResult: any,
    userInfo: any
  ): Promise<ComprehensiveReportData> {
    try {
      const dashboardData = await userService.getDashboard();
      const dd: any = dashboardData as any;

      let batchDetails = null;
      try {
        batchDetails = await batchPredictionService.getBatchResults(batchId);
      } catch (error) {
        console.warn('Could not fetch detailed batch results:', error);
      }

      const reportData: ComprehensiveReportData = {
        user: {
          name: userInfo.name || 'Unknown Patient',
          email: userInfo.email || 'Unknown Email',
          username: userInfo.username || 'Unknown',
          credits: userInfo.credits || 0,
          plan: userInfo.plan || 'Free Plan',
          member_since: userInfo.created_at || new Date().toISOString(),
          total_predictions: dashboardData.total_predictions || batchResult.summary.total_files,
        },
        currentAnalysis: {
          type: 'batch',
          data: batchResult,
        },
        predictions: [],
        batchData: {
          batch_id: batchId,
          total_files: batchResult.summary.total_files || 0,
          successful_predictions: batchResult.summary.successful_predictions || 0,
          failed_predictions: batchResult.summary.failed_predictions || 0,
          average_confidence: batchResult.summary.average_confidence || 0,
          credits_consumed: batchResult.summary.credits_consumed || 0,
          processing_time_seconds: batchResult.summary.processing_time_seconds || 0,
          timestamp: batchResult.timestamp || new Date().toISOString(),
          model_type: 'pneumonia',
        },
        statistics: {
          total_predictions: dashboardData.total_predictions || batchResult.summary.total_files,
          this_week_predictions: dashboardData.this_week_predictions || batchResult.summary.total_files,
          this_month_predictions: dd.this_month_predictions ?? batchResult.summary.total_files,
          credits_used: dashboardData.credits_used || batchResult.summary.credits_consumed,
          pneumonia_detected: dd.pneumonia_detected ?? batchResult.summary.pneumonia_detected ?? 0,
          normal_cases: dd.normal_cases ?? batchResult.summary.normal_cases ?? 0,
          skin_cancer_cases: dd.skin_cancer_cases ?? 0,
        },
        reportMeta: {
          generated_at: new Date().toISOString(),
          report_type: 'batch_analysis',
          report_id: `BA_${batchId}_${Date.now()}`,
        },
      };

      return reportData;
    } catch (error) {
      console.error('Error generating batch analysis report data:', error);
      throw new Error('Failed to generate report data');
    }
  }
}

export const reportDataService = new ReportDataService();
