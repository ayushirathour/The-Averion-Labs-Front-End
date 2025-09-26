import api from './api';
import {
  DashboardData,
  UserSettings,
  UserInfo,
  PredictionHistoryItem,
  ChangePasswordRequest,
  APIKeyListResponse,
  APIKeyRequest,
  UpdateUsernameRequest,
  UpdateNameRequest,
  DeleteAccountRequest,
  UserStatistics,
  UserActivity,
  ProfilePictureUpdate,
  APIKeyResponse
} from '../types';

interface PredictionHistoryResponse {
  predictions: PredictionHistoryItem[];
  total_count: number;
}

export const userService = {
  getDashboard: async (): Promise<DashboardData> => {
    const dashboardPromise = api.get('/users/dashboard');
    const historyPromise = api.get('/users/predictions/history?limit=5');

    const [dashboardResponse, historyResponse] = await Promise.all([dashboardPromise, historyPromise]);

    const dashboardData = dashboardResponse.data;
    dashboardData.prediction_history = historyResponse.data.predictions;

    return dashboardData;
  },

  getProfile: async (): Promise<UserInfo> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getSettings: async (): Promise<UserSettings> => {
    const response = await api.get('/users/settings');
    return response.data;
  },

  updateSettings: async (settings: UserSettings): Promise<UserSettings> => {
    const response = await api.put('/users/settings', settings);
    return response.data;
  },

  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  },

  getApiKeys: async (): Promise<APIKeyListResponse> => {
    const response = await api.get('/users/api-keys');
    return response.data;
  },

  createApiKey: async (keyData: APIKeyRequest): Promise<APIKeyResponse> => {
    const response = await api.post('/users/api-keys', keyData);
    return response.data;
  },

  revokeApiKey: async (keyId: string): Promise<void> => {
    const response = await api.delete(`/users/api-keys/${keyId}`);
    return response.data;
  },

  updateUsername: async (data: UpdateUsernameRequest): Promise<{ message: string; old_username: string; new_username: string; note: string }> => {
    const response = await api.put('/users/profile/username', data);
    return response.data;
  },

  updateName: async (data: UpdateNameRequest): Promise<{ message: string; old_name: string; new_name: string }> => {
    const response = await api.put('/users/profile/name', data);
    return response.data;
  },

  updateProfilePicture: async (data: ProfilePictureUpdate): Promise<{ message: string; profile_picture_url: string }> => {
    const response = await api.put('/users/profile/picture', data);
    return response.data;
  },

  deleteAccount: async (data: DeleteAccountRequest): Promise<{ message: string }> => {
    const response = await api.delete('/users/account', { data });
    return response.data;
  },

  getStatistics: async (): Promise<UserStatistics> => {
    const response = await api.get('/users/statistics');
    return response.data;
  },

  getActivity: async (days: number = 30): Promise<UserActivity> => {
    const response = await api.get(`/users/activity?days=${days}`);
    return response.data;
  },

  downloadReport: async (): Promise<Blob> => {
    const response = await api.get('/users/report/download', {
      responseType: 'blob'
    });
    return response.data;
  },

  emailReport: async (email?: string): Promise<{ message: string }> => {
    const response = await api.post('/users/report/email', email ? { email } : {});
    return response.data;
  },
};
