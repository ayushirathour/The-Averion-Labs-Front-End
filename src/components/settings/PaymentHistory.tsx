// src/components/payment/PaymentHistorySection.tsx - Enhanced UX Version

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, Spinner, Badge } from '@/components/ui';
import { formatDate } from '@/utils/helpers';

interface PaymentHistoryItem {
  id: string;
  order_id: string;
  payment_id: string | null;
  amount: number;
  credits: number;
  package: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface PaymentHistorySectionProps {
  history: PaymentHistoryItem[];
  isLoading: boolean;
}

// 🎨 UX: Professional package name mapping
const PROFESSIONAL_PACKAGE_NAMES: Record<string, string> = {
  'Starter Pack': 'Basic',
  'Basic Pack': 'Professional', 
  'Professional Pack': 'Clinical',
  'Enterprise Pack': 'Institutional',
  // Handle variations
  'starter': 'Basic',
  'basic': 'Professional',
  'professional': 'Clinical',
  'enterprise': 'Institutional'
};

// 🎨 UX: Status styling and icons
const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return {
        icon: CheckCircle,
        label: 'Completed',
        className: 'bg-green-100 text-green-800 border-green-200',
        dotColor: 'bg-green-500'
      };
    case 'created':
    case 'pending':
      return {
        icon: Clock,
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        dotColor: 'bg-yellow-500'
      };
    case 'failed':
      return {
        icon: XCircle,
        label: 'Failed',
        className: 'bg-red-100 text-red-800 border-red-200',
        dotColor: 'bg-red-500'
      };
    default:
      return {
        icon: AlertCircle,
        label: status.charAt(0).toUpperCase() + status.slice(1),
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        dotColor: 'bg-gray-500'
      };
  }
};

// 🎨 UX: Format time for better readability
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// 🎨 UX: Calculate processing time
const getProcessingTime = (created: string, completed: string | null) => {
  if (!completed) return null;
  const createdTime = new Date(created).getTime();
  const completedTime = new Date(completed).getTime();
  const diffMinutes = Math.round((completedTime - createdTime) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Instant';
  if (diffMinutes === 1) return '1 minute';
  if (diffMinutes < 60) return `${diffMinutes} minutes`;
  
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const PaymentHistorySection: React.FC<PaymentHistorySectionProps> = ({
  history,
  isLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-12"
      >
        <Card className="p-8 text-center">
          <Spinner size="lg" />
          <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Loading Payment History</h3>
          <p className="text-gray-600">Retrieving your transaction records...</p>
        </Card>
      </motion.div>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-12"
      >
        <Card className="p-8 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment History</h3>
          <p className="text-gray-600">Your payment transactions will appear here once you make your first purchase.</p>
        </Card>
      </motion.div>
    );
  }

  // 🎨 UX: Group payments by status for better organization
  const completedPayments = history.filter(p => p.status === 'completed');
  const pendingPayments = history.filter(p => p.status === 'created' || p.status === 'pending');
  const failedPayments = history.filter(p => p.status === 'failed');

  const displayedHistory = showAll ? history : history.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mb-12"
    >
      <Card className="p-6">
        
        {/* Header with summary stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
              <p className="text-sm text-gray-600">
                {completedPayments.length} completed • {pendingPayments.length} pending
                {failedPayments.length > 0 && ` • ${failedPayments.length} failed`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span className="text-sm font-medium">
              {isExpanded ? 'Hide Details' : 'View Details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Expanded payment details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {displayedHistory.map((payment, index) => {
                const statusConfig = getStatusConfig(payment.status);
                const StatusIcon = statusConfig.icon;
                const professionalName = PROFESSIONAL_PACKAGE_NAMES[payment.package] || payment.package;
                const processingTime = getProcessingTime(payment.created_at, payment.completed_at);
                
                return (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      
                      {/* Left side - Package info */}
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-semibold text-gray-900">{professionalName} Package</h4>
                            <Badge className={`${statusConfig.className} border`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{payment.credits} credits</p>
                          
                          {/* Timeline */}
                          <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
                              <span>
                                Ordered: {formatDate(payment.created_at)} at {formatTime(payment.created_at)}
                              </span>
                            </div>
                            
                            {payment.completed_at && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>
                                  Completed: {formatDate(payment.completed_at)} at {formatTime(payment.completed_at)}
                                  {processingTime && <span className="ml-2 text-green-600">({processingTime})</span>}
                                </span>
                              </div>
                            )}
                            
                            {payment.status === 'created' && (
                              <div className="flex items-center space-x-2 text-yellow-600">
                                <Clock className="w-3 h-3" />
                                <span>Payment pending completion</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side - Amount and order ID */}
                      <div className="text-right ml-4">
                        <p className="text-xl font-semibold text-gray-900 mb-1">
                          ₹{payment.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          ₹{(payment.amount / payment.credits).toFixed(1)} per credit
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          #{payment.order_id.slice(-8)}
                        </p>
                        {payment.payment_id && (
                          <p className="text-xs text-gray-400 font-mono">
                            Pay: {payment.payment_id.slice(-6)}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Show more/less toggle */}
            {history.length > 5 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  {showAll 
                    ? 'Show Recent Only' 
                    : `View All ${history.length} Transactions`
                  }
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Collapsed summary view */}
        {!isExpanded && (
          <div className="text-center text-gray-600">
            <p className="text-sm">
              You have {history.length} payment record{history.length !== 1 ? 's' : ''}. 
              Click "View Details" to see your complete transaction history.
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default PaymentHistorySection;
