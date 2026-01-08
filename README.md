# HVAC Flow - Alberta HVAC Management Platform

A Next.js-based HVAC management platform designed specifically for Alberta contractors with AI-powered agent orchestration.

## Key Features

- **Agentic Onboarding**: AI-assisted tenant approval with risk assessment
- **GPS Fleet Tracking**: Real-time truck location with live map updates
- **Smart Scheduling**: Job management and technician assignment
- **Intelligent Invoicing**: Deterministic + LLM-fallback invoice parsing
- **Refrigerant Compliance**: EPA-compliant tracking and reporting
- **Multi-Provider AI**: Deterministic-first with Grok/HF/OpenAI escalation

## Agent Principles

This platform implements a **deterministic-first, human-in-the-loop** AI architecture:

1. **Deterministic Priority**: Rules-based logic runs first for speed and reliability
2. **LLM Escalation**: Only escalates to AI models when deterministic confidence < threshold
3. **Budget Management**: Monthly spend limits prevent runaway costs
4. **Confidence Scoring**: All agent outputs include confidence metrics (0.0-1.0)
5. **Human Approval**: High-stakes decisions (tenant approval, billing) require admin action
6. **Audit Trail**: Every agent action logged with redacted outputs
7. **PII Redaction**: Automatic redaction of sensitive data before external API calls

### Provider Chain

