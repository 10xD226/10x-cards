## Test Plan: InterviewPrep AI

**Wersja:** 1.0
**Data:** 24.05.2024
**Autor:** AI Assistant

### 1. Cele Testowania

Głównym celem tego planu jest zapewnienie, że aplikacja **InterviewPrep AI** spełnia wszystkie zdefiniowane wymagania funkcjonalne (FR-001 do FR-009) oraz jest stabilna, bezpieczna i gotowa do wdrożenia.

**Cele szczegółowe:**

*   **Weryfikacja Funkcjonalności:** Potwierdzenie, że wszystkie kluczowe funkcje – od autoryzacji po generowanie i zarządzanie pytaniami – działają zgodnie z dokumentacją (`prd-interview.md`).
*   **Zapewnienie Jakości AI:** Sprawdzenie, czy integracja z OpenRouter API jest odporna na błędy, a generowane dane są poprawnie walidowane i zapisywane.
*   **Gwarancja Bezpieczeństwa:** Weryfikacja, czy mechanizmy autoryzacji (GitHub OAuth) i autoryzacji (Supabase RLS) skutecznie chronią dane użytkowników.
*   **Stabilność i Obsługa Błędów:** Upewnienie się, że aplikacja elegancko obsługuje błędy (np. błędy API, niepoprawne dane wejściowe, brak kluczy) bez awarii i z jasną komunikacją dla użytkownika.
*   **Automatyzacja i Niezawodność CI/CD:** Potwierdzenie, że zdefiniowany proces CI/CD (`GitHub Actions`) jest niezawodny i skutecznie blokuje wadliwy kod.

### 2. Zakres Testów

#### W zakresie (In-Scope):

*   **Testy Jednostkowe (Unit Tests):**
    *   Logika biznesowa w serwisach (`/src/lib/`): `openrouter-adapter.ts`, `openrouter.service.ts`, `questions.ts`.
    *   Funkcje pomocnicze i walidacja (`/src/schemas/`).
*   **Testy Integracyjne (Integration/Component Tests):**
    *   Komponenty React (`/src/components/`): interakcje użytkownika, renderowanie warunkowe, integracja z hookami (np. `react-query`).
    *   API Route Handlers (`/src/app/api/`): integracja z serwisami, autoryzacja, walidacja `Zod`.
*   **Testy End-to-End (E2E):**
    *   Pełne ścieżki użytkownika (tzw. "happy path") obejmujące logowanie, generowanie pytań i zmianę statusu.
    *   Kluczowe scenariusze błędów i zabezpieczeń widziane z perspektywy przeglądarki.
*   **Testy Bezpieczeństwa (Security Testing):**
    *   Weryfikacja polityk RLS w Supabase.
    *   Testowanie ochrony tras przez `middleware.ts`.
    *   Sprawdzenie autoryzacji na poziomie API.

#### Poza zakresem (Out-of-Scope):

*   Testy wydajnościowe i obciążeniowe (aplikacja przeznaczona dla niewielkiej liczby użytkowników).
*   Pełne testy kompatybilności przeglądarek (skupiamy się na Chromium, zgodnie z `playwright.config.ts`).
*   Zaawansowane testy dostępności (WCAG), poza podstawowymi atrybutami `aria`.
*   Testy wizualnej regresji.

### 3. Scenariusze Testowe

Poniższe scenariusze są podzielone według poziomów piramidy testów i obejmują zarówno przypadki standardowe, jak i brzegowe.

#### A. Testy Jednostkowe (Unit Tests - `Jest` + `ts-jest`)

| ID Testu    | Komponent/Moduł                  | Scenariusz                                                                        | Przypadki Brzegowe (Edge Cases)                                                                                                           |
|-------------|----------------------------------|-----------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **UT-AI-01**  | `openrouter-adapter.ts`        | Poprawne wygenerowanie 5 pytań przy udanej odpowiedzi z API (mock `fetch`).       | API zwraca: niepoprawny JSON, tablicę o innej długości niż 5, string zamiast tablicy, pytania niespełniające walidacji Zod (za krótkie/długie). |
| **UT-AI-02**  | `openrouter.service.ts`        | Poprawne wykrycie języka na podstawie tekstu. | Tekst mieszany (kilka języków), brak słów kluczowych, bardzo krótki tekst.                                                                 |
| **UT-AI-03**  | `openrouter-adapter.ts`        | Rzucenie odpowiedniego błędu przy błędach API (401, 429, 500).                     | Niestandardowy kod błędu, timeout połączenia, błąd sieci.                                                                                 |
| **UT-DB-01**  | `questions.ts`                 | Poprawne mapowanie rekordu z bazy na DTO (`rowToDto`) - usunięcie `user_id`.      | Rekord z bazy z brakującymi, opcjonalnymi polami.                                                                                         |
| **UT-VAL-01** | `schemas/question.ts`          | Walidacja `GenerateQuestionsSchema` przechodzi dla poprawnego tekstu.             | Tekst na granicy długości (100, 10000 znaków), tekst z samymi spacjami, znaki specjalne, emoji.                                            |
| **UT-VAL-02** | `schemas/question.ts`          | Walidacja `ListQuestionsQuerySchema` poprawnie rzutuje i ustawia domyślne wartości. | `limit`/`offset` jako string, ujemne wartości, wartości spoza zakresu (0, 101).                                                             |

