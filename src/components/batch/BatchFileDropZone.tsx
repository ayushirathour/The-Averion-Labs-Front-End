// components/batch/BatchFileDropZone.tsx
import React, { useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { Upload, FolderX } from 'lucide-react';

interface BatchFileDropZoneProps {
  onDrop: (files: File[]) => void;
  disabled: boolean;
  maxFiles: number;
  currentCount: number;
  acceptedFileTypes: string;
}

export const BatchFileDropZone: React.FC<BatchFileDropZoneProps> = ({
  onDrop,
  disabled,
  maxFiles,
  currentCount,
  acceptedFileTypes
}) => {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    disabled,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/dicom': ['.dcm']
    } as Accept,
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${disabled 
          ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
          : isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-400 hover:border-blue-500'
        }
      `}
    >
      <input {...getInputProps()} />
      
      {disabled ? (
        <div className="text-gray-500">
          <FolderX className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Maximum files reached</p>
          <p>Remove files to add more (limit: {maxFiles})</p>
        </div>
      ) : (
        <div className="text-gray-700">
          <Upload className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-medium">
            Drop medical images here
          </p>
          <p>
            or click to browse ({maxFiles - currentCount} slots remaining)
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supports {acceptedFileTypes} • Max 30MB each
          </p>
        </div>
      )}
    </div>
  );
};
