import React from 'react';
import { X, Download, FileText, Calendar, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentHistoryItem } from '@/services/payment';
import { useAuth } from '@/contexts/AuthContext';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentHistoryItem | null;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, payment }) => {
  const { user } = useAuth();

  if (!payment || !user) return null;

  const getPackageDisplayName = (packageName: string) => {
    const packageMapping: Record<string, string> = {
      'Starter Pack': 'Starter',
      'Basic Pack': 'Professional',
      'Professional Pack': 'Professional',
      'Enterprise Pack': 'Enterprise',
      'starter': 'Starter',
      'basic': 'Professional',
      'professional': 'Professional',
      'enterprise': 'Enterprise'
    };
    return packageMapping[packageName] || packageName;
  };

  const professionalName = getPackageDisplayName(payment.package);

  const userInfo = {
    name: user.name || 'N/A',
    email: user.email || 'N/A',
    username: user.username || 'N/A'
  };

  const handleDownload = () => {
    const element = document.getElementById('invoice-content');
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice #${payment.order_id.slice(-8)}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; }
                .invoice-details { margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f8f9fa; }
                .total-row { font-weight: bold; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Invoice</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div id="invoice-content" className="p-8">
              <div className="invoice-header text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Medical AI Analysis Platform
                </h1>
                <h2 className="text-lg text-blue-600 mb-4">
                  Invoice #{payment.order_id.slice(-8)}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Bill To:</h3>
                  <div className="text-gray-700">
                    <p className="font-medium">{userInfo.name}</p>
                    <p>{userInfo.email}</p>
                    <p className="text-sm">User ID: {userInfo.username}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-gray-700">
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Invoice Date:</span>
                      <p className="font-medium">
                        {new Date(payment.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    {payment.completed_at && (
                      <div>
                        <span className="text-sm text-gray-500">Payment Date:</span>
                        <p className="font-medium">
                          {new Date(payment.completed_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3">Description</th>
                    <th className="text-right py-3">Quantity</th>
                    <th className="text-right py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-4">
                      <div>
                        <p className="font-medium">
                          {professionalName} Package Medical AI Analysis Credits
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{(payment.amount / payment.credits).toFixed(1)} per credit
                        </p>
                      </div>
                    </td>
                    <td className="text-right py-4">{payment.credits}</td>
                    <td className="text-right py-4">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-300">
                    <td colSpan={2} className="py-4 font-semibold text-right">
                      Total Amount:
                    </td>
                    <td className="text-right py-4 font-bold text-lg">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Method:</h3>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Razorpay</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Currency:</h3>
                  <p className="text-gray-700">Indian Rupee (₹)</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Order ID:</span>
                    <p className="font-mono text-gray-900">{payment.order_id}</p>
                  </div>
                  {payment.payment_id && (
                    <div>
                      <span className="text-gray-500">Payment ID:</span>
                      <p className="font-mono text-gray-900">{payment.payment_id}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Credits are non-refundable once used for analysis</li>
                  <li>• Credits remain valid for 1 year from purchase date</li>
                  <li>• All analyses are for informational purposes only</li>
                  <li>• Medical decisions should be made by qualified professionals</li>
                </ul>
              </div>

              <div className="footer text-center mt-8 pt-6 border-t border-gray-200">
                <p className="text-blue-600 font-medium mb-2">
                  Thank you for choosing Averion Labs
                </p>
                <p className="text-xs text-gray-500">
                  Generated on {new Date().toLocaleDateString('en-IN')} at{' '}
                  {new Date().toLocaleTimeString('en-IN')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InvoiceModal;
