# InterviewPrep AI

✨ **AI-powered interview preparation** app that generates personalized, **batched interview questions** powered by OpenRouter API.

---

## 🌟 Key Features

- **GitHub OAuth Authentication** – secure login via GitHub account  
- **Smart Question Generation** – paste job posting, get 5 tailored questions
- **Question Practice Tracking** – mark questions as practiced/unpracticed
- **Multi-language Support** – questions generated in the same language as job posting
- **Batch Processing** – all questions saved atomically to prevent data loss

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend:** Next.js API Routes (Server Actions)
- **Database:** PostgreSQL (Supabase) with Row Level Security (RLS)
- **Authentication:** Supabase Auth with GitHub OAuth
- **AI:** OpenRouter API via `/api/generate` route
- **Testing:** Jest (unit), Playwright (e2e)
- **CI/CD:** GitHub Actions

---

## 🚀 Quick Start

### Prerequisites

* Node.js 20+ (check `.nvmrc`)
* GitHub account (for OAuth)
* Supabase project
* OpenRouter API key

### Installation

```bash
# Clone and install dependencies
git clone <repo_url>
cd InterviewPrep
npm ci

# Copy environment template
# then fill in SUPABASE_URL, SUPABASE_ANON_KEY and OPENROUTER_API_KEY
cp .env.example .env.local

# Run database migrations
npx supabase db reset

# Start development server
npm run dev
```

## 🧪 Demo Mode (Testing without OpenRouter API Key)

If you don't have an OpenRouter API key yet or want to test the app with mock responses, you can enable **Demo Mode**:

### Option 1: Environment Variable
```bash
# In your .env.local file
NEXT_PUBLIC_DEMO_MODE=true
```

### Option 2: No API Key
Simply don't set the `OPENROUTER_API_KEY` environment variable, and the app will automatically switch to demo mode.

### What Demo Mode Does:
- ✅ Uses realistic mock questions in multiple languages (EN, PL, DE)
- ✅ Simulates API response delay for authentic experience  
- ✅ Detects job posting language and returns appropriate questions
- ✅ All other features work normally (auth, database, practice tracking)
- ⚠️ Shows a console warning: "🚧 AI Service running in DEMO MODE"

### Example Mock Questions:
- **English**: "Can you walk me through your experience with the technologies mentioned in this role?"
- **Polish**: "Opowiedz o swoim doświadczeniu z technologiami wymienionymi w tej ofercie pracy."
- **German**: "Können Sie Ihre Erfahrung mit den in dieser Stelle erwähnten Technologien beschreiben?"

**Perfect for:**
- 🎯 Development and testing
- 🎯 Demos and presentations  
- 🎯 Understanding app functionality before getting API keys
- 🎯 CI/CD pipelines without real API calls

---

## 📝 API Endpoints

### Core Routes:
- `POST /api/questions/generate` – Generate and save 5 questions from job posting
- `GET /api/questions` – List user's questions with pagination and filters
- `PATCH /api/questions/[id]` – Update question practice status

---

## 🧪 Testing

```bash
# Unit tests (with mocked OpenRouter)
npm run test

# E2E tests (with demo mode)
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📚 Key Documentation

- [Next.js App Router](https://nextjs.org/docs/app) – routing, server components, and API routes
- [Supabase](https://supabase.com/docs) – database, auth, and real-time subscriptions
- [OpenRouter API Docs](https://openrouter.ai/docs) – model parameters, rate limits, and best practices.

---

## 🔒 Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenRouter Configuration (optional - uses demo mode if not set)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Demo Mode (optional - defaults to false)
NEXT_PUBLIC_DEMO_MODE=false

# GitHub OAuth (for production)
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
```

---

Built with ❤️ for efficient interview preparation. 