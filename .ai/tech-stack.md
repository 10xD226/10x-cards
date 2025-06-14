Stack technologiczny

Framework: Next.js 15 (App Router) + TypeScript 5 (npx create-next-app).

Stylowanie: Tailwind CSS 4 oraz shadcn/ui (biblioteka gotowych komponentów React).

Backend‑as‑a‑Service: Supabase – wbudowany PostgreSQL + GitHub OAuth + REST API; eliminuje potrzebę osobnych warstw NextAuth, Prisma i zewnętrznej bazy.

Autoryzacja: provider GitHub skonfigurowany w panelu Supabase; sesja zarządzana przez @supabase/auth-helpers-nextjs.

Dane: tabela questions (id, user_id, content, practiced:boolean) zarządzana przez Supabase; operacje CRUD bezpośrednio przez supabase-js z klienta.

AI: OpenRouter API – wywołania z serwerless route /api/generate (Next.js Route Handler) z dostępem do wielu modeli AI (OpenAI, Anthropic, Meta, inne); klucz OPENROUTER_API_KEY w zmiennych środowiskowych Vercel.

Testowanie: Playwright – pojedynczy test e2e obejmujący logowanie, generowanie i oznaczanie pytania.

CI/CD: GitHub Actions (pnpm install → pnpm test → pnpm build) oraz automatyczny deploy na Vercel.

Hosting: Vercel Free Tier – push‑to‑deploy, certyfikat HTTPS, globalny CDN.

Konteneryzacja: niepotrzebna (Serverless & BaaS pokrywają wymagania).

