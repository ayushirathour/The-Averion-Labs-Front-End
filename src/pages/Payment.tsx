import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Star,
  ArrowRight,
  Lock,
  Award,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/payment';
import { useRazorpay } from '@/hooks/useRazorpay';
import toast from 'react-hot-toast';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  description: string;
  features: string[];
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 10,
    price: 199,
    description: 'Perfect for trying out our AI analysis',
    features: ['10 AI analyses', 'Basic support', 'PDF reports', '30-day validity']
  },
  {
    id: 'professional',
    name: 'Professional',
    credits: 50,
    price: 799,
    originalPrice: 995,
    discount: 20,
    popular: true,
    description: 'Best value for regular users',
    features: ['50 AI analyses', 'Priority support', 'Advanced reports', '90-day validity', 'Batch processing']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 200,
    price: 2999,
    originalPrice: 3980,
    discount: 25,
    description: 'For healthcare professionals',
    features: ['200 AI analyses', 'Premium support', 'Custom reports', '1-year validity', 'API access', 'Team management']
  }
];

const Payment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState<string>('professional');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const { initializePayment } = useRazorpay();

  useEffect(() => {
    const packageFromUrl = searchParams.get('package');
    if (packageFromUrl && creditPackages.find(pkg => pkg.id === packageFromUrl)) {
      setSelectedPackage(packageFromUrl);
    }
  }, [searchParams]);

  const handlePayment = async (packageId: string) => {
    if (!user) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    const pkg = creditPackages.find(p => p.id === packageId);
    if (!pkg) return;

    setProcessingPayment(true);

    try {
      const orderResponse = await paymentService.createOrder({
        package_id: packageId,
        amount: pkg.price,
        credits: pkg.credits
      });

      if (!orderResponse.order_id) {
        throw new Error('Failed to create order');
      }

      await initializePayment({
        orderId: orderResponse.order_id,
        amount: pkg.price,
        packageName: pkg.name,
        credits: pkg.credits,
        onSuccess: (paymentData) => {
          toast.success('Payment successful! Credits have been added to your account.');
          navigate('/dashboard');
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          toast.error('Payment failed. Please try again.');
        }
      });
    } catch (error: any) {
      console.error('Payment initialization failed:', error);
      toast.error(error.message || 'Payment initialization failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const selectedPkg = creditPackages.find(pkg => pkg.id === selectedPackage);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up encrypted connection...</p>
          <p className="text-gray-500 text-sm">Retrieving available options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Credit Package</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Purchase credits to analyze your medical images with our AI system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {creditPackages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${
              selectedPackage === pkg.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${pkg.popular ? 'ring-2 ring-blue-200' : ''}`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>Most Popular</span>
                </span>
              </div>
            )}

            {pkg.discount && (
              <div className="absolute -top-2 -right-2">
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {pkg.discount}% OFF
                </span>
              </div>
            )}

            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">₹{pkg.price}</span>
                {pkg.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">₹{pkg.originalPrice}</span>
                )}
              </div>
              <div className="flex items-center justify-center space-x-1 text-blue-600 mb-3">
                <Zap className="h-4 w-4" />
                <span className="font-semibold">{pkg.credits} Credits</span>
              </div>
              <p className="text-gray-600 text-sm">{pkg.description}</p>
            </div>

            <div className="space-y-2 mb-6">
              {pkg.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-2">
                ₹{(pkg.price / pkg.credits).toFixed(1)} per analysis
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPkg && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment Summary</h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">₹{selectedPkg.price}</div>
              <div className="text-sm text-gray-600">{selectedPkg.credits} credits</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Security Features</h3>
              <div className="space-y-2">
                {[
                  { icon: Lock, text: 'Bank-level encryption' },
                  { icon: Shield, text: '256-bit SSL security' },
                  { icon: Award, text: 'Secure payment gateway' },
                  { icon: CheckCircle, text: 'Powered by Razorpay' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Compliance</h3>
              <div className="space-y-2">
                {[
                  { icon: Shield, text: 'Medical data compliance' },
                  { icon: Award, text: 'HIPAA certified' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => handlePayment(selectedPackage)}
            disabled={processingPayment}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {processingPayment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Proceed to Payment</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
          <button
            onClick={() => setShowFAQ(!showFAQ)}
            className="text-blue-600 hover:text-blue-700"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>

        {showFAQ && (
          <div className="space-y-4">
            {[
              {
                question: "Do credits expire?",
                answer: "No. Credits remain in your account indefinitely."
              },
              {
                question: "What payment methods are accepted?",
                answer: "Credit cards, UPI, net banking, and 50+ options."
              },
              {
                question: "Can I get a refund?",
                answer: "Unused credits can be refunded within 30 days."
              },
              {
                question: "Is this a test environment?",
                answer: "Yes. Currently using Razorpay test environment."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-3">
                <h4 className="font-medium text-gray-900 mb-1">{faq.question}</h4>
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
              <p className="text-sm text-yellow-700 mt-1">
                All payments are processed securely. Medical image analysis is provided for informational purposes only. Always consult healthcare professionals for medical decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
