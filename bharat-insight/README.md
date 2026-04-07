# Bharat Insight

Bharat Insight is a Next.js 16 assignment build for a multi-tenant, AI-assisted analytics platform focused on Indian public-sector style datasets.

## What is implemented

- Dark-mode landing page with gradients, motion-driven section reveals, bento grid storytelling, and an animated hero chart
- Virtualized analytics dashboard with 120,000 department records per tenant
- Tenant switching between Health and Agriculture with instant UI and data changes
- Admin and Viewer access states
- Fuzzy search, state and year filters, sticky headers, and keyboard navigation
- Command palette with `Cmd/Ctrl + K`
- Shimmer skeleton loaders
- Streaming Gemini insight panel with a visible reasoning state
- Zustand for UI state and TanStack Query for dataset orchestration
- Real Supabase magic-link auth flow with cookie-backed sessions
- Server-side `data.gov.in` integration path with live/fallback mode handling

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS v4
- Framer Motion
- Zustand
- TanStack Query
- TanStack Virtual
- Google Gemini SDK
- Supabase JS client

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

3. Add your Gemini key to `.env.local`:

```env
GEMINI_API_KEY=your_real_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
DATA_GOV_IN_API_KEY=
DATA_GOV_HEALTH_RESOURCE_ID=3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69
DATA_GOV_AGRI_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070
```

4. Start development:

```bash
npm run dev
```

5. Verify quality:

```bash
npm run lint
npm run build
```

## Notes on the assignment requirements

### Data handling

- The dashboard now queries a server-side `/api/datasets` route.
- When `DATA_GOV_IN_API_KEY` is configured, Health uses a live CPCB AQI-style `data.gov.in` feed and Agriculture uses a live AGMARKNET mandi feed.
- Returned records are normalized into a shared analytics shape and expanded to a large virtualized surface so the grid still demonstrates 100K+ row handling.
- If the API key is missing or the live source fails, the app falls back to the deterministic local dataset.

### Virtualization and performance

- `@tanstack/react-virtual` is used for row virtualization.
- Search uses a deferred query value and Fuse.js fuzzy matching.
- Tenant datasets are prefetched with TanStack Query to reduce switch friction.
- Sticky headers and keyboard navigation keep the grid usable at high row counts.

### Multi-tenancy logic

- Zustand stores the active department, role, and command palette state.
- Tenant config controls labels, colors, metric names, and source references.
- Switching tenants updates the full visual language and dataset without route reloads.

### AI prompt design

- The AI route receives the current department, active filters, filtered row count, summary stats, and sample rows.
- The prompt explicitly asks Gemini to stay grounded in the active dashboard context.
- Responses stream token by token through Server-Sent Events and expose a short reasoning phase before the final answer.

### Authentication readiness

- Cookie-based Supabase auth is wired through `@supabase/ssr`, a `proxy.ts` session refresh layer, and an `/auth/callback` route.
- The UI supports magic-link email sign-in and sign-out.
- When Supabase environment variables are missing, the UI falls back to demo mode and keeps the assignment usable locally.
