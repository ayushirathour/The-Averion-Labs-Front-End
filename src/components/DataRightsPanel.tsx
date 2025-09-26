import React, { useState } from 'react';
import { Download, Mail, Eye, Shield, Clock, CheckCircle } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DataRightsPanel: React.FC = () => {
  const { user } = useAuth();
  const { downloadReport, emailReport, isDownloadingReport, isEmailingReport, statistics } = useUserProfile();
  const [showDataSummary, setShowDataSummary] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  const getDataSummary = () => {
    return {
      totalPredictions: statistics?.total_predictions || 0,
      totalCreditsUsed: statistics?.credits_used || 0,
      accountAge: user?.created_at 
        ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      lastActivity: 'Recent',
      dataSize: '2.4 MB'
    };
  };

  const dataSummary = getDataSummary();

  const handleDataExport = async () => {
    try {
      await downloadReport();
      toast.success('Your complete data report has been downloaded!');
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
    }
  };

  const handleEmailExport = async () => {
    const emailTo = customEmail.trim() || user?.email;
    if (!emailTo) {
      toast.error('Please provide an email address');
      return;
    }

    try {
      await emailReport(emailTo);
      toast.success(`Data report sent to ${emailTo}`);
      setCustomEmail('');
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Data Rights & Export</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Exercise your rights under <strong>GDPR</strong> and <strong>India's DPDP Act 2023</strong>
      </p>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Download className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">Download Your Data</h4>
              <p className="text-sm text-blue-700 mb-3">
                Get a comprehensive PDF report with all your medical AI analysis data
              </p>
              <button
                onClick={handleDataExport}
                disabled={isDownloadingReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isDownloadingReport ? 'Generating...' : 'Download Data Report'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900 mb-1">Email Your Data</h4>
              <p className="text-sm text-green-700 mb-3">
                Send the comprehensive report directly to your email address
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder={user?.email || 'Enter email address'}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-green-300 rounded-md text-sm"
                />
                <button
                  onClick={handleEmailExport}
                  disabled={isEmailingReport}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isEmailingReport ? 'Sending...' : 'Send Report'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Eye className="h-5 w-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">View Data Summary</h4>
              <p className="text-sm text-gray-600 mb-3">
                See what data we have stored about your account
              </p>
              <button
                onClick={() => setShowDataSummary(!showDataSummary)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                {showDataSummary ? 'Hide Summary' : 'Show Data Summary'}
              </button>
              
              {showDataSummary && (
                <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Predictions:</span>
                      <div className="font-medium">{dataSummary.totalPredictions}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Credits Used:</span>
                      <div className="font-medium">{dataSummary.totalCreditsUsed}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Account Age:</span>
                      <div className="font-medium">{dataSummary.accountAge} days</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Data Size:</span>
                      <div className="font-medium">{dataSummary.dataSize}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Your Privacy Rights</p>
            <p>
              Under GDPR and India's DPDP Act 2023, you have the right to access, 
              rectify, delete, and port your personal data. This export includes all data we hold about you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataRightsPanel;
