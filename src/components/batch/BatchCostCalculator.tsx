// components/batch/BatchCostCalculator.tsx
import React from 'react';
import { Calculator, CreditCard } from 'lucide-react';

interface BatchCostCalculatorProps {
  fileCount: number;
  modelType: string;
  batchCost: number;
  remainingCredits: number;
  canAfford: boolean;
}

export const BatchCostCalculator: React.FC<BatchCostCalculatorProps> = ({
  fileCount,
  modelType,
  batchCost,
  remainingCredits,
  canAfford
}) => {
  const costPerFile = modelType === 'skin_cancer' ? 2 : 1;

  if (fileCount === 0) return null;

  return (
    <div className="mb-6 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <Calculator className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="font-semibold">Cost Calculator</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Files Selected:</span>
          <span className="font-semibold ml-2">{fileCount}</span>
        </div>
        <div>
          <span className="text-gray-600">Cost per File:</span>
          <span className="font-semibold ml-2">{costPerFile} credits</span>
        </div>
        <div>
          <span className="text-gray-600">Total Cost:</span>
          <span className="font-semibold ml-2">{batchCost} credits</span>
        </div>
        <div>
          <span className="text-gray-600">Remaining:</span>
          <span className={`font-semibold ml-2 ${
            remainingCredits >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {remainingCredits} credits
          </span>
        </div>
      </div>
      
      {!canAfford && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-center">
          <CreditCard className="w-4 h-4 text-red-500 mr-2" />
          <p className="text-red-700 text-sm">
            ⚠️ Insufficient credits. You need {batchCost - remainingCredits} more credits to process this batch.
          </p>
        </div>
      )}
    </div>
  );
};
