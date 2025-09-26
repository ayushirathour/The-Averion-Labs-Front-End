export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  RESULTS: '/results',
  PAYMENT: '/payment',
  SETTINGS: '/settings',
  ADMIN: '/admin',
} as const;

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency?: string;
  popular?: boolean;
  description?: string;
}

export const PAYMENT_CONFIG = {
  PACKAGES: [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 10,
      price: 99,
      popular: false,
      description: '10 AI analysis credits'
    },
    {
      id: 'basic',
      name: 'Basic Pack',
      credits: 25,
      price: 199,
      popular: true,
      description: '25 AI analysis credits'
    },
    {
      id: 'professional',
      name: 'Professional Pack',
      credits: 50,
      price: 349,
      popular: false,
      description: '50 AI analysis credits'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      credits: 100,
      price: 599,
      popular: false,
      description: '100 AI analysis credits'
    }
  ] as CreditPackage[],
  CURRENCY: 'INR',
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_your_key_here'
} as const;

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 30 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const MEDICAL_CONFIG = {
  MODELS: {
    PNEUMONIA: { name: 'Pneumonia Detection', accuracy: 96.4 }
  }
} as const;

export const APP_CONFIG = {
  NAME: 'Averion Labs',
  API_URL: import.meta.env.VITE_API_URL,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
} as const;
