import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast'; 

const DataPortability: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('pdf');

  const handlePortableExport = async () => {
    try {
      const response = await fetch('/api/user/export-portable', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ format: exportFormat })
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-averion-data.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Data exported in ${exportFormat.toUpperCase()} format`); 
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-start space-x-3 mb-4">
        <FileText className="w-6 h-6 text-purple-600 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Data Portability</h3>
          <p className="text-sm text-purple-800 mb-4">
            Export your data in machine-readable formats to transfer to other services
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 mb-4">
        <label className="text-sm font-medium text-purple-900">Format:</label>
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv' | 'pdf')}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="pdf">PDF Report</option>
          <option value="json">JSON Data</option>
          <option value="csv">CSV Spreadsheet</option>
        </select>
      </div>
      
      <button
        onClick={handlePortableExport}
        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        <Download className="w-4 h-4 mr-2" />
        Export Portable Data
      </button>
    </div>
  );
};

export default DataPortability;
