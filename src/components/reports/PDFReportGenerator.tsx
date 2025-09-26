import React, { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { MedicalPDFReport } from './MedicalPDFReport';
import { Download, Eye, FileText } from 'lucide-react';
import { ComprehensiveReportData } from '@/services/reportDataService';

interface PDFReportGeneratorProps {
  reportData: ComprehensiveReportData;
  patientName: string;
  analysisType: 'single' | 'batch';
}

export const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({
  reportData,
  patientName,
  analysisType
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    const type = analysisType === 'batch' ? 'Batch' : 'Single';
    const id = analysisType === 'batch'
      ? reportData.batchData?.batch_id || 'Unknown'
      : reportData.currentAnalysis?.data?.id || 'Unknown';
    
    return `${patientName.replace(/\s+/g, '_')}_${type}_Analysis_${id}_${date}.pdf`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Generate Comprehensive Medical Report
          </h2>
        </div>
        
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Download a detailed PDF report including your analysis results, AI
          recommendations, model information, and medical disclaimers for your records.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <PDFDownloadLink
            document={<MedicalPDFReport data={reportData} />}
            fileName={getFileName()}
            className="flex-1 sm:flex-none sm:min-w-[200px] bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-3 font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {({ loading }) => (
              <>
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>
                  {loading ? 'Generating PDF...' : `Download ${analysisType === 'batch' ? 'Batch' : 'Analysis'} Report`}
                </span>
              </>
            )}
          </PDFDownloadLink>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 sm:flex-none sm:min-w-[160px] border-2 border-blue-500 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg px-4 py-3 font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{showPreview ? 'Hide Preview' : 'Preview Report'}</span>
          </button>
        </div>

        {showPreview && (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="text-sm font-medium text-gray-700">
                {analysisType === 'batch' ? 'Batch Analysis' : 'Single Analysis'} PDF Preview
              </h3>
            </div>
            <div className="h-96 sm:h-[600px]">
              <PDFViewer width="100%" height="100%">
                <MedicalPDFReport data={reportData} />
              </PDFViewer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
