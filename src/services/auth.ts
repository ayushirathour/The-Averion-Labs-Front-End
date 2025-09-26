import api from './api';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  name: string;
  password: string;
}

interface UserInfo {
  username: string;
  email: string;
  name: string;
  credits: number;
  plan: string;
  created_at?: string;
  total_predictions?: number;
  role?: string;
}

interface AuthResponseRaw {
  message?: string;
  access_token: string;
  refresh_token: string;
  token_type?: string;
  user_info?: UserInfo;
  user?: UserInfo;
}

interface AuthResponseNormalized {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  user: UserInfo;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponseNormalized> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const raw: AuthResponseRaw = response.data;
    const normalized: AuthResponseNormalized = {
      access_token: raw.access_token,
      refresh_token: raw.refresh_token,
      token_type: raw.token_type,
      user: (raw.user || raw.user_info) as UserInfo,
    };

    localStorage.setItem('access_token', normalized.access_token);
    localStorage.setItem('refresh_token', normalized.refresh_token);
    localStorage.setItem('user', JSON.stringify(normalized.user));

    return normalized;
  }

  async register(userData: RegisterRequest): Promise<AuthResponseNormalized> {
    const response = await api.post('/auth/register', userData);
    
    const raw: AuthResponseRaw = response.data;
    const normalized: AuthResponseNormalized = {
      access_token: raw.access_token,
      refresh_token: raw.refresh_token,
      token_type: raw.token_type,
      user: (raw.user || raw.user_info) as UserInfo,
    };

    localStorage.setItem('access_token', normalized.access_token);
    localStorage.setItem('refresh_token', normalized.refresh_token);
    localStorage.setItem('user', JSON.stringify(normalized.user));

    return normalized;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    }
  }

  async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      throw error;
    }
  }

  async getProfile(): Promise<UserInfo> {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  async handleGoogleCallback(code: string): Promise<AuthResponseNormalized> {
    const response = await api.get(`/auth/google/callback?code=${code}`);
    const raw: AuthResponseRaw = response.data;
    
    const normalized: AuthResponseNormalized = {
      access_token: raw.access_token,
      refresh_token: raw.refresh_token,
      token_type: raw.token_type,
      user: (raw.user || raw.user_info) as UserInfo,
    };

    if (normalized.access_token) {
      localStorage.setItem('access_token', normalized.access_token);
      localStorage.setItem('refresh_token', normalized.refresh_token);
      localStorage.setItem('user', JSON.stringify(normalized.user));
    }

    return normalized;
  }

  async getGoogleLoginUrl(): Promise<{ login_url: string }> {
    const response = await api.get('/auth/google/login');
    return response.data;
  }

  async checkGoogleStatus(): Promise<{ available: boolean }> {
    const response = await api.get('/auth/google/status');
    return response.data;
  }

  async forgotPassword(request: { email: string }): Promise<void> {
    await api.post('/users/forgot-password', request);
  }

  async resetPassword(request: { token: string; new_password: string }): Promise<void> {
    await api.post('/users/reset-password', request);
  }

  async initiateGoogleLogin(): Promise<{ login_url: string }> {
    const response = await api.get('/auth/google/login');
    return response.data;
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth_token');
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

const authService = new AuthService();
export default authService;
