import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  FileText, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const footerSections = [
    {
      id: 'legal',
      title: 'Legal & Compliance',
      icon: Shield,
      items: [
        'Terms of Service',
        'Privacy Policy (DPDP Act 2023)',
        'Medical Data Protection',
        'HIPAA Compliance',
        'Liability Disclaimer'
      ]
    },
    {
      id: 'support',
      title: 'Support & Resources',
      icon: FileText,
      items: [
        'Documentation',
        'API Reference',
        'Training Materials',
        'Contact Support',
        'Emergency Contacts'
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-white">Averion Labs</span>
              </div>
              
              <p className="text-gray-400 mb-6 max-w-md">
                Advanced AI-powered medical diagnostic screening tools designed for healthcare professionals.
                Enhancing diagnostic accuracy through cutting-edge machine learning technology.
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">support@averionlabs.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">+91 XXX-XXX-XXXX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">Mumbai, India</span>
                </div>
              </div>
            </div>

            {footerSections.map((section) => (
              <div key={section.id} className="md:col-span-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full text-left md:cursor-default"
                >
                  <div className="flex items-center space-x-2">
                    <section.icon className="h-4 w-4 text-blue-400" />
                    <h3 className="text-white font-semibold">{section.title}</h3>
                  </div>
                  <div className="md:hidden">
                    {expandedSections[section.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: expandedSections[section.id] || window.innerWidth >= 768 ? 'auto' : 0,
                      opacity: expandedSections[section.id] || window.innerWidth >= 768 ? 1 : 0
                    }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="mt-4 space-y-2">
                      {section.items.map((item, index) => (
                        <li key={index}>
                          <a
                            href="#"
                            className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center space-x-1"
                          >
                            <span>{item}</span>
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 py-8">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-red-300 font-semibold mb-3">Critical Medical Disclaimer</h3>
                
                <div className="space-y-4 text-sm text-red-200">
                  <p>
                    <strong>This AI system is for preliminary screening purposes ONLY</strong> and is NOT a substitute 
                    for professional medical judgment. Always consult qualified healthcare professionals for medical decisions.
                  </p>
                  
                  <div className="bg-red-800/30 border border-red-700 rounded p-3">
                    <p className="font-semibold text-red-100 mb-1">India Emergency Number: 108</p>
                    <p className="text-xs">AI screening tools cannot replace emergency medical care</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Healthcare providers must:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Independently verify all AI-generated results</li>
                      <li>Apply clinical judgment in all diagnostic decisions</li>
                      <li>Consider patient history and additional diagnostic methods</li>
                      <li>Maintain full responsibility for patient care decisions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6 mb-8">
            <h3 className="text-yellow-300 font-semibold mb-3">Liability & Data Rights</h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="text-yellow-200 font-medium mb-2">Limited Liability</h4>
                <ul className="space-y-1 text-yellow-100/80 text-xs">
                  <li>• <strong>AverionLabs provides AI screening tools only.</strong> We are NOT liable for:</li>
                  <li>• Clinical decisions made using our outputs</li>
                  <li>• Missed diagnoses or false positives/negatives</li>
                  <li>• Treatment decisions or patient outcomes</li>
                  <li>• <strong>Maximum Liability:</strong> ₹10,00,000 (Ten Lakh Rupees)</li>
                </ul>
                <p className="text-xs text-yellow-100/60 mt-2">
                  Healthcare providers retain full clinical and legal responsibility for patient care decisions.
                </p>
              </div>

              <div>
                <h4 className="text-yellow-200 font-medium mb-2">Data Protection Rights</h4>
                <p className="text-xs text-yellow-100/80 mb-2"><strong>Under India's DPDP Act 2023</strong></p>
                <ul className="space-y-1 text-yellow-100/80 text-xs">
                  <li>• Right to access your medical analysis data</li>
                  <li>• Right to correction of inaccurate data</li>
                  <li>• Right to erasure (with medical record exceptions)</li>
                  <li>• Right to data portability</li>
                  <li>• Right to withdraw consent for research use</li>
                </ul>
                <p className="text-xs text-yellow-100/60 mt-2">
                  These rights are guaranteed under India's Digital Personal Data Protection Act 2023, 
                  with additional protections under medical data handling regulations. All requests are 
                  processed within 30 days as required by law.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-yellow-800">
              <p className="text-xs text-yellow-100/60">
                <strong>Legal Contact:</strong> Email: legal@averionlabs.com | Phone: +91 XXX-XXX-XXXX
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <p className="text-sm text-gray-400">
                <strong>Effective Date:</strong> September 5, 2025 | <strong>Version:</strong> v2.1.0
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This Privacy Policy complies with the Digital Personal Data Protection Act 2023, 
                HIPAA standards, and international medical data protection requirements.
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <Link 
                to="/terms" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link 
                to="/privacy" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link 
                to="/contact" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              © 2025 <strong>AverionLabs</strong> provides AI-powered medical diagnostic screening tools designed for healthcare professionals.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
