import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import toast from 'react-hot-toast';  

const DataDeletionRequest: React.FC = () => {
  const { deleteAccount, isDeletingAccount } = useUserProfile();
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState(''); 

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== 'delete my account') {
      toast.error('Please type "delete my account" to confirm');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    try {
      
      await deleteAccount({ 
        password: password,
        confirmation: confirmText,
        reason: reason || 'User requested deletion'
      });
      toast.success('Account deletion request submitted successfully');
    } catch (error) {
      toast.error('Failed to process deletion request');
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Right to Erasure</h3>
          <p className="text-sm text-red-800 mb-4">
            Request permanent deletion of your account and all associated data. 
            This action cannot be undone.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-red-900 mb-2">
                Reason for deletion (optional):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Tell us why you're leaving..."
                rows={3}
              />
            </div>

            
            <div>
              <label className="block text-sm font-medium text-red-900 mb-2">
                Enter your password to confirm:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Your account password"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-red-900 mb-2">
                Type "delete my account" to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="delete my account"
              />
            </div>
            
            <button
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || confirmText.toLowerCase() !== 'delete my account' || !password.trim()}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isDeletingAccount ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {isDeletingAccount ? 'Processing...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionRequest;
