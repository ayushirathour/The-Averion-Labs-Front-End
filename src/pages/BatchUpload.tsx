import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Upload, CreditCard } from 'lucide-react';
import { useBatchUpload } from '@/hooks/useBatchUpload';
import { BatchModelSelector } from '@/components/batch/BatchModelSelector';
import { BatchFileDropZone } from '@/components/batch/BatchFileDropZone';
import { BatchFileList } from '@/components/batch/BatchFileList';
import { BatchCostCalculator } from '@/components/batch/BatchCostCalculator';

const BatchUpload: React.FC = () => {
  const navigate = useNavigate();
  const { 
    files, 
    modelType, 
    setModelType, 
    addFiles, 
    removeFile, 
    clearFiles, 
    submitBatch, 
    uploading, 
    uploadProgress, 
    limits, 
    batchCost, 
    canAfford, 
    remainingCredits 
  } = useBatchUpload();

  const handleSubmit = async () => {
    try {
      const batchId = await submitBatch();
      if (batchId) {
        navigate(`/batch-results/${batchId}`);
      }
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="mb-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">Batch Upload</span>
        </nav>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Batch Processing</h1>
        <p className="text-gray-600">
          Process multiple medical images simultaneously with detailed reporting
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800 text-sm">
            {limits.description}
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Max {limits.maxFiles} files per batch • {limits.maxBatchesPerDay} batches per day
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BatchModelSelector 
            selectedModel={modelType}
            onSelectModel={setModelType}
          />
          
          <BatchFileDropZone 
            onFilesAdded={addFiles}
            maxFiles={limits.maxFiles}
            currentFileCount={files.length}
          />
          
          {files.length > 0 && (
            <BatchFileList 
              files={files}
              onRemoveFile={removeFile}
              onClearAll={clearFiles}
            />
          )}
        </div>

        <div className="space-y-6">
          <BatchCostCalculator 
            fileCount={files.length}
            modelType={modelType}
            totalCost={batchCost}
            remainingCredits={remainingCredits}
            canAfford={canAfford}
          />

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Payment</h3>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>Credits will be deducted after processing</p>
              <p>Failed predictions are not charged</p>
              <p>Results available for 30 days</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || !canAfford || uploading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>
              {uploading ? `Processing... ${uploadProgress}%` : 'Start Batch Processing'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchUpload;
