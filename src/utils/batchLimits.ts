// utils/batchLimits.ts
export const getBatchLimits = (credits: number) => {
    if (credits >= 1000) {
      return {
        maxFiles: 25,
        maxBatchesPerDay: 20,
        tier: 'Power User',
        description: 'High volume processing available',
        tierColor: 'bg-purple-50 border-purple-200 text-purple-800'
      };
    }
    
    if (credits >= 500) {
      return {
        maxFiles: 15,
        maxBatchesPerDay: 10,
        tier: 'Active User',
        description: 'Enhanced batch processing',
        tierColor: 'bg-blue-50 border-blue-200 text-blue-800'
      };
    }
    
    if (credits >= 100) {
      return {
        maxFiles: 10,
        maxBatchesPerDay: 5,
        tier: 'Standard User',
        description: 'Regular batch processing',
        tierColor: 'bg-green-50 border-green-200 text-green-800'
      };
    }
    
    if (credits >= 50) {
      return {
        maxFiles: 5,
        maxBatchesPerDay: 2,
        tier: 'New User',
        description: 'Getting started with batches',
        tierColor: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      };
    }
    
    return {
      maxFiles: 3,
      maxBatchesPerDay: 1,
      tier: 'Low Balance',
      description: 'Purchase credits for more capacity',
      tierColor: 'bg-red-50 border-red-200 text-red-800'
    };
  };
  
  export const calculateBatchCost = (fileCount: number, modelType: string) => {
    const costPerFile = modelType === 'skin_cancer' ? 2 : 1;
    return fileCount * costPerFile;
  };
  
  export const canAffordBatch = (fileCount: number, modelType: string, credits: number) => {
    const cost = calculateBatchCost(fileCount, modelType);
    return credits >= cost;
  };
  