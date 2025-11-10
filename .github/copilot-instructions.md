# Copilot Coding Agent Instructions for hvac-saas

## Repository Overview

- **Project Purpose**: `hvac-saas` is a SaaS web application for HVAC service providers. It uses Next.js for the frontend and API routes, integrates with Supabase for authentication and data, and leverages LLM-driven AI features for job automation and quoting. Primary deployment target is [hvacflow.app](https://hvacflow.app).
- **Type**: Modern full stack JavaScript/TypeScript web application.
- **Languages/Frameworks**:  
  - TypeScript (main)
  - Next.js (React 18+ / App Router)
  - Supabase (PostgreSQL/Cloud Auth)
  - TailwindCSS (UI)
  - Node.js + npm
- **Repository Size**: Small to medium (dozens of files, under 1k commits as of onboarding).
- **Structure**: Modern `/app` directory (not `/pages`) for routing.
- **Deployment**: Vercel (primary); Supabase managed for backend/auth.

---

## Build, Setup & Validation Instructions

### One-Time Prerequisites
- **Node.js version**: LTS 18 or 20 is recommended. Run `node -v` and ensure compatibility.
- **npm version**: Use npm v8+ (`npm -v`).
- **Supabase Backend**: No local Supabase needed; uses public cloud instance and anon credentials.
- **Env file**: Before any build or local run, copy `.env.example` as `.env` and complete essential env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `XAI_API_KEY` (use a test or real value)

### Bootstrap / Install

**Always run:**
```bash
npm install
```
- Run this anytime you pull, switch branches, or update dependencies.
- If you experience build or type errors, re-run `npm install`.

### Build

```bash
npm run build
```
- Builds the Next.js app for production. All code should typecheck and bundle without error.
- If build fails: check TypeScript errors, missing env vars, or out-of-date node_modules.

### Development Run

```bash
npm run dev
```
- Launches the app locally on `localhost:3000` with hot reload.
- Requires valid `.env` and installed dependencies.

### Lint

```bash
npm run lint
```
- Uses Next.js recommended lint config (eslint).
- All new code should lint with zero errors before PR/commit.

### Test

- As of onboarding, **no dedicated test suite** (e.g. Jest/vitest) present. If tests are added, run via:
  ```bash
  npm test
  ```
  or follow README/test script conventions.

### Clean

```bash
npm run clean
```
- If present, removes `.next`, caches, and resets build artifacts.

---

## Project Layout & Key Configuration

- **Major project directories/files**:
  - `/app` – Next.js frontend routes (main content, dashboard, login, etc).
  - `/app/api` – API route handlers (backend code, protected via middleware).
  - `/src/lib` – Shared code, e.g., Supabase client (`supabase.ts`).
  - `/public` – Static assets.
  - `/styles` or inline Tailwind for design.
  - `middleware.ts` (project root) – Handles Supabase session and authentication headers for API.
  - `next.config.js` – Next.js configuration.
  - `.env.example` – Template for runtime secrets/keys.
  - `package.json` – Scripts and dependencies.
  - `.eslintrc.*` – Linting ruleset.
  - `.github/workflows/` (if present) – GitHub Actions CI definitions.
  - `README.md` – User/developer-facing project and setup info.

- **API/auth logic**:  
  - API routes in `/app/api/*/route.ts` expect authentication headers set by `middleware.ts` (`x-user-id`). Missing/invalid user results in HTTP 401.
  - Dashboard and sensitive pages guarded client-side using Supabase session check.

- **CI/CD**:
  - PRs/merges should build/lint successfully to pass Vercel deploy.
  - If workflows are present in `.github/workflows/`, inspect for required CI steps.

---

## Command/Validation Sequence

1. **First time on a new checkout:**
   - Copy `.env.example` to `.env` and fill as needed.
   - `npm install`
   - `npm run lint`
   - `npm run build`
   - `npm run dev` (for local testing)

2. **On each PR/branch update:**
   - Always run `npm install`.
   - Lint and build before pushing.

3. **If you see errors:**
   - Try cleaning: `rm -rf node_modules .next && npm install`
   - Ensure all `.env` values are present.
   - Check Next.js and Supabase docs for breaking changes if dependencies update.

---

## Checks Before Check-In

- Code must build and lint cleanly (`npm run build`, `npm run lint`).
- Add or update types as needed for all exported interfaces/functions.
- Do **not** push credentials, service roles, or private keys.
- Use provided Supabase public (anon) keys only for dev.
- All newly created API routes must check auth via the `x-user-id` header.

---

## Repository Root Directory Structure (typical)

```text
/app
  /api
  /*page.tsx
  /*layout.tsx
/src
  /lib
    supabase.ts
/public
  (static assets)
/styles (or Tailwind classes inline)
middleware.ts
next.config.js
package.json
.env.example
README.md
```

---

## README.md Synopsis

- Describes how to run, build, and deploy the app (Next.js + Supabase stack).
- Outlines public Supabase config.
- Lists URLs, key flows (login, dashboard, magic link).
- Deployment URL: `https://hvacflow.app`
- Reference instructions for configuring Supabase Auth redirects and Vercel domain.

---

## Guidance for Coding Agents

- Trust these instructions for install, build, and validation flows.
- Only search or explore if you encounter errors or missing information here.
- For all codegen: prefer idiomatic, type-safe TypeScript and follow Next.js/Supabase best practices as modeled in source.
