# API Endpoint Implementation Plan: Generate and Store Questions (`POST /api/questions/generate`)

## 1. Przegląd punktu końcowego
Ten endpoint przyjmuje pełną treść ogłoszenia o pracę, wykorzystuje model OpenAI GPT-3.5-Turbo do wygenerowania **dokładnie pięciu (5)** realistycznych pytań rekrutacyjnych, a następnie atomowo zapisuje je w tabeli `public.questions` z przypisaniem do zalogowanego użytkownika. Zwraca listę świeżo utworzonych rekordów.

## 2. Szczegóły żądania
* **HTTP Method**: `POST`
* **URL**: `/api/questions/generate`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization`: ciasteczko Supabase / token JWT (zarządzany przez `@supabase/auth-helpers-nextjs`)
* **Request Body** *(JSON)*:
  ```json
  {
    "jobPosting": "string (100-10000 characters)"
  }
  ```
* **Wymagane parametry**: `jobPosting`
* **Walidacja**:
  * długość 100-10000 znaków po `trim()`
  * string UTF-8 (bez binarnych danych)

## 3. Wykorzystywane typy (DTO / Command)
* `GenerateQuestionsCommand` — struktura treści żądania.
* `QuestionDto` — reprezentacja pojedynczego pytania (bez `user_id`).
* `GenerateQuestionsResponseDto` / `ApiErrorResponse` — sukces / błąd.
* Powiązanie z bazą: `QuestionDto` dziedziczy z `Tables<'questions'>` przy pomocy `Omit`.

## 4. Szczegóły odpowiedzi
* **Status 201 – Created**
  ```json
  {
    "success": true,
    "data": [QuestionDto, …x5],
    "message": "5 questions generated successfully"
  }
  ```
* **Błędy** (patrz sekcja 6): `400`, `401`, `422`, `429`, `500`.

## 5. Przepływ danych
1. **Autoryzacja** – Route Handler tworzy klienta Supabase po stronie serwera i wyciąga `session.user.id`; brak sesji ⇒ `401`.
2. **Walidacja Zod** – sprawdza `jobPosting`.
3. **openaiService.generateQuestions(jobPosting)**
   * System-prompt chroniący przed prompt-injection.
   * Żądanie z parametrami model=`gpt-3.5-turbo`, temperatura=0.7.
4. **Walidacja danych wyjściowych** – musi być tablica 5 stringów `20-300` znaków; w przeciwnym razie `422`.
5. **questionService.createBatch(questions[], userId)**
   * Supabase **RPC** lub manualna transakcja: `insert` pięciu rekordów w jednym `commit`.
   * Pola `position` ⟶ 1-5, `practiced` ⟶ `false`.
6. **Response** – mapowanie rekordów na `QuestionDto`, zwrot `201`.

## 6. Względy bezpieczeństwa
* **Uwierzytelnianie** – Supabase `getUser()` w route handlerze.
* **Autoryzacja/RLS** – tabela `questions` ma RLS `user_id = auth.uid()`; `createBatch` wykonuje się z kontekstu użytkownika.
* **Sanityzacja wejścia** – Zod + długość; ewentualny strip HTML.
* **Prompt Injection** – restrykcyjny system-prompt + filtr długości.
* **Rate limiting** – per-user (np. 5 żądań / godz.) za pomocą Supabase Ratelimit lub middleware.
* **Safe-retry** – idempotency key generowany po stronie klienta nie jest wymagany, bo endpoint zawsze tworzy nowy zestaw.

## 7. Obsługa błędów
| Scenariusz | Kod | Zachowanie |
|------------|-----|------------|
| Brak autoryzacji | 401 | `{ success:false, message:"Unauthorized" }` |
| Walidacja `jobPosting` nie przeszła | 400 | Szczegółowy opis pól | 
| Błąd OpenAI (validation, quota, 4xx) | 422 | Mapujemy `error.message` |
| Rate limit (np. 429 od OpenAI lub własny) | 429 | "Too Many Requests" |
| Błąd DB / nieoczekiwany | 500 | Log do `errors` + Sentry |

## 8. Rozważania dotyczące wydajności
* **Timeout** – 15 s budżetu; ustaw `fetch` timeout na 12 s.
* **Równoległość** – generacja 5 pytań w jednym prompt (unika 5 × round-trip).
* **Streaming** – opcjonalnie umożliwić `chunks` dla UX, ale zapisy dopiero po pełnym sukcesie.
* **Indeksy** – istnieje indeks na `user_id`; zapytania insert/ select są O(1).

## 9. Etapy wdrożenia
1. **Definicje typów** (wykonane) – `src/types.ts`.
2. **Zod schema** – `schemas/question.ts` z `GenerateQuestionsSchema`.
3. **openaiService** – `lib/openai.ts`; hermetyzuje wywołania i mapowanie odpowiedzi.
4. **questionService** – `lib/questions.ts`; funkcja `createBatch` z transakcją Supabase.
5. **Route Handler** – `app/api/questions/generate/route.ts` (Next.js 15, App Router):
   ```ts
   export const POST = withRateLimit(async (req) => { /*…*/ })
   ```
6. **RLS policy** – potwierdzić w Supabase Dashboard, że `INSERT` wymaga `auth.uid() = user_id`.
7. **CI/CD** – dodać test jednostkowy (jest snapshot) i Playwright scenario "generate questions".
8. **Monitoring** – integracja z Sentry + dashboard Supabase Logs.
9. **Dokumentacja** – aktualizacja `.ai/api-plan.md` i README. 