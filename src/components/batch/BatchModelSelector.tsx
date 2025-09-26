import React from 'react';

interface ModelOption {
  id: 'pneumonia' | 'skin_cancer';
  name: string;
  description: string;
  accuracy: string;
  credits: number;
  processingTime: string;
  features: string[];
}

const modelOptions: ModelOption[] = [
  {
    id: 'pneumonia',
    name: 'Pneumonia Detection',
    description: 'Analyze chest X-rays for pneumonia detection',
    accuracy: '86%',
    credits: 1,
    processingTime: '2-5 seconds',
    features: ['DICOM Support', 'Clinical Validation', 'Radiologist-grade Accuracy']
  },
  {
    id: 'skin_cancer',
    name: 'Skin Cancer Detection',
    description: 'Analyze skin lesions for cancer detection',
    accuracy: '85%',
    credits: 2,
    processingTime: '3-8 seconds',
    features: ['Multiple Cancer Types', 'High Sensitivity', 'Dermatologist Insights']
  }
];

interface BatchModelSelectorProps {
  selectedModel: 'pneumonia' | 'skin_cancer';
  onModelChange: (model: 'pneumonia' | 'skin_cancer') => void;
  fileCount: number;
  disabled?: boolean;
}

export const BatchModelSelector: React.FC<BatchModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  fileCount,
  disabled = false
}) => {
  const totalCost = fileCount * (selectedModel === 'skin_cancer' ? 2 : 1);

  const handleModelSelect = (modelId: 'pneumonia' | 'skin_cancer') => {
    onModelChange(modelId);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Select Analysis Type for Batch
      </h3>
      
      <div className="space-y-4">
        {modelOptions.map((model) => (
          <div
            key={model.id}
            onClick={() => !disabled && handleModelSelect(model.id)}
            className={`
              border-2 rounded-lg p-4 cursor-pointer transition-all
              ${selectedModel === model.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-start space-x-4">
              <input
                type="radio"
                checked={selectedModel === model.id}
                onChange={() => handleModelSelect(model.id)}
                disabled={disabled}
                className="mr-3"
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{model.name}</h4>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Accuracy: {model.accuracy}</div>
                    <div className="text-sm text-gray-600">Time: {model.processingTime}</div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{model.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Credits: {model.credits}/file
                  </div>
                  
                  {fileCount > 0 && (
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Batch Cost:</div>
                      <div className={`text-sm ${fileCount > 0 ? 'font-semibold text-blue-600' : ''}`}>
                        {fileCount * model.credits} credits
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Features: {model.features.join(', ')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {fileCount > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            Batch Summary: {fileCount} files × {selectedModel === 'skin_cancer' ? '2' : '1'} credits = 
            <span className="font-semibold ml-1">{totalCost} total credits</span>
          </div>
        </div>
      )}
    </div>
  );
};
