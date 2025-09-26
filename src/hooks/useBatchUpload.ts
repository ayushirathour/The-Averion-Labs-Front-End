import { useState, useCallback } from 'react';
import { batchPredictionService } from '@/services/batchPrediction';
import { getBatchLimits, canAffordBatch, calculateBatchCost } from '@/utils/batchLimits';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const useBatchUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [modelType, setModelType] = useState<'pneumonia' | 'skin_cancer'>('pneumonia');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [batchId, setBatchId] = useState<string | null>(null);
  const { user } = useAuth();

  const limits = getBatchLimits(user?.credits || 0);
  const batchCost = calculateBatchCost(files.length, modelType);
  const canAfford = canAffordBatch(files.length, modelType, user?.credits || 0);

  const handleSetModelType = useCallback((newModelType: 'pneumonia' | 'skin_cancer') => {
    setModelType(newModelType);
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const availableSlots = limits.maxFiles - files.length;
    if (availableSlots <= 0) {
      toast.error(`${limits.tier} limit: ${limits.maxFiles} files per batch`);
      return;
    }

    const filesToAdd = newFiles.slice(0, availableSlots);
    const totalFiles = files.length + filesToAdd.length;

    if (!canAffordBatch(totalFiles, modelType, user?.credits || 0)) {
      const maxAffordable = Math.floor((user?.credits || 0) / (modelType === 'skin_cancer' ? 2 : 1));
      toast.error(`Insufficient credits. You can afford ${maxAffordable} files max.`);
      return;
    }

    setFiles(prev => [...prev, ...filesToAdd]);

    if (newFiles.length > availableSlots) {
      toast.error(`Only ${availableSlots} files added. ${limits.tier} limit: ${limits.maxFiles} files`);
    }
  }, [files.length, limits, modelType, user?.credits]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const submitBatch = async () => {
    if (files.length === 0 || !canAfford) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await batchPredictionService.uploadBatch(
        files,
        modelType,
        (progressEvent: any) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      );

      setBatchId(result.batch_id);
      toast.success('Batch upload started! Processing your files...');
      return result.batch_id;

    } catch (error: any) {
      toast.error(error.message || 'Batch upload failed');
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    files,
    modelType,
    setModelType: handleSetModelType,
    addFiles,
    removeFile,
    clearFiles,
    submitBatch,
    uploading,
    uploadProgress,
    batchId,
    limits,
    batchCost,
    canAfford,
    remainingCredits: (user?.credits || 0) - batchCost
  };
};