#### B. Testy Integracyjne (Component/Integration Tests - `Jest` + `React Testing Library`)

| ID Testu     | Komponent/API                     | Scenariusz                                                                            | Przypadki Brzegowe (Edge Cases)                                                                                                                  |
|--------------|-----------------------------------|---------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| **IT-UI-01**   | `JobPostingForm.tsx`              | Przycisk "Generuj" jest aktywny tylko gdy tekst ma 100-10000 znaków.                  | Wklejenie i usunięcie tekstu, szybkie pisanie, dynamiczne zmiany licznika znaków i jego koloru.                                                  |
| **IT-UI-02**   | `JobPostingForm.tsx`              | Formularz pokazuje stan ładowania (`isPending`) i blokuje ponowne wysłanie.           | Użytkownik próbuje kliknąć przycisk wielokrotnie.                                                                                                |
| **IT-UI-03**   | `JobPostingForm.tsx`              | Po błędzie z API (mock `fetch`) wyświetla się toast z błędem (`destructive`).         | Różne statusy błędów (400, 429, 500) i odpowiadające im komunikaty.                                                                               |
| **IT-UI-04**   | `PracticeToggle.tsx`              | Kliknięcie w przełącznik powoduje natychmiastową (optymistyczną) zmianę w UI.         | Szybkie, wielokrotne klikanie. Błąd API powoduje powrót do poprzedniego stanu.                                                                   |
| **IT-UI-05**   | `QuestionsList.tsx`               | Komponent wyświetla stan "pusty", gdy tablica pytań jest pusta.                       | Tablica pytań jest `null` lub `undefined` (jeśli możliwe).                                                                                        |
| **IT-API-01**  | `/api/questions/generate`         | Endpoint zwraca 401 przy braku sesji (zamockowany `getSession`).                      | Wysyłanie żądania z nieważnym lub wygasłym tokenem.                                                                                              |
| **IT-API-02**  | `/api/questions/generate`         | Endpoint zwraca 400 przy niepoprawnym body (walidacja Zod).                           | Puste body, brak pola `jobPosting`, `jobPosting` o niepoprawnym typie (np. `number`).                                                              |
| **IT-API-03**  | `/api/questions/[id]` (PATCH)     | Endpoint zwraca 404 przy próbie aktualizacji pytania nienależącego do użytkownika.    | Podanie UUID pytania, które nie istnieje.                                                                                                        |
| **IT-API-04**  | `/api/questions` (GET)            | Poprawne filtrowanie i paginacja na podstawie query params (`practiced`, `limit`).    | Podanie niepoprawnych query params (np. `practiced=yes`) - testowanie walidacji Zod na poziomie API.                                               |

#### C. Testy End-to-End (E2E - `Playwright`)

| ID Testu     | Ścieżka Użytkownika               | Scenariusz "Happy Path"                                                                                                  | Przypadki Brzegowe (Edge Cases) i Negatywne                                                                                                      |
|--------------|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| **E2E-HP-01**  | **Pełny Przepływ (FR-007)**       | 1. **Mock logowania** przez ustawienie cookie sesji. <br> 2. Nawigacja do `/`. <br> 3. Weryfikacja załadowania Dashboardu. <br> 4. **Mock API** `POST /api/questions/generate` zwracającego 5 pytań. <br> 5. Wypełnienie formularza, kliknięcie "Generuj". <br> 6. Sprawdzenie, czy 5 pytań pojawiło się na liście. <br> 7. **Mock API** `PATCH /api/questions/[id]`. <br> 8. Kliknięcie przełącznika `practiced`, weryfikacja zmiany w UI. |
| **E2E-SEC-01** | **Dostęp nieautoryzowany**        | Próba wejścia na `/` bez mockowania sesji.                                                                                 | Oczekiwanie przekierowania na `LandingPage`. Próba wywołania `fetch` do `/api/questions` z konsoli przeglądarki - oczekiwany błąd 401.             |
| **E2E-ERR-01** | **Błąd Generowania Pytań**      | Mock API `POST /api/questions/generate` zwracającego status `500`.                                                          | Po kliknięciu "Generuj", formularz wraca do stanu początkowego, pojawia się toast z błędem, a lista pytań nie ulega zmianie.                    |


