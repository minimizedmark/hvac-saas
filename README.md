# HVAC Flow - Alberta HVAC Management Platform

A Next.js-based HVAC management platform designed specifically for Alberta contractors.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
2. **npm** (comes with Node.js)

## Setup Instructions

### 1. Install Node.js

If you haven't installed Node.js yet:
1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS (Long Term Support) version
3. Run the installer and follow the prompts
4. Verify installation by opening a new terminal and running:
   ```bash
   node --version
   npm --version
   ```

### 2. Install Dependencies

Once Node.js is installed, open a terminal in this directory and run:

```bash
npm install
```

This will install all required packages including:
- Next.js
- React & React DOM
- React Leaflet (for maps)
- Stripe (for payments)
- Supabase (for database)
- TypeScript & type definitions

### 3. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.local.example .env.local
   ```

2. Edit `.env.local` with your actual credentials:

   **Supabase Setup:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy the URL and anon key from Settings > API
   - Paste them into `.env.local`

   **Stripe Setup:**
   - Go to [stripe.com/dashboard](https://stripe.com/dashboard)
   - Get your publishable key and secret key from Developers > API keys
   - For webhooks, set up a webhook endpoint pointing to `/api/webhooks/stripe`
   - Paste all keys into `.env.local`

   **Resend Setup (for emails):**
   - Go to [resend.com](https://resend.com)
   - Create an API key
   - Paste it into `.env.local`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 5. Build for Production

When ready to deploy:

```bash
npm run build
npm start
```

## Project Structure

```
hvac-saas/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── checkout/      # Stripe checkout endpoint
│   │   └── webhooks/      # Webhook handlers
│   ├── demo/              # Demo dashboard pages
│   ├── success/           # Payment success page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── HVACMap.tsx       # Real-time GPS map component
├── public/                # Static assets (create this folder for truck.png)
├── .env.local            # Environment variables (create from .env.local.example)
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Features

### ✅ Live Today
- Real-time GPS tracking on Edmonton streets
- Magic-link login
- Smart AI scheduling & route optimization
- Automatic invoice generation
- Refrigerant tracking + EPA reports
- Customer management

### 🚀 Launching April 2026
- AI diagnostics from equipment photos
- Mobile apps (iOS & Android)
- Advanced reporting & analytics
- QuickBooks integration

## Troubleshooting

### Port Already in Use
If port 3000 is busy, you can specify a different port:
```bash
npm run dev -- -p 3001
```

### Map Not Showing
Make sure you have a `truck.png` icon in the `public/` folder. You can use any 40x40px truck icon image.

### Environment Variables Not Loading
- Make sure the file is named `.env.local` (not `.env.local.txt`)
- Restart the dev server after changing environment variables
- Check that there are no spaces around the `=` sign in your `.env.local` file

## Support

Built by Mark - Former Alberta HVAC tech

## License

See LICENSE file for details.
