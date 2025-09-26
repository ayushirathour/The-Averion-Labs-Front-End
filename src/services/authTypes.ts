export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    name: string;
    password: string;
  }
  
  export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user_info: UserInfo;
  }
  
  export interface UserInfo {
    username: string;
    email: string;
    name: string;
    credits: number;
    plan: string;
    created_at?: string;
    total_predictions?: number;
    profile_picture?: string;
  }
  
  export interface ForgotPasswordRequest {
    email: string;
  }
  
  export interface ResetPasswordRequest {
    token: string;
    new_password: string;
  }
  
  export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
  }
  
  export interface ApiError {
    detail: string;
  }
  