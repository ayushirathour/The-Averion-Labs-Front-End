
export interface UserInfo {
  username: string;
  email: string;
  name: string;
  credits: number;
  plan: string;
  created_at?: string;
  total_predictions?: number;
  role?: string;
  profile_picture?: string;
}

export interface User {
  username: string;
  email: string;
  name: string;
  credits: number;
  plan: string;
  created_at: string;
  total_predictions: number;
  role: 'user' | 'demo' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  user_info: User;
}

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

export interface DashboardData {
  total_predictions: number;
  recent_predictions: number;
  credits_remaining: number;
  credits_used: number;
  member_since: string;
  this_week_predictions: number;
  avg_confidence: number | null;
  prediction_history?: PredictionHistoryItem[];
  this_month_predictions?: number;
  pneumonia_detected?: number;
  normal_cases?: number;
  skin_cancer_cases?: number;
}

export interface PredictionHistoryItem {
  id: string;
  filename: string;
  diagnosis: string;
  confidence: number;
  timestamp: string;
  notes?: string;
  image_size?: string;
  processing_time?: number;
  batch_id?: string;
}

export interface BatchResult {
  batch_id: string;
  status: string;
  user: string;
  timestamp: string;
  model_type?: string; 
  summary: {
    total_files: number;
    successful_predictions: number;
    failed_predictions: number;
    average_confidence: number;
    processing_time_seconds: number;
    credits_consumed: number;
    pneumonia_detected?: number; 
    normal_cases?: number;
  };
  results: any[];
  credits_remaining: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  currency?: string;
  description?: string;
}

export interface PaymentOrderResponse {
  payment_id: string;
  order_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  credits: number;
  package_name: string;
  razorpay_key_id: string;
}

export interface PaymentVerificationRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface UserSettings {
  notifications_enabled: boolean;
  email_reports: boolean;
  privacy_level: 'basic' | 'standard' | 'high';
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface APIKeyRequest {
  name: string;
  expires_days?: number;
}

export interface APIKeyResponse {
  id: string;
  name: string;
  key?: string;
  created_at: string;
  expires_at?: string;
  last_used?: string;
  is_active: boolean;
}

export interface APIKeyListResponse {
  api_keys: APIKeyResponse[];
  total_count: number;
}

export interface PredictionInitiationResponse {
  prediction_id: string;
  status: 'processing' | 'completed' | 'failed';
  message: string;
  credits_remaining: number;
  check_result_at: string;
}

export interface PredictionResult {
  diagnosis?: string;
  confidence?: number;
  recommendation?: string;
  filename?: string;
  timestamp?: string;
}

export interface UserOut {
  username: string;
  email: string;
  name: string;
  credits: number;
  plan: string;
  role: 'user' | 'demo' | 'admin';
  total_predictions: number;
  credits_used: number;
  created_at: string;
  last_login?: string;
  last_prediction?: string;
  is_blocked: boolean;
  is_demo_user: boolean;
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

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}


export interface UpdateUsernameRequest {
  new_username: string;
  password: string;
}

export interface UpdateNameRequest {
  new_name: string;
}

export interface DeleteAccountRequest {
  password: string;
  confirmation: string;
  reason?: string;
}

export interface UserStatistics {
  total_predictions: number;
  this_month_predictions: number;
  this_week_predictions: number;
  pneumonia_detected: number;
  normal_cases: number;
  accuracy_rate?: number;
  credits_used: number;
  credits_remaining: number;
  avg_confidence?: number;
  most_active_day?: string;
}

export interface UserActivity {
  recent_actions: Array<{
    action: string;
    timestamp: string;
    details?: string;
  }>;
  login_history: Array<{
    timestamp: string;
    ip_address?: string;
    user_agent?: string;
  }>;
}

export interface ProfilePictureUpdate {
  profile_picture_url: string;
}

