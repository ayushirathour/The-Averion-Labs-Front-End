// components/batch/BatchFileList.tsx
import React from 'react';
import { X, FileImage, File } from 'lucide-react';

interface BatchFileListProps {
  files: File[];
  onRemove: (index: number) => void;
  onClear: () => void;
  disabled: boolean;
}

export const BatchFileList: React.FC<BatchFileListProps> = ({
  files,
  onRemove,
  onClear,
  disabled
}) => {
  if (files.length === 0) return null;

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Selected Files ({files.length})</h3>
        <button
          onClick={onClear}
          disabled={disabled}
          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
        >
          Clear All
        </button>
      </div>
      
      <div className="max-h-64 overflow-y-auto space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center">
              {file.type.startsWith('image/') ? (
                <FileImage className="w-5 h-5 text-blue-500 mr-2" />
              ) : (
                <File className="w-5 h-5 text-gray-500 mr-2" />
              )}
              <div>
                <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemove(index)}
              disabled={disabled}
              className="text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
