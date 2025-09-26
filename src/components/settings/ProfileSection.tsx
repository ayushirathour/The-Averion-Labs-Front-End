// src/components/settings/ProfileSection.tsx - COMPLETE REWRITE
import React, { useState } from 'react';
import { Card, Button, Input, Alert, Spinner } from '@/components/ui';
import { Edit2, Save, X, User, AtSign, Mail, Crown, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import toast from 'react-hot-toast';

const ProfileSection: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    updateUsername, 
    updateName, 
    updateProfilePicture,
    isUpdatingUsername,
    isUpdatingName,
    isUpdatingProfilePicture 
  } = useUserProfile();

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPicture, setIsEditingPicture] = useState(false);

  // Form states
  const [newName, setNewName] = useState(user?.name || '');
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [newPictureUrl, setNewPictureUrl] = useState(user?.profile_picture || '');
  const [currentPassword, setCurrentPassword] = useState('');

  // ✅ CRITICAL: Reset form values when user changes
  React.useEffect(() => {
    if (user) {
      setNewName(user.name || '');
      setNewUsername(user.username || '');
      setNewPictureUrl(user.profile_picture || '');
    }
  }, [user]);

  const handleNameUpdate = async () => {
    if (!newName.trim() || newName === user?.name) {
      toast.error('Please enter a different name');
      return;
    }

    try {
      await updateName({ new_name: newName });
      setIsEditingName(false);
      toast.success('Name updated successfully!');
    } catch (error) {
      toast.error('Failed to update name');
    }
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim() || newUsername === user?.username) {
      toast.error('Please enter a different username');
      return;
    }

    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    try {
      await updateUsername({ 
        new_username: newUsername, 
        password: currentPassword 
      });
      
      // ✅ CRITICAL: Force logout after username change
      toast.success('Username updated! Logging out for security...');
      setTimeout(async () => {
        await logout();
        window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to update username');
    }
  };

  const handlePictureUpdate = async () => {
    if (!newPictureUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    try {
      await updateProfilePicture({ profile_picture_url: newPictureUrl });
      setIsEditingPicture(false);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to update profile picture');
    }
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        <p className="text-gray-600">Manage your public profile information.</p>
      </div>

      <Card className="p-6">
        {/* Profile Picture Section */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            <img
              src={user.profile_picture || '/default-avatar.png'}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
            />
            <button
              onClick={() => setIsEditingPicture(true)}
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={14} />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-600">@{user.username}</p>
            <p className="text-sm text-gray-500">{user.plan} Plan</p>
          </div>
        </div>

        {/* Profile Picture Edit Modal */}
        {isEditingPicture && (
          <Alert className="mb-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Update Profile Picture</h4>
              <Input
                label="Image URL"
                value={newPictureUrl}
                onChange={(e) => setNewPictureUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isUpdatingProfilePicture}
              />
              <div className="flex space-x-2">
                <Button 
                  onClick={handlePictureUpdate}
                  disabled={isUpdatingProfilePicture}
                  size="sm"
                >
                  {isUpdatingProfilePicture ? <Spinner size="sm" /> : <Save size={16} />}
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingPicture(false)}
                  size="sm"
                >
                  <X size={16} />
                  Cancel
                </Button>
              </div>
            </div>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                <User className="inline w-4 h-4 mr-1" />
                Full Name
              </label>
              {!isEditingName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                >
                  <Edit2 size={14} />
                </Button>
              )}
            </div>
            
            {isEditingName ? (
              <div className="space-y-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isUpdatingName}
                />
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleNameUpdate}
                    disabled={isUpdatingName}
                    size="sm"
                  >
                    {isUpdatingName ? <Spinner size="sm" /> : <Save size={16} />}
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(user.name || '');
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 font-medium">{user.name}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                <AtSign className="inline w-4 h-4 mr-1" />
                Username
              </label>
              {!isEditingUsername && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingUsername(true)}
                >
                  <Edit2 size={14} />
                </Button>
              )}
            </div>
            
            {isEditingUsername ? (
              <div className="space-y-2">
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  disabled={isUpdatingUsername}
                />
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={isUpdatingUsername}
                />
                <Alert type="warning" className="text-sm">
                  ⚠️ Changing your username will log you out. You'll need to log in again.
                </Alert>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleUsernameUpdate}
                    disabled={isUpdatingUsername}
                    size="sm"
                  >
                    {isUpdatingUsername ? <Spinner size="sm" /> : <Save size={16} />}
                    Update & Logout
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingUsername(false);
                      setNewUsername(user.username || '');
                      setCurrentPassword('');
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 font-medium">@{user.username}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address
            </label>
            <p className="text-gray-900">{user.email}</p>
          </div>

          {/* Plan (Read-only) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Crown className="inline w-4 h-4 mr-1" />
              Current Plan
            </label>
            <p className="text-gray-900 font-medium">{user.plan}</p>
          </div>

          {/* Credits */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Credits Remaining
            </label>
            <p className="text-2xl font-bold text-blue-600">{user.credits.toLocaleString()}</p>
          </div>

          {/* Member Since */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="inline w-4 h-4 mr-1" />
              Member Since
            </label>
            <p className="text-gray-900">
              {new Date(user.created_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSection;
