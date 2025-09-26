// src/components/settings/AccountSection.tsx - Account Security & Management

import React, { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { 
  Shield, 
  Key, 
  Trash2, 
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountSectionProps {
  className?: string;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ className = '' }) => {
  const { 
    user, 
    deleteAccount,
    isDeletingAccount
  } = useUserProfile();

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Account deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    password: '',
    confirmation: '',
    reason: ''
  });

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const passwordValidation = validatePassword(passwordData.newPassword);
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;

  const handlePasswordChange = async () => {
    if (!passwordValidation.isValid) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      // Note: You'll need to add this method to your useUserProfile hook
      // await changePassword({
      //   old_password: passwordData.oldPassword,
      //   new_password: passwordData.newPassword
      // });
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.confirmation !== 'DELETE_MY_ACCOUNT') {
      toast.error('Please type "DELETE_MY_ACCOUNT" to confirm');
      return;
    }

    if (!deleteConfirmation.password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      await deleteAccount({
        password: deleteConfirmation.password,
        confirmation: deleteConfirmation.confirmation,
        reason: deleteConfirmation.reason
      });
      
      toast.success('Account deletion initiated. You will be logged out shortly.');
      setShowDeleteModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    }
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!user) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading account settings...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={`p-6 ${className}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
          </div>

          {/* Account Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">Account Active</h4>
                <p className="text-sm text-green-700">Your account is secure and verified</p>
              </div>
            </div>
          </div>

          {/* Password Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Password</h4>
                <p className="text-sm text-gray-500">Last changed: Never shown for security</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center space-x-2"
              >
                <Key className="h-4 w-4" />
                <span>Change Password</span>
              </Button>
            </div>

            {/* Password Change Form */}
            {showPasswordForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <h5 className="font-medium text-gray-900">Change Password</h5>
                
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.old ? 'text' : 'password'}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('old')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {passwordData.newPassword && (
                    <div className="mt-2 space-y-1 text-xs">
                      <div className={`flex items-center space-x-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`} />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-gray-400'}`} />
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordValidation.hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordValidation.hasLower ? 'text-green-600' : 'text-gray-400'}`} />
                        <span>One lowercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`} />
                        <span>One number</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-400'}`} />
                        <span>One special character</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={!passwordValidation.isValid || !passwordsMatch || changingPassword}
                    className="flex items-center space-x-2"
                  >
                    {changingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                    <span>{changingPassword ? 'Changing...' : 'Change Password'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800">Danger Zone</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                    className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Deletion Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="lg"
      >
        <div className="space-y-4">
          <Alert type="error" title="This action cannot be undone">
            <p>
              This will permanently delete your account and remove your data from our servers. 
              This action cannot be undone and complies with GDPR/DPDP data deletion requirements.
            </p>
          </Alert>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <strong>DELETE_MY_ACCOUNT</strong> to confirm:
              </label>
              <Input
                value={deleteConfirmation.confirmation}
                onChange={(e) => setDeleteConfirmation(prev => ({ ...prev, confirmation: e.target.value }))}
                placeholder="DELETE_MY_ACCOUNT"
                className="font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your password:
              </label>
              <Input
                type="password"
                value={deleteConfirmation.password}
                onChange={(e) => setDeleteConfirmation(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Your current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deletion (optional):
              </label>
              <textarea
                value={deleteConfirmation.reason}
                onChange={(e) => setDeleteConfirmation(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Help us improve by telling us why you're leaving..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || deleteConfirmation.confirmation !== 'DELETE_MY_ACCOUNT'}
              className="flex items-center space-x-2"
            >
              {isDeletingAccount ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>{isDeletingAccount ? 'Deleting...' : 'Delete My Account'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation({ password: '', confirmation: '', reason: '' });
              }}
              disabled={isDeletingAccount}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
