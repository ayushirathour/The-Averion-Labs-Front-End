# Averion Labs PneumoDetect Frontend

A professional medical AI platform for pneumonia detection from chest X-rays, built with React TypeScript and modern web technologies.

## 🚀 Features

- **AI-Powered Diagnosis**: Advanced machine learning algorithms for accurate pneumonia detection
- **HIPAA Compliant**: Enterprise-grade security protecting medical data
- **Instant Results**: Get diagnosis results in seconds, not hours
- **Professional UI**: Clean, medical-themed interface designed for healthcare professionals
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Upload**: Drag & drop file upload with progress tracking
- **Credit System**: Flexible payment model with Razorpay integration
- **User Management**: Complete user dashboard with statistics and history

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Layout components (Header, Footer, etc.)
├── pages/                  # Main application pages
├── services/               # API service layer
├── hooks/                  # Custom React hooks
├── contexts/               # React contexts
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions and constants
└── App.tsx                 # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd averion-labs-pneumodetect
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update environment variables in `.env`:
```env
VITE_API_URL=https://the-averion-labs.onrender.com
VITE_APP_NAME=Averion Labs PneumoDetect
VITE_RAZORPAY_KEY=your_razorpay_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📱 Pages & Features

### 🔐 Authentication
- **Login Page**: Clean medical-themed login form with validation
- **JWT Integration**: Automatic token refresh and secure storage
- **Protected Routes**: Route protection with authentication checks

### 📊 Dashboard
- **Welcome Header**: Personalized greeting with user information
- **Credit Balance**: Prominent display of available credits
- **Recent Predictions**: Grid showing recent analysis results
- **Statistics Cards**: Total predictions, success rate, and monthly data
- **Quick Actions**: Easy access to upload, payment, and settings

### 📤 Upload
- **Drag & Drop**: Intuitive file upload interface
- **File Validation**: Support for JPEG, PNG, and DICOM files
- **Progress Tracking**: Real-time upload progress with visual indicators
- **Batch Upload**: Support for multiple file uploads
- **Error Handling**: Comprehensive validation and error messages

### 📋 Results
- **Clear Diagnosis**: Large, prominent display of results (PNEUMONIA/NORMAL)
- **Confidence Score**: Visual confidence indicator with progress bar
- **AI Recommendations**: Professional medical recommendations
- **Image Preview**: Display of uploaded X-ray image
- **Report Download**: Download detailed analysis reports
- **Share Functionality**: Share results with healthcare professionals

### 💳 Payment
- **Credit Packages**: Flexible pricing tiers (Starter, Basic, Professional, Enterprise)
- **Razorpay Integration**: Secure payment processing for Indian users
- **Payment History**: Track all payment transactions
- **Current Balance**: Real-time credit balance display

### ⚙️ Settings
- **Profile Management**: Update user information and preferences
- **Notification Settings**: Configure email, push, and SMS notifications
- **Privacy Controls**: Data retention and analytics sharing preferences
- **Security**: Password change and account deletion options

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563EB) - Professional medical theme
- **Secondary**: Light Gray (#F8FAFC) - Clean, minimal background
- **Success**: Green (#10B981) - Normal diagnosis results
- **Warning**: Yellow (#F59E0B) - Medium confidence results
- **Error**: Red (#EF4444) - Pneumonia detection and high priority alerts

### Typography
- **Font**: Inter - Clean, readable font optimized for medical interfaces
- **Hierarchy**: Clear heading structure with proper contrast ratios

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Cards**: Consistent spacing and shadow system
- **Forms**: Comprehensive validation with error states
- **Modals**: Accessible modal system with keyboard navigation
- **Alerts**: Contextual notifications for different message types

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route-level security with automatic redirects
- **Input Validation**: Comprehensive form validation with Zod schemas
- **Error Boundaries**: Graceful error handling throughout the application
- **HTTPS Only**: All API communications over secure connections
- **Data Privacy**: Clear data retention policies and user controls

## ♿ Accessibility

- **WCAG 2.1 AA Compliance**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **High Contrast Mode**: Support for high contrast displays
- **Focus Management**: Clear focus indicators and logical tab order
- **Touch Targets**: Minimum 44px touch targets for mobile devices

## 📱 Responsive Design

- **Mobile-First**: Designed for mobile devices first
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Touch-Friendly**: Optimized for touch interactions
- **Flexible Layouts**: Adaptive layouts that work on all screen sizes

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run build
```

## 🚀 Deployment

The application is built as a static site and can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Connect your repository for automatic deployments
- **AWS S3**: Upload the `dist` folder to an S3 bucket
- **GitHub Pages**: Use GitHub Actions for automated deployments

## 📄 API Integration

The frontend integrates with the Averion Labs FastAPI backend:

- **Base URL**: `https://the-averion-labs.onrender.com`
- **Authentication**: JWT Bearer tokens
- **File Upload**: FormData for image uploads
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Key Endpoints:
- `POST /auth/login` - User authentication
- `POST /api/v1/predict` - Single file prediction
- `POST /api/v1/predict/batch` - Batch file prediction
- `GET /users/dashboard` - Dashboard data
- `POST /payments/create-order` - Payment processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@averionlabs.com
- Documentation: [Link to documentation]
- Issues: [GitHub Issues]

## 🔮 Future Enhancements

- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode capabilities
- [ ] Advanced image preprocessing tools
- [ ] Integration with PACS systems
- [ ] Mobile app development
- [ ] Advanced reporting features

---

Built with ❤️ for healthcare professionals by the Averion Labs team.
