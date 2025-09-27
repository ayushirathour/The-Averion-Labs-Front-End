# Averion Labs Medical AI Saas (Frontend Module)

![Averion Labs Hero](public/images/averion-hero.jpg)

This repository contains the complete frontend for Averion Labs, a scalable SaaS platform designed to **host, serve, and monetize medical AI models**. The platform provides a web interface for users to access the initial suite of diagnostic models and leverages a Large Language Model (LLM) for advanced analysis and user support.

**Note:** This is the **frontend module only**. It communicates with my separate [FastAPI backend](https://the-averion-labs.onrender.com/docs) that handles the core platform infrastructure, including user management, payments, and AI model orchestration.

## 🌐 Live Platform & Resources

* **Live Application**: [https://averionlabs.vercel.app](https://averionlabs.vercel.app)
* **Backend API Docs**: [https://the-averion-labs.onrender.com/docs](https://the-averion-labs.onrender.com/docs)
* **Pneumonia Model Code**: [https://github.com/ayushirathour/chest-xray-pneumonia-detection-ai](https://github.com/ayushirathour/chest-xray-pneumonia-detection-ai)

## 🩺 Available Medical AI Models

The platform currently hosts the following pre-trained and validated models:

### 1. Pneumonia Detection
* **Input**: Chest X-ray images (JPEG, PNG, DICOM)
* **Output**: Classification (Pneumonia/Normal) with confidence score
* **Performance**: 96.4% sensitivity and 0.97 AUC on internal validation; 0.95 AUC on external validation
* **Cost**: 1 credit per analysis

### 2. Skin Cancer Detection
* **Input**: Skin lesion images (JPEG, PNG)
* **Output**: Multi-class skin cancer classification
* **Cost**: 2 credits per analysis

## ✨ Key Frontend Features & Backend Integrations

This frontend includes a comprehensive set of features reflecting a production-ready application.

* **Model Access Interface**:
  * Model selection (Pneumonia vs. Skin Cancer)
  * Single and batch image processing (up to 50 images)
  * Real-time upload and analysis progress tracking
  * Results display with confidence scores and classifications

* **LLM-Powered AI Assistant**:
  * Integrated AI assistant (using OpenRouter with GPT-3.5-Turbo) providing contextual insights on diagnostic results
  * Backend services for generating on-demand medical summaries and clinical suggestions based on analysis data
  * A full conversational interface for general platform and medical queries

* **User Management**:
  * JWT-based authentication with refresh token rotation and Google OAuth 2.0
  * User registration, login, and password reset functionality
  * Role-Based Access Control (RBAC) for user and admin routes

* **Credit & Billing System**:
  * Pay-per-use model with a full **Razorpay** integration for tiered credit packages
  * Real-time credit balance tracking and detailed payment history

* **Reporting & Data**:
  * Persistent storage and retrieval of analysis history
  * Dynamic generation of PDF reports for medical findings
  * Data export capabilities for GDPR and DPDP Act compliance

* **Admin Interface**:
  * Dashboard for user management and system-wide analytics
  * Tools for credit administration and monitoring model usage

* **Infrastructure & DevOps**:
  * **Containerization-Ready**: Fully configured with Docker and Docker Compose for reproducible environments
  * **Built for Observability**: Instrumented with a Prometheus `/metrics` endpoint for professional-grade monitoring

## 🛠️ Frontend Technology Stack

| Category | Technology | Purpose |
|:---------|:-----------|:--------|
| **Framework** | React 18 + TypeScript | UI with type safety |
| **Build Tool** | Vite | Fast development server and build tool |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **State Mgmt** | TanStack Query (React Query) | Server state management and API data caching |
| **Forms** | React Hook Form + Zod | Form handling and validation |
| **Routing** | React Router v6 | Client-side navigation & protected routes |
| **Deployment** | Vercel | Static hosting and CDN |

## 🚀 Development Setup

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayushirathour/The-Averion-Labs-Front-End.git
   cd The-Averion-Labs-Front-End
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   echo "VITE_API_URL=https://the-averion-labs.onrender.com" > .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3001`.

### Available Scripts
* `npm run dev`: Start the development server
* `npm run build`: Create an optimized production build
* `npm run preview`: Preview the production build locally
* `npm run lint`: Run ESLint for code analysis

## 👩‍💻 Developer
Ayushi Rathour | Biotechnology Graduate | Building Medical AI Solutions


## 📄 License

This project is licensed under the [MIT](LICENSE) - see the LICENSE for details.
