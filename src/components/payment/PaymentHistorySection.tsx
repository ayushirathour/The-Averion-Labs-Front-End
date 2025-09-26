import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Plus
} from 'lucide-react';
import { PaymentHistoryItem } from '@/services/payment';
import InvoiceModal from './InvoiceModal';

interface PaymentHistorySectionProps {
  history: PaymentHistoryItem[];
  isLoading: boolean;
}

type FilterType = 'all' | 'completed' | 'pending' | 'failed';

const PaymentHistorySection: React.FC<PaymentHistorySectionProps> = ({
  history,
  isLoading
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryItem | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getPackageDisplayName = (packageName: string) => {
    const packageMapping: Record<string, string> = {
      'Starter Pack': 'Basic',
      'Basic Pack': 'Professional',
      'Professional Pack': 'Clinical',
      'Enterprise Pack': 'Institutional',
      'starter': 'Basic',
      'basic': 'Professional',
      'professional': 'Clinical',
      'enterprise': 'Institutional',
      'Basic': 'Basic',
      'Professional': 'Professional',
      'Clinical': 'Clinical',
      'Institutional': 'Institutional'
    };
    return packageMapping[packageName] || packageName;
  };

  const filteredHistory = useMemo(() => {
    return history.filter(payment => {
      let statusToCheck = selectedFilter;
      if (selectedFilter === 'pending') {
        statusToCheck = 'created';
      }

      if (selectedFilter !== 'all' && payment.status !== statusToCheck) {
        return false;
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          payment.order_id.toLowerCase().includes(searchLower) ||
          payment.package.toLowerCase().includes(searchLower) ||
          payment.payment_id?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [history, selectedFilter, searchTerm]);

  const displayedHistory = expanded ? filteredHistory : filteredHistory.slice(0, 5);

  const filterCounts = useMemo(() => {
    return {
      all: history.length,
      completed: history.filter(p => p.status === 'completed').length,
      pending: history.filter(p => p.status === 'created').length,
      failed: history.filter(p => p.status === 'failed').length
    };
  }, [history]);

  const handleViewInvoice = (payment: PaymentHistoryItem) => {
    setSelectedPayment(payment);
    setShowInvoice(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'created':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'created':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Loading payment history...
        </h2>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse mb-4 p-4 bg-gray-50 rounded-lg h-20" />
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment History</h3>
        <p className="text-gray-600">
          Your payment transactions will appear here once you make your first purchase.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-12">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {filteredHistory.length}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6 bg-gray-50 p-2 rounded-lg overflow-x-auto">
        {(['all', 'completed', 'pending', 'failed'] as FilterType[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedFilter === filter
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="capitalize">
              {filter === 'pending' ? 'Pending' : filter}
            </span>
            {filterCounts[filter] > 0 && (
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {filterCounts[filter]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {displayedHistory.map((payment, index) => (
          <motion.div
            key={payment.order_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {payment.credits}
                  </div>
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    <Plus className="h-3 w-3" />
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1">
                    +{payment.credits}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {payment.credits} credits
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{getPackageDisplayName(payment.package)} Package</span>
                    <span>₹{payment.amount.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>₹{(payment.amount / payment.credits).toFixed(1)} per credit</span>
                    <span>
                      {new Date(payment.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="text-xs text-gray-500">
                  <div>#{payment.order_id.slice(-8)}</div>
                  {payment.payment_id && (
                    <div>Pay: {payment.payment_id.slice(-6)}</div>
                  )}
                </div>

                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                  {getStatusIcon(payment.status)}
                  <span>{payment.status === 'created' ? 'Pending' : payment.status}</span>
                </div>

                {payment.status === 'completed' && (
                  <button
                    onClick={() => handleViewInvoice(payment)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4 inline mr-1" />
                    View Invoice
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredHistory.length > 5 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <span>
              {expanded
                ? 'Show Less'
                : `Show ${filteredHistory.length - 5} More Transactions`
              }
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
        </div>
      )}

      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default PaymentHistorySection;
