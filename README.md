# InterviewPrep AI

## Table of Contents
1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started Locally](#getting-started-locally)
4. [Available Scripts](#available-scripts)
5. [Project Scope](#project-scope)
6. [Project Status](#project-status)
7. [Learn More](#learn-more)
8. [License](#license)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) – deep-dive into framework features and API.
- [Supabase Documentation](https://supabase.com/docs) – database, authentication, and REST API reference.
- [OpenAI API Docs](https://platform.openai.com/docs) – model parameters, rate limits, and best practices.

## Project Description
InterviewPrep AI is a lightweight web application that helps candidates prepare for technical interviews.
Paste the full text of any job advertisement and the app will instantly generate **five language-matched interview questions** powered by OpenAI GPT-3.5-Turbo.  
Questions are stored per-user so you can mark them as *practised* or *unpractised* and track your progress over time.

## Tech Stack
- **Framework:** Next.js 15 (App Router) with TypeScript 5  
- **Runtime:** Node.js 20  
- **Styling:** Tailwind CSS 4 + shadcn/ui  
- **Backend-as-a-Service:** Supabase (PostgreSQL, REST API, GitHub OAuth, Row Level Security)  
- **AI:** OpenAI GPT-3.5-Turbo via `/api/generate` route  
- **Auth:** `@supabase/auth-helpers-nextjs` with GitHub provider  
- **Testing:** Playwright end-to-end tests  
- **CI/CD:** GitHub Actions → deploy on Vercel  

## Getting Started Locally
### Prerequisites
* Node 20 (managed via `.nvmrc`)
* GitHub OAuth app configured in Supabase
* OpenAI API key

### Installation
```bash
# 1. Clone the repo
$ git clone https://github.com/<your_username>/interviewprep.git
$ cd interviewprep

# 2. Install dependencies
$ npm install    # or pnpm install

# 3. Create environment variables
$ cp .env.example .env.local
# then fill in SUPABASE_URL, SUPABASE_ANON_KEY and OPENAI_API_KEY

# 4. Run the development server
$ npm run dev
```
Visit `http://localhost:3000` and sign in with GitHub to start generating questions.

## Available Scripts
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js in development mode with TurboPack |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the built app in production mode |
| `npm run lint` | Run ESLint code quality checks |
| `npm run test:e2e` | Execute Playwright end-to-end test |

## Project Scope
### In scope (MVP)
* GitHub OAuth sign-in
* Text area to paste full job ad
* Generation of exactly five questions in the same language
* Persistent storage of questions per user
* Mark question as **practised / not practised**
* "My Questions" table filtered by current user
* Single Playwright e2e test (login → generate → toggle status)
* CI pipeline (install → test → build) blocking merges on failure

### Out of scope (post-MVP)
* Answer grading or feedback
* Importing CV, chat/voice interface, advanced analytics
* Mobile applications, calendar integrations, WCAG AA compliance
* Multi-tenant scale (>3 active users)
* Containerisation (covered by Serverless & BaaS)

## Project Status
🚧 **Work in progress** – core MVP features are being implemented.  
Planned success metrics:
1. 100 % green on CI pipeline
2. ≥ 95 % pass rate for the Playwright test
3. Average question-generation time < 15 s

Watch the project board for detailed progress and upcoming tasks.

## License
Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information. 