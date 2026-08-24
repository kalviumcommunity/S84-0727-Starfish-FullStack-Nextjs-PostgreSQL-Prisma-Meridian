# CloudLens AI — Cloud Cost Attribution & Deployment Intelligence

CloudLens AI correlates cloud billing with deployments and code to explain why costs changed — and which engineering actions caused them.

Single-app architecture: one TanStack Start server serves the marketing site, dashboard UI, and REST API.

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud like Neon, Supabase)
- (Optional) GitHub Personal Access Token for private repos
- (Optional) Groq or Gemini API key for AI insights

### 1. Environment

Copy the example env file and add your credentials:

```bash
cp .env.example .env
```

**Required variables:**

| Variable       | Description                                                         |
| -------------- | ------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string (local Postgres, Neon free tier, etc.) |
| `JWT_SECRET`   | Random string, **at least 16 characters** (e.g., `your-super-secret-jwt-key-min-16-chars`) |
| `APP_URL`      | Public app URL (`http://localhost:3000` for local dev)              |

**Optional variables (for AI insights):**

| Variable          | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `GITHUB_TOKEN`    | GitHub Personal Access Token (optional for public repos) |
| `GROQ_API_KEY`    | Groq API key for AI insights (free tier available - **recommended**)       |
| `GEMINI_API_KEY`  | Google Gemini API key for AI insights (free tier available) |

**AI policy:** By default the app does NOT call external AI services. The server uses a local rule-based insights engine unless you explicitly opt-in. To enable external AI providers (Groq or Gemini), set `ALLOW_EXTERNAL_AI=true` in your `.env` and provide the appropriate API key(s). This prevents accidental use of paid APIs.

**Session storage:** Authentication sessions are stored in an HTTP-only cookie named `meridian_session`. The client does not store JWTs in `localStorage` — cookies are used to keep tokens secure (HttpOnly, SameSite=Lax). You do not need to change client code to switch to cookie sessions.

> **Note:** You need at least one AI API key (Groq or Gemini) for the AI insights feature to work. Without it, the system will use rule-based insights instead.

### 2. Database

Push the schema to your database:

```bash
npm run db:push
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register at `/auth/register`, then use the dashboard at `/app`.

## Implementation Status

### ✅ Phase 1: Foundation (Complete)
- User registration, login, logout (JWT in HTTP-only cookie)
- Organization and project management
- REST API under `/api/*`
- Authenticated dashboard at `/app`
- Enhanced login/signup UI

### ✅ Phase 2: GitHub Integration (Complete)
- Connect GitHub repositories to projects
- Fetch and store commits as deployments
- Sync commits automatically
- Support for public and private repos

### ✅ Phase 3: Billing Engine (Complete)
- CSV billing upload
- Cost analysis and spike detection
- Service-level cost breakdown
- Historical cost tracking

### ✅ Phase 4: Correlation Engine (Complete)
- Automatic correlation of cost spikes with deployments
- Confidence scoring based on timing and context
- Detailed correlation reasons

### ✅ Phase 5: AI Insights (Complete)
- AI-powered cost analysis (Groq/Gemini)
- Actionable recommendations
- Fallback to rule-based insights
- Insight storage and history

### 🚧 Phase 6: Dashboard (In Progress)
- Overview dashboard
- Cost visualization
- Deployment timeline
- Insights display

## Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `npm run dev`        | Start local dev server         |
| `npm run build`      | Production build               |
| `npm run preview`    | Preview production build       |
| `npm run db:push`    | Sync Prisma schema to database |
| `npm run db:migrate` | Create and run migrations      |
| `npm run db:studio`  | Open Prisma Studio             |

## API Endpoints

### Authentication
| Method   | Path                 | Description                 |
| -------- | -------------------- | --------------------------- |
| POST     | `/api/auth/register` | Create account              |
| POST     | `/api/auth/login`    | Sign in                     |
| POST     | `/api/auth/logout`   | Sign out                    |
| GET      | `/api/auth/me`       | Current user                |

### Organizations & Projects
| Method   | Path                 | Description                 |
| -------- | -------------------- | --------------------------- |
| GET/POST | `/api/organizations` | List / create organizations |
| GET/POST | `/api/projects`      | List / create projects      |
| GET      | `/api/projects/:id`  | Get project                 |

### GitHub Integration
| Method   | Path                 | Description                 |
| -------- | -------------------- | --------------------------- |
| POST     | `/api/github/connect`| Connect GitHub repo         |
| GET      | `/api/github/commits`| Get deployment history      |
| POST     | `/api/github/sync`   | Sync latest commits         |

### Billing
| Method   | Path                 | Description                 |
| -------- | -------------------- | --------------------------- |
| POST     | `/api/billing/upload`| Upload billing CSV          |
| GET      | `/api/billing`       | Get billing records         |
| GET      | `/api/billing/analysis` | Analyze costs            |

### Correlation & Insights
| Method   | Path                 | Description                 |
| -------- | -------------------- | --------------------------- |
| GET      | `/api/correlation/analyze` | Correlate costs with deployments |
| GET      | `/api/insights`      | Get insights                |
| POST     | `/api/insights/generate` | Generate new AI insight |

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React app (UI + API)
- [Prisma](https://www.prisma.io) + PostgreSQL — database
- [TanStack Router](https://tanstack.com/router) — routing
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Octokit](https://github.com/octokit/rest.js) — GitHub API
- [Groq](https://groq.com) / [Gemini](https://ai.google.dev) — AI insights

## Deployment

Deploy as a single Node app (Vercel, Render, Railway, Fly.io, etc.). Set `DATABASE_URL`, `JWT_SECRET`, and `APP_URL` in your host's environment variables, then run `npm run build` and start the server.

## CSV Format

Upload billing data in CSV format with these columns:

```csv
Date,Service,Cost
2026-02-10,EC2,50.25
2026-02-11,EC2,150.75
2026-02-11,S3,30.00
```

## Getting API Keys (Free)

### GitHub Token (Optional for public repos)
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Copy token to `.env` as `GITHUB_TOKEN`

### Groq API Key (Recommended for fast AI)
1. Go to https://console.groq.com/keys
2. Sign up for free account
3. Create new API key
4. Copy to `.env` as `GROQ_API_KEY`

### Gemini API Key (Alternative)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Get API key
4. Copy to `.env` as `GEMINI_API_KEY`
