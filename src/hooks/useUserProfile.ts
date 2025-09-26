import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user';
import {
  UpdateUsernameRequest,
  UpdateNameRequest,
  DeleteAccountRequest,
  UserStatistics,
  UserActivity,
  ProfilePictureUpdate
} from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useUserProfile = () => {
  const queryClient = useQueryClient();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: statistics,
    isLoading: statisticsLoading,
    refetch: refetchStatistics
  } = useQuery({
    queryKey: ['user-statistics'],
    queryFn: () => userService.getStatistics(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: activity,
    isLoading: activityLoading,
    refetch: refetchActivity
  } = useQuery({
    queryKey: ['user-activity'],
    queryFn: () => userService.getActivity(30),
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  const updateUsernameMutation = useMutation({
    mutationFn: (data: UpdateUsernameRequest) => userService.updateUsername(data),
    onSuccess: (data) => {
      toast.success(`Username updated to @${data.new_username}! Please login again.`);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update username');
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: (data: UpdateNameRequest) => userService.updateName(data),
    onSuccess: async (data) => {
      toast.success(`Name updated to ${data.new_name}!`);
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update name');
    },
  });

  const updateProfilePictureMutation = useMutation({
    mutationFn: (data: ProfilePictureUpdate) => userService.updateProfilePicture(data),
    onSuccess: async (data) => {
      toast.success('Profile picture updated successfully!');
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile picture');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (passwordData: { old_password: string; new_password: string }) =>
      userService.changePassword(passwordData),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change password');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (data: DeleteAccountRequest) => userService.deleteAccount(data),
    onSuccess: () => {
      toast.success('Account deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete account');
    },
  });

  const downloadReportMutation = useMutation({
    mutationFn: () => userService.downloadReport(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `averion-labs-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to download report');
    },
  });

  const emailReportMutation = useMutation({
    mutationFn: (email?: string) => userService.emailReport(email),
    onSuccess: () => {
      toast.success('Report sent to your email successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send report');
    },
  });

  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        refetchStatistics(),
        refetchActivity(),
        refreshUser()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    statistics,
    activity,
    isLoading: isLoading || statisticsLoading || activityLoading,
    statisticsLoading,
    activityLoading,
    isUpdatingUsername: updateUsernameMutation.isPending,
    isUpdatingName: updateNameMutation.isPending,
    isUpdatingProfilePicture: updateProfilePictureMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
    isDownloadingReport: downloadReportMutation.isPending,
    isEmailingReport: emailReportMutation.isPending,
    updateUsername: updateUsernameMutation.mutate,
    updateName: updateNameMutation.mutate,
    updateProfilePicture: updateProfilePictureMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    deleteAccount: deleteAccountMutation.mutate,
    downloadReport: downloadReportMutation.mutate,
    emailReport: emailReportMutation.mutate,
    refreshAllData,
    refetchStatistics,
    refetchActivity,
  };
};

export type UseUserProfileReturn = ReturnType<typeof useUserProfile>;
