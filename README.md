# HVAC Flow

A modern SaaS platform for HVAC service providers, featuring AI-powered automation, job management, and customer relationship tools.

**Live URL**: [https://hvacflow.app](https://hvacflow.app)

## Features

- 🔐 **Secure Authentication** - Magic link authentication powered by Supabase
- 📊 **Dashboard** - Clean, modern interface for managing your HVAC business
- 🤖 **AI-Powered** - Leverage LLM features for job automation and quoting
- 🔒 **Protected APIs** - Middleware-based authentication for all API routes
- 🎨 **Modern UI** - Built with Next.js 14, React 18, and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or 20+ (LTS recommended)
- npm 8+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/minimizedmark/hvac-saas.git
cd hvac-saas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

The `.env.example` file already contains the correct Supabase credentials for the project.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
hvac-saas/
├── app/                    # Next.js app directory
│   ├── api/               # API routes with header-based auth
│   ├── login/             # Login page with magic link
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Dashboard (protected)
│   └── globals.css       # Global styles
├── src/
│   └── lib/
│       └── supabase.ts   # Supabase client utilities
├── middleware.ts          # Auth middleware (injects x-user-id header)
├── public/               # Static assets
└── ...config files
```

## Authentication Flow

### Magic Link Sign-In

1. User enters email on `/login`
2. Supabase sends magic link to email
3. User clicks link and is authenticated
4. User is redirected to dashboard

### Protected Routes

- **Dashboard** (`/`): Requires authentication, redirects to `/login` if not authenticated
- **API Routes** (`/api/*`): Middleware injects `x-user-id` and `x-user-email` headers from session

### API Authentication

All API routes under `/api/*` automatically receive authentication headers from `middleware.ts`:

```typescript
const userId = request.headers.get('x-user-id')
const userEmail = request.headers.get('x-user-email')

if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Supabase Configuration

### Environment Variables

The project uses Supabase for authentication and data storage. The following environment variables are configured:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ufoylgkcanicbspgpers.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Setting Up Auth Redirects

To ensure magic links work correctly in production:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to Authentication → URL Configuration
3. Add the following redirect URLs:
   - Development: `http://localhost:3000`
   - Production: `https://hvacflow.app`

### Vercel Domain Configuration

For production deployment on Vercel:

1. Deploy your project to Vercel
2. Add your custom domain `hvacflow.app` in Vercel project settings
3. Update Supabase Auth redirect URLs to include your production domain
4. Ensure environment variables are set in Vercel

## Deployment

The application is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Vercel will automatically detect Next.js and configure build settings
4. Add environment variables in Vercel dashboard (they're in `.env.example`)
5. Deploy!

The live application is available at: **https://hvacflow.app**

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, email anon4me785@gmail.com or open an issue in the repository.
