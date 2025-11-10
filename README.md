# HVAC Flow - SaaS Platform for HVAC Service Providers

A modern full-stack web application built with Next.js, Supabase, and Twilio for managing HVAC service operations, jobs, quotes, and customer communications.

🌐 **Live Demo**: [hvacflow.app](https://hvacflow.app)

## Features

- 🔐 **Authentication**: Secure user authentication powered by Supabase
- 📊 **Dashboard**: Intuitive dashboard for managing jobs and quotes
- 💬 **SMS Notifications**: Automated SMS notifications via Twilio integration
- 🤖 **AI-Powered Quoting**: LLM-driven quote generation
- 📱 **Responsive Design**: Mobile-friendly UI with TailwindCSS
- ⚡ **API Routes**: RESTful API endpoints for all operations

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Database & Auth**: Supabase (PostgreSQL)
- **SMS**: Twilio API
- **Deployment**: Vercel
- **Language**: TypeScript

## Prerequisites

- Node.js 18 or 20 (LTS)
- npm 8+
- Supabase account
- Twilio account (for SMS features)

## Quick Start with Deploy Script

Use the one-command deploy script to set up the entire project:

```bash
chmod +x deploy-hvac.sh
./deploy-hvac.sh
```

This script will:
- Install all dependencies
- Set up environment configuration
- Build the application
- Validate the setup

## Manual Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Configuration
XAI_API_KEY=your-xai-api-key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Twilio Setup

### Getting Twilio Credentials

1. **Sign up** for a [Twilio account](https://www.twilio.com/try-twilio)
2. **Get your credentials** from the Twilio Console:
   - Account SID
   - Auth Token
3. **Get a phone number**:
   - Navigate to Phone Numbers → Manage → Buy a number
   - Choose a number with SMS capabilities
4. **Add credentials to `.env`**:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Using Twilio for SMS

The application includes a `/api/send-sms` endpoint for sending SMS messages:

**Request:**
```bash
curl -X POST http://localhost:3000/api/send-sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{
    "to": "+1234567890",
    "message": "Your HVAC service is scheduled for tomorrow at 2 PM"
  }'
```

**Response:**
```json
{
  "success": true,
  "messageSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "queued"
}
```

**Phone Number Format:**
- Use E.164 format: `+[country code][number]`
- Example: `+12125551234` for US numbers

### Twilio Integration in Code

The Twilio utility is available at `src/lib/twilio.ts`:

```typescript
import { sendSms } from '@/lib/twilio'

// Send an SMS
const result = await sendSms({
  to: '+1234567890',
  message: 'Your quote is ready!'
})
```

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings → API

### 2. Database Schema

Create the following tables in your Supabase project:

```sql
-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  service_type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id),
  amount DECIMAL(10, 2),
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. Configure Authentication

1. In Supabase Dashboard → Authentication → URL Configuration
2. Add your site URL: `https://hvacflow.app`
3. Add redirect URLs for authentication callbacks

## Deployment to Vercel

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### 2. Configure Environment Variables in Vercel

In your Vercel project settings:

1. Go to Settings → Environment Variables
2. Add all variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `XAI_API_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

### 3. Configure Domain

1. Go to Settings → Domains
2. Add your custom domain: `hvacflow.app`
3. Update DNS records as instructed

### 4. Update Supabase Redirect URLs

In Supabase → Authentication → URL Configuration:
- Add production URL: `https://hvacflow.app`

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint

# Utilities
npm run clean       # Remove build artifacts and node_modules
```

## Project Structure

```
hvac-saas/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── health/        # Health check endpoint
│   │   └── send-sms/      # SMS sending endpoint
│   ├── dashboard/         # Dashboard pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── src/
│   └── lib/               # Shared utilities
│       ├── supabase.ts    # Supabase client
│       └── twilio.ts      # Twilio SMS utility
├── public/                # Static assets
├── middleware.ts          # Auth middleware
├── .env.example          # Environment variables template
├── deploy-hvac.sh        # One-command deploy script
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## API Documentation

### Health Check

**GET** `/api/health`

Returns the health status of the application.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T19:00:00.000Z",
  "service": "hvac-saas"
}
```

### Send SMS

**POST** `/api/send-sms`

Sends an SMS message via Twilio.

**Headers:**
- `Authorization: Bearer <supabase_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Your message here"
}
```

**Response:**
```json
{
  "success": true,
  "messageSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "queued"
}
```

## Security Best Practices

- ✅ All secrets stored in environment variables
- ✅ No hardcoded credentials in code
- ✅ Row Level Security enabled on Supabase tables
- ✅ API routes protected with authentication middleware
- ✅ Input validation on all API endpoints
- ✅ Phone number format validation for SMS

## Use Cases

### Sending Job Notifications

```typescript
// When a job is scheduled
await sendSms({
  to: customer.phone,
  message: `Your ${jobType} service is scheduled for ${date} at ${time}`
})
```

### Quote Approval

```typescript
// When a quote is ready
await sendSms({
  to: customer.phone,
  message: `Your HVAC quote is ready! Amount: $${amount}. Reply YES to approve.`
})
```

### Service Reminders

```typescript
// Automated reminders
await sendSms({
  to: customer.phone,
  message: 'Reminder: Your HVAC maintenance is scheduled for tomorrow at 2 PM'
})
```

## Troubleshooting

### Build Errors

```bash
# Clean and reinstall
npm run clean
npm install
npm run build
```

### Environment Variable Issues

- Ensure all required variables are set in `.env`
- For Vercel: Check Settings → Environment Variables
- Restart dev server after changing `.env`

### Twilio Errors

- **Invalid phone number**: Use E.164 format (+12125551234)
- **Authentication failed**: Verify Account SID and Auth Token
- **Insufficient funds**: Check Twilio account balance

### Supabase Connection Issues

- Verify URL and anon key are correct
- Check Supabase project is active
- Ensure RLS policies are configured

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [github.com/minimizedmark/hvac-saas/issues](https://github.com/minimizedmark/hvac-saas/issues)
- Documentation: This README

## Roadmap

- [ ] Customer portal
- [ ] Automated scheduling
- [ ] Email notifications
- [ ] Invoice generation
- [ ] Mobile app
- [ ] Analytics dashboard

---

Built with ❤️ using Next.js, Supabase, and Twilio
