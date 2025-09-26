import api from './api';
import { PaymentOrderResponse, PaymentVerificationRequest } from '@/types';

export interface PaymentHistoryItem {
  id: string;
  order_id: string;
  payment_id?: string | null;
  amount: number;
  credits: number;
  package: string;
  status: 'completed' | 'created' | 'failed';
  created_at: string;
  completed_at?: string | null;
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  total_payments: number;
}

export interface FormattedPaymentData {
  id: string;
  order_id: string;
  payment_id?: string | null;
  amount: number;
  credits: number;
  package: string;
  status: 'completed' | 'created' | 'failed';
  created_at: string;
  completed_at?: string | null;
  formattedDate: string;
  formattedAmount: string;
  pricePerCredit: string;
  userInfo?: any;
}

export const paymentService = {
  async createOrder(packageId: string): Promise<PaymentOrderResponse> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await api.post('/payments/create-order', {
          package: packageId
        }, {
          timeout: 15000,
        });

        const orderData = response.data;

        if (!orderData.order_id && !orderData.razorpay_order_id) {
          throw new Error('Invalid payment order response - missing order ID');
        }

        return {
          payment_id: orderData.payment_id || orderData.id || '',
          order_id: orderData.order_id || orderData.razorpay_order_id,
          razorpay_order_id: orderData.razorpay_order_id || orderData.order_id,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          credits: orderData.credits,
          package_name: orderData.package_name || orderData.name,
          razorpay_key_id: orderData.razorpay_key_id || import.meta.env.REACT_APP_RAZORPAY_KEY_ID
        };
      } catch (error: any) {
        lastError = error;

        const isRetryableError =
          error.code === 'ECONNABORTED' ||
          error.response?.status >= 500 ||
          error.message?.includes('Connection aborted') ||
          error.message?.includes('Network Error');

        if (isRetryableError && attempt < maxRetries) {
          const delayMs = attempt * 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }

        break;
      }
    }

    if (lastError.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (lastError.response?.status === 400) {
      const errorDetail = lastError.response.data?.detail || lastError.response.data?.message;
      throw new Error(`Invalid request: ${errorDetail || 'Bad request'}`);
    } else {
      const errorMessage = lastError.response?.data?.detail ||
        lastError.response?.data?.message ||
        lastError.message;
      throw new Error(`Failed to create payment order: ${errorMessage}`);
    }
  },

  async verifyPayment(verificationData: PaymentVerificationRequest) {
    try {
      const response = await api.post('/payments/verify', verificationData, {
        timeout: 30000,
      });

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message;
      throw new Error(`Payment verification failed: ${errorMessage}`);
    }
  },

  async getPackages() {
    try {
      const response = await api.get('/payments/packages');

      let packages;
      if (response.data.packages) {
        if (typeof response.data.packages === 'object' && !Array.isArray(response.data.packages)) {
          packages = Object.entries(response.data.packages).map(([key, value]: [string, any]) => ({
            id: key,
            ...value
          }));
        } else if (Array.isArray(response.data.packages)) {
          packages = response.data.packages;
        } else {
          throw new Error('Invalid packages format');
        }
      } else if (Array.isArray(response.data)) {
        packages = response.data;
      } else {
        throw new Error('Invalid packages response format');
      }

      if (!Array.isArray(packages)) {
        throw new Error('Packages data is not in array format');
      }

      return packages;
    } catch (error: any) {
      throw new Error('Failed to load credit packages. Please refresh the page.');
    }
  },

  async getPaymentHistory(): Promise<PaymentHistoryResponse> {
    try {
      const response = await api.get('/payments/history');

      if (!response.data || !Array.isArray(response.data.payments)) {
        throw new Error('Invalid payment history response format');
      }

      return response.data as PaymentHistoryResponse;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        throw new Error('Payment history not found.');
      } else {
        const errorMessage = error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message;
        throw new Error(`Failed to load payment history: ${errorMessage}`);
      }
    }
  },

  generateInvoiceFilename: (payment: PaymentHistoryItem): string => {
    try {
      const date = new Date(payment.created_at).toISOString().split('T')[0];
      const orderId = payment.order_id.slice(-8);
      return `Averion-Labs-Invoice-${orderId}-${date}.pdf`;
    } catch (error) {
      console.error('Error generating filename:', error);
      return `Averion-Labs-Invoice-${payment.order_id.slice(-8)}.pdf`;
    }
  },

  formatPaymentForPDF: (payment: PaymentHistoryItem, userInfo?: any): FormattedPaymentData => {
    try {
      return {
        ...payment,
        formattedDate: new Date(payment.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        formattedAmount: payment.amount.toLocaleString('en-IN'),
        pricePerCredit: (payment.amount / payment.credits).toFixed(1),
        userInfo: userInfo || null
      };
    } catch (error) {
      console.error('Error formatting payment for PDF:', error);
      return {
        ...payment,
        formattedDate: 'Invalid Date',
        formattedAmount: payment.amount.toString(),
        pricePerCredit: '0.0',
        userInfo: userInfo || null
      };
    }
  },

  getProfessionalPackageName: (packageName: string): string => {
    const packageMapping: Record<string, string> = {
      'Starter Pack': 'Basic',
      'Basic Pack': 'Professional',
      'Professional Pack': 'Clinical',
      'Enterprise Pack': 'Institutional',
      'starter': 'Basic',
      'basic': 'Professional',
      'professional': 'Clinical',
      'enterprise': 'Institutional'
    };
    return packageMapping[packageName] || packageName;
  },

  generateInvoiceMetadata: (payment: PaymentHistoryItem) => {
    return {
      invoiceNumber: `#${payment.order_id.slice(-8)}`,
      date: new Date(payment.created_at).toLocaleDateString('en-IN'),
      dueDate: 'Immediate',
      terms: 'Payment completed via Razorpay',
      currency: 'INR',
      subtotal: payment.amount,
      tax: 0,
      total: payment.amount,
      paymentMethod: 'Razorpay Gateway'
    };
  }
};
