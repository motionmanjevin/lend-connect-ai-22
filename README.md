# LendMe - Peer-to-Peer Lending Platform

A modern, secure peer-to-peer lending platform built with React, TypeScript, and Supabase. LendMe connects borrowers and lenders in Ghana, providing a seamless experience for loan requests, funding, and management.


### Core Functionality
- **User Authentication & Profiles** - Secure user registration and profile management
- **Loan Marketplace** - Browse and create loan requests and lending offers
- **Payment Integration** - Seamless deposits and withdrawals via Paystack
- **Loan Management** - Track active loans, repayments, and lending activities
- **Analytics Dashboard** - Comprehensive insights into lending performance
- **AI Assistant** - Intelligent chatbot for platform guidance and support

### Key Features
- **Mobile-First Design** - Responsive UI optimized for mobile devices
- **Real-time Updates** - Live balance and transaction updates
- **Secure Transactions** - End-to-end encrypted payment processing
- **User Verification** - Trust and safety features for platform security
- **Multi-payment Channels** - Support for cards, bank transfers, USSD, and mobile money

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service (Database, Auth, Edge Functions)
- **PostgreSQL** - Primary database
- **Paystack** - Payment processing and gateway
- **Edge Functions** - Serverless functions for payment processing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **SWC** - Fast TypeScript/JavaScript compiler

## 📁 Project Structure

```
lendme-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Radix UI)
│   │   ├── Features/       # Feature-specific components
│   │   └── Layout/         # Layout components
│   ├── pages/              # Application pages
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase client and types
│   ├── lib/                # Utility functions
│   └── assets/             # Static assets
├── supabase/               # Supabase configuration
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
└── public/                 # Public assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or bun
- Supabase account
- Paystack account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lendme-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   ```

4. **Database Setup**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your Supabase project
   supabase link --project-ref your_project_ref
   
   # Run migrations
   supabase db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

##  Database Schema

### Core Tables

**profiles**
- User profile information
- Account balance and payment methods
- Paystack customer integration

**transactions**
- Payment history (deposits/withdrawals)
- Transaction status tracking
- Paystack reference linking

### Security Features
- Row Level Security (RLS) enabled
- User-specific data access policies
- Automatic profile creation on user registration

##  Authentication

The application uses Supabase Auth with the following features:
- Email/password authentication
- Automatic session management
- Protected routes and components
- User profile auto-creation

##  Payment Integration

### Paystack Integration
- Multi-channel payment support (Card, Bank, USSD, Mobile Money)
- Secure transaction processing
- Webhook handling for payment confirmations
- Ghana Cedi (GHS) currency support

### Payment Flow
1. User initiates deposit/withdrawal
2. Paystack transaction initialization
3. User completes payment via Paystack
4. Webhook confirms transaction
5. Account balance updated

##  UI/UX Features

### Design System
- **Modern UI** - Clean, professional interface
- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - Theme support
- **Accessibility** - WCAG compliant components
- **Animations** - Smooth transitions and micro-interactions

### Component Library
- **Radix UI** - Accessible component primitives
- **Custom Components** - Platform-specific UI elements
- **Form Components** - Validation and error handling
- **Modal System** - Consistent dialog management

## 🔧 Configuration

### Vite Configuration
- Path aliases (`@/` for `src/`)
- React SWC plugin for fast compilation
- Development server on port 8080

### Tailwind Configuration
- Custom color scheme
- Component-specific utilities
- Animation classes
- Responsive breakpoints

##  Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel** - Recommended for React apps
- **Netlify** - Static site hosting
- **Supabase Edge Functions** - Backend functions
- **Custom Server** - Any Node.js hosting

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_production_paystack_key
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Test thoroughly before submitting PRs

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

##  Roadmap

### Planned Features
- [ ] Advanced AI lending recommendations
- [ ] Social lending features
- [ ] Mobile app (React Native)
- [ ] International payment support
- [ ] Advanced analytics and reporting
- [ ] API for third-party integrations

### Performance Improvements
- [ ] Code splitting and lazy loading
- [ ] Service worker for offline support
- [ ] Image optimization
- [ ] Caching strategies

---