1. **Deterministic** (always first) - Regex patterns, heuristics, rule engines
2. **Grok** (xAI) - When available and configured
3. **Hugging Face** - Open source models (cost-effective)
4. **OpenAI** (GPT-4o-mini) - Last resort for complex tasks

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Supabase Account** - [supabase.com](https://supabase.com)
4. **Stripe Account** (optional, for billing) - [stripe.com](https://stripe.com)

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
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your actual credentials:

   **Supabase Setup (Required):**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings > API
   - Copy the URL and anon key
   - Copy the service_role key (for admin operations)
   - Paste them into `.env.local`

   **Stripe Setup (Optional, for billing):**
   - Go to [stripe.com/dashboard](https://stripe.com/dashboard)
   - Get your publishable key and secret key from Developers > API keys
   - Create products and prices for monthly/annual/founding plans
   - Copy the price IDs to STRIPE_*_PRICE_ID
   - Set up a webhook endpoint pointing to `/api/webhooks/stripe`
   - Copy the webhook secret
   - Paste all keys into `.env.local`

   **AI Providers (Optional):**
   - **Grok**: Get API key from xAI (when available)
   - **Hugging Face**: Get free API key from [huggingface.co](https://huggingface.co)
   - **OpenAI**: Get API key from [platform.openai.com](https://platform.openai.com)
   
   > Note: The platform works with deterministic logic only. AI providers are optional for advanced features.

### 4. Run Database Migrations

The platform requires Supabase database tables. Run the migrations in order:

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and run `db/migrations/001_tenants_and_agents.sql`
4. Then copy and run `db/migrations/002_trucks_jobs_invoicing.sql`
5. Verify tables were created in the Table Editor

**Migration Contents:**
- **001**: Creates tenants, platform_settings, agent_actions, founding_members, billing_events
- **002**: Creates trucks, telemetry_recent, jobs, tech_notes, parts, invoices, refrigerant_ledger

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 6. Build for Production

When ready to deploy:

```bash
npm run build
npm start
```

## API Endpoints

### Onboarding
- `POST /api/onboarding/request` - Submit tenant onboarding request
- `GET /api/admin/tenants/list` - List pending tenant requests (admin)
- `POST /api/admin/tenants/approve` - Approve tenant and create billing (admin)

### GPS & Tracking
- `POST /api/gps/ingest` - Ingest device location (requires device token)
- `GET /api/gps/trucks` - List trucks with last known locations
- `GET /api/gps/truck/[id]/telemetry` - Get recent telemetry for a truck

### Jobs & Scheduling
- `POST /api/jobs` - Create new job
- `GET /api/jobs` - List jobs (filterable by tenant, status, tech)
- `PATCH /api/jobs/[id]/assign` - Assign job to technician
- `POST /api/jobs/[id]/notes` - Add tech note (auto-parses for invoice)
- `GET /api/jobs/[id]/notes` - Get all notes for a job

### Invoicing
- `POST /api/invoices/generate-from-job/[job_id]` - Generate invoice from tech notes

### Billing
- `POST /api/checkout` - Create Stripe checkout session (supports monthly/annual/founding)
- `POST /api/webhooks/stripe` - Stripe webhook handler (verify signature)

## Agent Configuration

Configure agent behavior via environment variables or platform_settings table:

- `AUTO_EXEC_THRESHOLD` (default: 0.95) - Confidence needed for automatic execution
- `SUGGEST_THRESHOLD` (default: 0.75) - Confidence needed to show suggestion
- `MONTHLY_MODEL_BUDGET_USD` (default: 100.00) - Monthly spend limit for LLM calls
- `REDACT_PII` (default: true) - Whether to redact PII in agent outputs
- `PROVIDER_ORDER` - Array of providers to try in order: `["deterministic", "grok", "hf", "openai"]`

### How Agent Escalation Works

1. **Request comes in** (e.g., tenant onboarding, invoice parsing)
2. **Deterministic runs first** - Fast, rule-based logic
3. **Check confidence** - If >= SUGGEST_THRESHOLD, return result
4. **Budget check** - Verify monthly spend hasn't hit limit
5. **Try providers in order** - Grok → HuggingFace → OpenAI
6. **First success wins** - Return result with confidence score
7. **Log action** - Write to agent_actions audit table with redacted output

### Testing Agent Behavior

Test with different inputs to see deterministic vs LLM behavior:

**Deterministic succeeds** (high confidence):
```bash
curl -X POST http://localhost:3000/api/onboarding/request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@hvacpros.com",
    "companyName": "HVAC Pros Ltd",
    "phone": "780-555-1234",
    "city": "Edmonton"
  }'
```

**LLM fallback** (ambiguous data):
```bash
curl -X POST http://localhost:3000/api/onboarding/request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@gmail.com",
    "companyName": "Test Co"
  }'
```

## External Services (Optional)

### OSRM (Routing)
For route optimization, set `OSRM_URL`:
```bash
# Public OSRM instance (free)
OSRM_URL=http://router.project-osrm.org

# Or run your own:
docker run -d -p 5000:5000 osrm/osrm-backend osrm-routed --algorithm mld /data/alberta-latest.osrm
OSRM_URL=http://localhost:5000
```

### Overpass API (POI Data)
For construction site ingestion:
```bash
OVERPASS_URL=https://overpass-api.de/api/interpreter
```

## Project Structure

```
hvac-saas/
├── ai/prompts/             # System prompts for AI agents
│   ├── onboarding_orchestrator.system.txt
│   ├── approval_suggestion.system.txt
│   ├── invoice_parser.system.txt
│   └── ...
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   │   ├── page.tsx       # Pending requests & live map
│   │   └── scheduling/    # Scheduling interface
│   ├── api/               # API routes
│   │   ├── admin/         # Admin endpoints
│   │   ├── checkout/      # Stripe checkout
│   │   ├── gps/           # GPS tracking endpoints
│   │   ├── invoices/      # Invoice generation
│   │   ├── jobs/          # Job management
│   │   ├── onboarding/    # Tenant onboarding
│   │   └── webhooks/      # Webhook handlers
│   ├── demo/              # Demo dashboard pages
│   ├── success/           # Payment success page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── HVACMap.tsx       # Real-time GPS map component
│   └── MapComponent.tsx   # Map wrapper
├── db/migrations/         # Database migrations
│   ├── 001_tenants_and_agents.sql
│   └── 002_trucks_jobs_invoicing.sql
├── lib/                   # Core libraries
│   ├── agents/           # Agent orchestration
│   │   ├── runner.ts     # Agent runner with provider chain
│   │   └── providerAdapters.ts  # LLM provider adapters
│   ├── invoicing/        # Invoice parsing
│   │   └── parser.ts     # Deterministic + LLM fallback
│   ├── supabase.ts       # Supabase client
│   └── demoData.ts       # Demo data for development
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
