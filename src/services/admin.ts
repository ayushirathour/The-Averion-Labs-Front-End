import api from './api';

export interface UserOut {
  username: string;
  email: string;
  name: string;
  credits: number;
  plan: string;
  role: string;
  total_predictions: number;
  credits_used: number;
  created_at: string;
  last_login?: string;
  last_prediction?: string;
  is_blocked: boolean;
  is_demo_user: boolean;
}

export interface UserListResponse {
  users: UserOut[];
  total_count: number;
  demo_users_count: number;
  blocked_users_count: number;
}

export interface SystemStats {
  total_users: number;
  active_users_30d: number;
  demo_users: number;
  total_predictions: number;
  predictions_today: number;
  total_credits_sold: number;
  revenue_estimate: number;
  avg_predictions_per_user: number;
}

export interface CreditOperation {
  username: string;
  credits_to_add: number;
  reason?: string;
  operation_type?: string;
}

export const adminService = {
  getUsers: async (): Promise<UserListResponse> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getSystemAnalytics: async (): Promise<SystemStats> => {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
  },

  getCsrfToken: async () => {
    const response = await api.get('/admin/csrf-token');
    return response.data;
  },

  blockUser: async (username: string, blocked: boolean, csrfToken: string) => {
    const response = await api.put(
      `/admin/users/${username}/block?blocked=${blocked}`,
      {},
      {
        headers: { 'X-CSRF-Token': csrfToken }
      }
    );
    return response.data;
  },

  manageCredits: async (operation: CreditOperation, csrfToken: string) => {
    const response = await api.post('/admin/credits/manage', operation, {
      headers: { 'X-CSRF-Token': csrfToken }
    });
    return response.data;
  },

  getCreditLogs: async () => {
    const response = await api.get('/admin/credits/logs');
    return response.data;
  },

  createDemoUser: async (demoUserData: {
    username: string;
    email: string;
    name: string;
    company?: string;
    purpose?: string;
    admin_secret: string;
  }, csrfToken: string) => {
    const response = await api.post('/admin/demo-users/create', demoUserData, {
      headers: { 'X-CSRF-Token': csrfToken }
    });
    return response.data;
  },

  getDemoUsers: async (skip = 0, limit = 50) => {
    const response = await api.get(`/admin/demo-users?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getUsersWithFilters: async (params: {
    skip?: number;
    limit?: number;
    search?: string;
    role_filter?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role_filter) queryParams.append('role_filter', params.role_filter);

    const response = await api.get(`/admin/users?${queryParams.toString()}`);
    return response.data;
  },
};
