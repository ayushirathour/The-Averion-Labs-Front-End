import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  FileImage, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Zap, 
  Shield, 
  X, 
  CreditCard,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { predictionService } from '@/services/prediction';
import toast from 'react-hot-toast';

interface AnalysisType {
  id: string;
  name: string;
  description: string;
  accuracy: string;
  processingTime: string;
  features: string[];
  supportedFormats: string[];
  credits: number;
}

const analysisTypes: AnalysisType[] = [
  {
    id: 'pneumonia',
    name: 'Pneumonia Detection',
    description: 'Analyze chest X-rays for pneumonia indicators',
    accuracy: '96.4%',
    processingTime: '~30 seconds',
    features: [
      'Pediatric-focused (1-5 years)',
      'High sensitivity detection',
      'Clinical validation',
      'Detailed confidence scoring'
    ],
    supportedFormats: ['JPEG', 'PNG', 'DICOM'],
    credits: 1
  },
  {
    id: 'skin_cancer',
    name: 'Skin Cancer Screening',
    description: 'Multi-class skin lesion analysis and classification',
    accuracy: '94.2%',
    processingTime: '~45 seconds',
    features: [
      'Multi-class classification',
      'Melanoma detection',
      'Basal cell carcinoma',
      'Benign lesion identification'
    ],
    supportedFormats: ['JPEG', 'PNG'],
    credits: 2
  }
];

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analysisType, setAnalysisType] = useState<string>('pneumonia');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAnalysis = analysisTypes.find(type => type.id === analysisType)!;
  const creditsRequired = selectedAnalysis.credits;

  const getSupportedFormats = (type: string) => {
    const analysis = analysisTypes.find(a => a.id === type);
    return analysis?.supportedFormats.join(', ') || '';
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (analysisType === 'pneumonia') {
      validTypes.push('application/dicom');
    }

    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.dcm')) {
      return `Please upload a valid ${getSupportedFormats(analysisType)} file`;
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setSelectedFile(file);
    setError(null);
  }, [analysisType]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!user || user.credits < creditsRequired) {
      setError(`Insufficient credits. You need ${creditsRequired} credits to proceed.`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('model_type', analysisType);

      const result = await predictionService.uploadAndPredict(
        formData,
        (progress) => setUploadProgress(progress)
      );

      if (result.prediction_id) {
        navigate(`/results/${result.prediction_id}`);
      } else {
        throw new Error('No prediction ID received');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
  };

  useEffect(() => {
    if (selectedFile) {
      const validation = validateFile(selectedFile);
      if (validation) {
        setError(validation);
        setSelectedFile(null);
      } else {
        setError(null);
      }
    }
  }, [analysisType, selectedFile]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Image Analysis</h1>
        <p className="text-gray-600">
          Upload your medical images for instant AI-powered analysis with clinical-grade accuracy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Type</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select the type of medical analysis you need
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setAnalysisType(type.id)}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                    analysisType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{type.name}</h3>
                    <div className="flex items-center space-x-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      <Zap className="h-3 w-3" />
                      <span>{type.credits} credit{type.credits > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Accuracy:</span>
                      <span className="font-medium text-green-600">{type.accuracy}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Processing:</span>
                      <span className="font-medium text-blue-600">{type.processingTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Image</h2>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your image or click to browse. {getSupportedFormats(analysisType)}
            </p>

            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {dragOver ? (
                  <div>
                    <UploadIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-blue-600 font-medium">Drop your image here</p>
                    <p className="text-blue-500 text-sm">Release to upload</p>
                  </div>
                ) : (
                  <div>
                    <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">Click to upload or drag and drop</p>
                    <p className="text-gray-500 text-sm mb-4">
                      Supports {getSupportedFormats(analysisType)}
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept={analysisType === 'pneumonia' ? 'image/*,.dcm' : 'image/*'}
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                    >
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">File Ready for Analysis</h3>
                  <button
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-md p-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <FileImage className="h-8 w-8 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                </div>

                {uploading && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Uploading...</span>
                      <span className="text-sm text-gray-600">{uploadProgress}% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  id="file-change"
                  className="hidden"
                  accept={analysisType === 'pneumonia' ? 'image/*,.dcm' : 'image/*'}
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-change"
                  className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
                >
                  Click to change file
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Analysis Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accuracy</span>
                <span className="text-sm font-semibold text-green-600">{selectedAnalysis.accuracy}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Time</span>
                <span className="text-sm font-semibold text-blue-600">{selectedAnalysis.processingTime}</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-600 block mb-2">Features:</span>
                <ul className="text-xs text-gray-600 space-y-1">
                  {selectedAnalysis.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Credits</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Required</span>
                <span className="text-sm font-semibold text-orange-600">
                  {creditsRequired}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available</span>
                <span className={`text-sm font-semibold ${user && user.credits >= creditsRequired ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.credits || 0}
                </span>
              </div>

              {user && user.credits < creditsRequired && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    You need {creditsRequired - user.credits} more credit(s) to proceed.
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || (user && user.credits < creditsRequired)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <UploadIcon className="h-4 w-4" />
                <span>Start Analysis</span>
              </>
            )}
          </button>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Security & Privacy</span>
            </div>
            <p className="text-xs text-green-700">
              Your images are encrypted, processed securely, and automatically deleted after analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
