# RojgarSkill - E-Learning Platform

A comprehensive E-Learning platform built with Next.js 15, featuring live classes, course management, payment integration, and white-labeling capabilities.

## 🚀 Features

### ✅ Implemented
- **Modern Tech Stack**: Next.js 15 with TypeScript, Tailwind CSS, and shadcn/ui
- **Authentication System**: NextAuth.js with Google OAuth and Email providers
- **Database**: Supabase with Drizzle ORM for type-safe database operations
- **Responsive Design**: Mobile-first design with beautiful UI components
- **Dashboard**: Student dashboard with progress tracking and course management
- **Landing Page**: Modern, conversion-optimized landing page

### 🚧 In Development
- **Live Classes**: Zoom and Google Meet API integration
- **Course Management**: Complete CRUD operations for courses and modules
- **Payment Integration**: Razorpay and Cashfree payment gateways
- **Certificate System**: Automated certificate generation and verification
- **White-labeling**: Custom domain and branding options
- **Analytics**: Comprehensive learning analytics and reporting

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js with Supabase adapter
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Google OAuth credentials (optional)
- SMTP server for email authentication

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/vishalpatwa-in/nextjs-rojgarsill.git
cd nextjs-rojgarsill
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Copy the environment variables file and configure:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Database Configuration
DATABASE_URL=your_database_url_here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Email Configuration
SMTP_HOST=your_smtp_host_here
SMTP_PORT=587
SMTP_USER=your_smtp_user_here
SMTP_PASSWORD=your_smtp_password_here
```

### 4. Database Setup

Run database migrations:

```bash
npx drizzle-kit push:pg
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
rojgarskill/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   └── ui/               # shadcn/ui components
│   └── lib/                   # Utilities and configurations
│       ├── auth.ts           # NextAuth configuration
│       ├── supabase.ts       # Supabase client
│       ├── db/               # Database schema and connection
│       └── utils.ts          # Utility functions
├── public/                    # Static assets
├── drizzle/                   # Database migrations
├── .env.local                 # Environment variables
├── drizzle.config.ts         # Drizzle configuration
├── tailwind.config.ts        # Tailwind configuration
└── package.json              # Dependencies and scripts
```

## 🗄️ Database Schema

The platform includes comprehensive database schema for:

- **Users & Profiles**: User management with role-based access
- **Courses & Modules**: Hierarchical course structure
- **Lessons**: Video, text, quiz, and assignment content
- **Live Classes**: Scheduled and recorded sessions
- **Enrollments**: Student course registrations
- **Progress Tracking**: Detailed learning analytics
- **Payments**: Transaction and billing management
- **Certificates**: Automated certificate generation
- **Notifications**: Real-time user notifications
- **White-label Settings**: Customization options

## 🔐 Authentication

The platform supports multiple authentication methods:

- **Email Magic Links**: Passwordless authentication
- **Google OAuth**: Social login integration
- **Role-based Access**: Student, Instructor, and Admin roles
- **Session Management**: Secure JWT-based sessions

## 🎨 UI Components

Built with shadcn/ui components:

- **Forms**: Input, Label, Button, Select, Textarea
- **Layout**: Card, Sheet, Dialog, Tabs
- **Feedback**: Alert, Badge, Progress
- **Navigation**: Navigation Menu, Dropdown Menu
- **Data Display**: Avatar, Table (coming soon)

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Accessibility**: WCAG compliant components

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Database Operations

```bash
npx drizzle-kit generate:pg    # Generate migrations
npx drizzle-kit push:pg        # Push schema to database
npx drizzle-kit studio         # Open Drizzle Studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@rojgarskill.com or join our Discord community.

## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] Project setup and infrastructure
- [x] Authentication system
- [x] Basic dashboard
- [x] Database schema

### Phase 2: Course Management 🚧
- [ ] Course creation and editing
- [ ] Module and lesson management
- [ ] Content upload system
- [ ] Progress tracking

### Phase 3: Live Classes 🚧
- [ ] Zoom API integration
- [ ] Google Meet integration
- [ ] Class scheduling
- [ ] Recording management

### Phase 4: Payments & Certificates 🚧
- [ ] Razorpay integration
- [ ] Cashfree integration
- [ ] Certificate generation
- [ ] Invoice system

### Phase 5: Advanced Features 🚧
- [ ] White-labeling
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] API documentation

## 📊 Performance

- **Lighthouse Score**: 95+ (target)
- **Core Web Vitals**: Optimized
- **SEO**: Fully optimized
- **Accessibility**: WCAG 2.1 AA compliant

## 🔒 Security

- **Authentication**: Secure JWT sessions
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted sensitive data
- **HTTPS**: SSL/TLS encryption
- **CSRF Protection**: Built-in protection

---

Built with ❤️ by the RojgarSkill Team