### 4. Narzędzia i Środowisko Testowe

*   **Framework Testów Jednostkowych/Integracyjnych:** **Jest** (`v30.0.0`) z **ts-jest**
*   **Biblioteka do Testowania Komponentów:** **React Testing Library** (`v16.3.0`)
*   **Framework Testów E2E:** **Playwright** (`v1.53.0`)
*   **Walidacja Schematów:** **Zod** (`v3.25.64`)
*   **Środowisko Uruchomieniowe:** **Node.js** (`v20`)
*   **CI/CD:** **GitHub Actions**
*   **Mockowanie API:** `jest.mock()` dla testów jednostkowych, `page.route()` dla testów E2E.
*   **Baza Danych:** **Supabase (PostgreSQL)**. Testy nie powinny uderzać do prawdziwej bazy danych (poza testami dymnymi na środowisku deweloperskim).

### 5. Dobre Praktyki dla Modelu AI Implementującego Testy

Model AI, który będzie implementował ten plan, powinien przestrzegać następujących zasad:

1.  **Zasada Izolacji (Isolation):**
    *   **Testy jednostkowe** muszą być w pełni izolowane. Używaj `jest.mock()` do mockowania zależności takich jak `fetch`, `supabase-js`, czy inne serwisy. Nigdy nie wykonuj prawdziwych zapytań sieciowych.
    *   **Testy E2E** powinny mockować zewnętrzne API (`OpenRouter`) oraz proces logowania, aby zapewnić szybkość i niezawodność (uniknięcie zależności od stabilności GitHub OAuth).

2.  **Czytelność i Utrzymywalność (Readability & Maintainability):**
    *   Stosuj strukturę **Arrange-Act-Assert** (lub Given-When-Then) w każdym teście.
    *   Opisy testów (`it('...')`) muszą być jasne i precyzyjnie opisywać, co jest testowane.
    *   Używaj atrybutów `data-testid` do selekcji kluczowych, interaktywnych elementów w testach E2E i integracyjnych, aby uniknąć łamliwości testów przy zmianach w stylach CSS lub strukturze DOM.

3.  **Skupienie na Odpowiednim Poziomie (Focus on the Right Level):**
    *   **Unit Tests:** Testuj logikę, algorytmy, transformacje danych, obsługę błędów w funkcjach.
    *   **Integration Tests:** Testuj interakcje między komponentami, przekazywanie propsów, wywoływanie callbacków i poprawność renderowania w odpowiedzi na akcje użytkownika.
    *   **E2E Tests:** Testuj kompletne ścieżki użytkownika i krytyczne integracje (np. frontend -> API -> frontend). Nie testuj szczegółowej logiki komponentów na tym poziomie.

4.  **Kompletność Scenariuszy (Completeness):**
    *   Dla każdej funkcji testuj nie tylko "happy path", ale również **scenariusze negatywne i brzegowe** zidentyfikowane w tym planie.
    *   Przed napisaniem testu dla endpointu API, przeanalizuj jego implementację w `src/app/api/**/route.ts` oraz powiązane schematy Zod w `src/schemas/question.ts`, aby pokryć wszystkie ścieżki warunkowe i walidacyjne.

5.  **Niezawodność w CI/CD (CI/CD Reliability):**
    *   Unikaj `setTimeout` lub `waitFor` ze stałym czasem w testach. Zamiast tego używaj asynchronicznych matcherów z `React Testing Library` (np. `findBy*`) i `Playwright` (np. `expect(locator).toBeVisible()`), które czekają na spełnienie warunku.
    *   Upewnij się, że testy są w pełni deterministyczne i mogą być uruchamiane równolegle bez konfliktów.

---
Ten Test Plan stanowi kompleksowy przewodnik zapewniający wysoką jakość i niezawodność Twojego projektu zaliczeniowego.