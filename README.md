# TradeLink Website

A full-stack business partnership platform built with React, TypeScript, Supabase, and Stripe.

## 🚀 Features

- **User Authentication** - Supabase-powered auth with email verification
- **Payment Processing** - Stripe integration for subscriptions (Plus/Pro plans)
- **Business Discovery** - Find and connect with local businesses
- **Proposal Management** - Create, send, and manage partnership proposals
- **Real-time Messaging** - Chat system for business communications
- **Analytics Dashboard** - Track partnerships and business metrics
- **Responsive Design** - Modern UI with TailwindCSS and Radix UI components

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **Framer Motion** for animations

### Backend
- **Express.js** server
- **Supabase** for database and authentication
- **Stripe** for payment processing
- **Node.js** with TypeScript

### Deployment
- **Netlify** for hosting
- **GitHub** for version control
- **Environment variables** for configuration

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/            # Route components
│   ├── contexts/         # React contexts
│   ├── services/         # API service functions
│   └── lib/              # Utilities and configurations
├── server/               # Express backend
│   ├── routes/          # API route handlers
│   └── services/        # Business logic
├── shared/              # Shared types and interfaces
├── netlify/             # Netlify Functions
└── public/              # Static assets
```

## 🔧 Environment Variables

The following environment variables need to be configured:

### Supabase
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_URL` - Supabase project URL (server-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_DB_URL` - Supabase database URL

### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_PRICE_PLUS` - Plus plan price ID
- `STRIPE_PRICE_PRO` - Pro plan price ID
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### General
- `NODE_ENV` - Environment (development/production)
- `PING_MESSAGE` - API ping message

## 🚀 Deployment

### Netlify Deployment

1. **Connect to GitHub**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - Import this repository

2. **Configure Build Settings**
   - Build command: `npm run build:client`
   - Publish directory: `dist/spa`

3. **Set Environment Variables**
   - Add all environment variables in Netlify dashboard
   - Go to Site Settings → Environment Variables

4. **Deploy**
   - Netlify will automatically deploy on every push to master

### Custom Domain

1. **Add Domain in Netlify**
   - Go to Site Settings → Domain Management
   - Add your custom domain

2. **Update DNS**
   - Point your domain to Netlify's nameservers
   - Or add CNAME record pointing to your Netlify site

## 🏃‍♂️ Local Development

1. **Clone Repository**
   ```bash
   git clone https://github.com/newtonmathematic/TradeLink-Website.git
   cd TradeLink-Website
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your environment variables

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

5. **Open Browser**
   - Navigate to `http://localhost:8080`

## 📝 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm build:client` - Build client only
- `pnpm build:server` - Build server only
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm typecheck` - TypeScript type checking

## 🔐 Authentication

The app uses Supabase Auth with the following features:
- Email/password authentication
- Email verification
- Password reset
- User profile management

## 💳 Payment Plans

- **Free** - Basic features, limited partnerships
- **Plus** - Advanced features, more partnerships ($29/month)
- **Pro** - All features, unlimited partnerships ($99/month)

## 📊 Database Schema

The app uses Supabase PostgreSQL with tables for:
- `app_users` - User accounts and profiles
- `proposals` - Partnership proposals
- `messages` - Chat messages
- `businesses` - Business profiles
- `reviews` - Business reviews

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support, please contact the development team or create an issue in this repository.

---

**TradeLink** - Connecting businesses through partnerships 🚀
