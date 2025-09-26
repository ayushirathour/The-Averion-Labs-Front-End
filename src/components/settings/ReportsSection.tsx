// src/components/settings/ReportsSection.tsx
import React, { useState } from 'react';
import { Card, Button, Alert, Spinner } from '@/components/ui';
import { Download, Mail, FileText, Calendar, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const ReportsSection: React.FC = () => {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      
      const response = await fetch('/users/report/download', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `averion-labs-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailReport = async () => {
    try {
      setIsEmailing(true);
      
      const response = await fetch('/users/report/email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Report emailed to ${user?.email}!`);
      } else {
        throw new Error(result.message || 'Failed to email report');
      }
    } catch (error: any) {
      console.error('Email error:', error);
      toast.error(error.message || 'Failed to email report. Please try again.');
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-6">Medical Reports & Analytics</h2>
        
        <Alert type="info" className="mb-6">
          <FileText className="w-4 h-4" />
          <div>
            <h4 className="font-semibold">Comprehensive Medical Report</h4>
            <p className="text-sm mt-1">
              Download or email a complete analysis of your medical AI predictions, 
              including statistics, payment history, and detailed insights.
            </p>
          </div>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Download className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">Download Report</h3>
            </div>
            <p className="text-blue-700 text-sm mb-4">
              Get a comprehensive PDF report with all your medical AI analysis data.
            </p>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleDownloadReport}
              loading={isDownloading}
              disabled={isDownloading}
            >
              {isDownloading ? <Spinner size="sm" className="mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              Download PDF
            </Button>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Mail className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">Email Report</h3>
            </div>
            <p className="text-green-700 text-sm mb-4">
              Send the comprehensive report directly to your registered email address.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEmailReport}
              loading={isEmailing}
              disabled={isEmailing}
            >
              {isEmailing ? <Spinner size="sm" className="mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
              Email to {user?.email}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-6">Report Contents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <Activity className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm">Prediction history & statistics</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm">Usage analytics & trends</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm">Account information & settings</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <Download className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm">Payment & billing history</span>
            </div>
            <div className="flex items-center">
              <Activity className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm">Model performance insights</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm">GDPR/DPDP compliance data</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportsSection;
