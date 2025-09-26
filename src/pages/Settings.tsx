import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  CreditCard, 
  Download, 
  Mail, 
  Shield, 
  Key, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Check,
  Settings as SettingsIcon,
  AlertTriangle,
  FileText,
  Camera,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/user';
import { paymentService } from '@/services/payment';
import { reportDataService } from '@/services/reportDataService';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  credits: number;
  total_predictions: number;
  profile_picture?: string;
  preferences: {
    email_notifications: boolean;
    data_usage_consent: boolean;
    marketing_emails: boolean;
  };
}

interface PaymentHistory {
  id: string;
  order_id: string;
  payment_id?: string;
  amount: number;
  credits: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  created_at: string;
  last_used?: string;
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [emailingReport, setEmailingReport] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{name: string, key: string} | null>(null);
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    data_usage_consent: false,
    marketing_emails: false
  });

  const [apiKeyName, setApiKeyName] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Personal information and preferences' },
    { id: 'security', label: 'Security', icon: Lock, description: 'Password and account security' },
    { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Payment history and credits' },
    { id: 'data', label: 'Data & Privacy', icon: Shield, description: 'Data usage and privacy controls' },
    { id: 'api', label: 'API Keys', icon: Key, description: 'Manage API access keys' }
  ];

  useEffect(() => {
    fetchUserData();
  }, [activeTab]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [profileData, historyData, keysData] = await Promise.all([
        userService.getProfile(),
        activeTab === 'billing' ? paymentService.getPaymentHistory() : Promise.resolve([]),
        activeTab === 'api' ? userService.getApiKeys() : Promise.resolve([])
      ]);
      
      setProfile(profileData);
      setPaymentHistory(historyData);
      setApiKeys(keysData);
      setPreferences(profileData.preferences || preferences);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => setProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      await userService.updateProfile(updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword({
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (newPreferences: typeof preferences) => {
    try {
      setLoading(true);
      await userService.updatePreferences(newPreferences);
      setPreferences(newPreferences);
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      setGeneratingReport(true);
      const reportData = await reportDataService.generateUserDataReport();
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `averion-labs-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data export downloaded successfully!');
    } catch (error) {
      console.error('Failed to download data:', error);
      toast.error('Failed to download data');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleEmailData = async () => {
    try {
      setEmailingReport(true);
      await reportDataService.emailUserDataReport();
      toast.success('Data report sent to your email!');
    } catch (error) {
      console.error('Failed to email data:', error);
      toast.error('Failed to email data');
    } finally {
      setEmailingReport(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!apiKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    try {
      setLoading(true);
      const newKey = await userService.createApiKey({ name: apiKeyName.trim() });
      setApiKeys(prev => [...prev, newKey.apiKey]);
      setNewlyCreatedKey({ name: apiKeyName, key: newKey.key });
      setApiKeyName('');
      setShowApiKeyDialog(true);
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      setLoading(true);
      await userService.deleteApiKey(keyId);
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast.error('Failed to delete API key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                      {profileImagePreview || user?.profile_picture ? (
                        <img 
                          src={profileImagePreview || user?.profile_picture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageChange}
                        />
                        Change Photo
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.profile_picture ? 'Current photo' : 'No photo uploaded'}
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, or GIF up to 5MB
                      </p>
                    </div>
                  </div>
                  
                  {profileImagePreview && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img 
                        src={profileImagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile?.username || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={user?.username || 'N/A'}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile?.name || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={user?.name || 'N/A'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Email Address', value: profile?.email || user?.email },
                    { label: 'Member Since', value: 'January 2024' }
                  ].map((field, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={field.value || 'N/A'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        readOnly
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Email Preferences</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'email_notifications', label: 'Analysis notifications', description: 'Get notified when your analysis is complete' },
                      { key: 'marketing_emails', label: 'Marketing emails', description: 'Receive updates about new features and offers' },
                      { key: 'data_usage_consent', label: 'Data usage consent', description: 'Controls how your data is used for service improvement and research' }
                    ].map((pref) => (
                      <div key={pref.key} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={pref.key}
                          checked={preferences[pref.key as keyof typeof preferences]}
                          onChange={(e) => {
                            const newPreferences = { ...preferences, [pref.key]: e.target.checked };
                            setPreferences(newPreferences);
                            handlePreferencesUpdate(newPreferences);
                          }}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <label htmlFor={pref.key} className="text-sm font-medium text-gray-900 cursor-pointer">
                            {pref.label}
                          </label>
                          <p className="text-xs text-gray-500">{pref.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleProfileUpdate(profile!)}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              <p className="text-sm text-gray-600 mb-6">Keep your account secure with a strong password.</p>
              
              <div className="space-y-4 max-w-md">
                {[
                  { key: 'currentPassword', label: 'Current Password', show: showPasswords.current },
                  { key: 'newPassword', label: 'New Password', show: showPasswords.new },
                  { key: 'confirmPassword', label: 'Confirm New Password', show: showPasswords.confirm }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={field.show ? 'text' : 'password'}
                        value={passwords[field.key as keyof typeof passwords]}
                        onChange={(e) => setPasswords(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ 
                          ...prev, 
                          [field.key.replace('Password', '') as keyof typeof prev]: !field.show 
                        }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {field.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={handlePasswordChange}
                  disabled={loading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Balance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Credits Remaining</span>
                    <span className="text-2xl font-bold text-blue-600">{user?.credits || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Predictions</span>
                    <span className="text-lg font-semibold text-gray-900">{user?.total_predictions || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {paymentHistory.length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Order #{payment.order_id.slice(-8)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Created: {formatDate(payment.created_at)}
                            {payment.completed_at && (
                              <span> • Completed: {formatDate(payment.completed_at)}</span>
                            )}
                          </p>
                          {payment.payment_id && (
                            <p className="text-xs text-gray-500">
                              Payment ID: {payment.payment_id.slice(-8)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{payment.amount}</p>
                          <p className="text-sm text-green-600">+{payment.credits} credits</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.status === 'failed' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-1">No payment history found</h4>
                  <p className="text-gray-600">Your transactions will appear here once you make a purchase</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h2>
              <p className="text-sm text-gray-600 mb-6">
                Download or email a complete analysis of your medical AI predictions, including statistics, payment history, and detailed insights.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Download Data Report</h3>
                    <p className="text-sm text-gray-600">Get a comprehensive PDF report with all your medical AI analysis data.</p>
                  </div>
                  <button
                    onClick={handleDownloadData}
                    disabled={generatingReport}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>{generatingReport ? 'Generating...' : 'Download'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Data Report</h3>
                    <p className="text-sm text-gray-600">Send the comprehensive report directly to your registered email address.</p>
                  </div>
                  <button
                    onClick={handleEmailData}
                    disabled={emailingReport}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{emailingReport ? 'Sending...' : 'Email Report'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Rights</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900">Account Deletion</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Deleting your account will permanently remove all your data, including analysis history, payment records, and API keys. This action cannot be undone.
                      </p>
                      <button className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
                        Request Account Deletion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                  <p className="text-sm text-gray-600">Generate a key to use the Averion Labs API programmatically.</p>
                </div>
                <button
                  onClick={() => setShowApiKeyDialog(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Key</span>
                </button>
              </div>

              {apiKeys.length > 0 ? (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
                          <p className="text-sm text-gray-600">
                            Created: {formatDate(apiKey.created_at)}
                          </p>
                          <p className="text-sm text-gray-500 font-mono">
                            {apiKey.key_preview}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-1">No API Keys</h4>
                  <p className="text-gray-600">You have not created any API keys yet.</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <SettingsIcon className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">Manage your account, preferences, and data rights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-start space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mt-0.5" />
                  <div>
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>

      {showApiKeyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {newlyCreatedKey ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">API Key Created</h3>
                  <button
                    onClick={() => {
                      setShowApiKeyDialog(false);
                      setNewlyCreatedKey(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Please copy your new API key. You will not be able to see it again.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-gray-900">{newlyCreatedKey.key}</span>
                      <button
                        onClick={() => copyToClipboard(newlyCreatedKey.key)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowApiKeyDialog(false);
                    setNewlyCreatedKey(null);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Create API Key</h3>
                  <button
                    onClick={() => setShowApiKeyDialog(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={apiKeyName}
                    onChange={(e) => setApiKeyName(e.target.value)}
                    placeholder="e.g., My App API Key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateApiKey}
                    disabled={loading || !apiKeyName.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Key'}
                  </button>
                  <button
                    onClick={() => setShowApiKeyDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
