# Architektura UI dla InterviewPrep

## 1. Przegląd struktury UI
InterviewPrep to jednoekranowa aplikacja (SPA) uruchamiana po pomyślnym logowaniu przez GitHub OAuth. Dla użytkowników niezalogowanych `/` wyświetla stronę powitalną z przyciskiem logowania. Po autoryzacji ta sama ścieżka (`/`) renderuje widok główny składający się z dwóch sekcji: formularza wklejenia ogłoszenia oraz listy pytań użytkownika. Nawigacja jest minimalistyczna – górny pasek z logo i opcją wylogowania. Wszystkie pozostałe interakcje (generowanie, zmiana statusu, obsługa błędów) realizowane są w obrębie głównej strony za pomocą komponentów klienckich.

## 2. Lista widoków

### 2.1 Strona powitalna (unauthenticated)
- **Ścieżka:** `/`
- **Główny cel:** Zachęcić użytkownika do logowania przez GitHub.
- **Kluczowe informacje:** Nazwa produktu, krótki tagline, przycisk „Zaloguj z GitHub”.
- **Kluczowe komponenty:** `LandingLayout`, `LoginButton` (shadcn/ui `Button`).
- **UX / dostępność / bezpieczeństwo:** Przyciski z atrybutem `aria-label`; dark-mode; po kliknięciu przekierowanie do Supabase OAuth.

### 2.2 Strona główna (authenticated dashboard)
- **Ścieżka:** `/`
- **Główny cel:** Umożliwić wygenerowanie pięciu pytań oraz zarządzanie listą już wygenerowanych.
- **Kluczowe informacje:** 
  - Sekcja A – formularz treści ogłoszenia (textarea, licznik znaków, `GenerateButton`).
  - Sekcja B – lista „Moje pytania” (pytanie, status practiced).
- **Kluczowe komponenty:** `TopBar`, `JobPostingForm`, `LoadingOverlay`, `QuestionsList`, `QuestionItem`, `PracticeToggle`, `ToastProvider`.
- **UX / dostępność / bezpieczeństwo:** 
  - Spinner blokujący tylko `JobPostingForm` podczas `POST /api/questions/generate`.
  - Po sukcesie płynne przewinięcie do listy i fokus na pierwszym pytaniu.
  - Toggle statusu czeka na wynik `PATCH /api/questions/{id}`; powodzenie oznacza ikonę ASCII „[x]”.
  - Błędy HTTP 4xx/5xx pokazują toast z nagłówkiem i opisem; toast możliwy do zamknięcia.
  - RLS Supabase + `SessionContextProvider` chronią dane.

### 2.3 Strona 404 / Błąd
- **Ścieżka:** `*`
- **Główny cel:** Informować o błędnym adresie.
- **Kluczowe informacje:** Kod błędu, link „Wróć do strony głównej”.
- **Kluczowe komponenty:** `ErrorPage`.
- **UX / dostępność / bezpieczeństwo:** Prosty, spójny styl; link prowadzi do `/`.

## 3. Mapa podróży użytkownika
1. **Wejście na `/` (niezalogowany):** Widzi stronę powitalną → klika „Zaloguj z GitHub”.
2. **OAuth GitHub:** Autoryzacja przez Supabase → redirect back `/` (zalogowany).
3. **Widok główny:** Użytkownik wkleja treść ogłoszenia → klika „Generuj”.
4. **Generowanie:** Formularz pokazuje spinner „Generating questions…” (sekcja A zablokowana) – API `POST /api/questions/generate`.
5. **Sukces:** Odbiór 5 pytań → przewinięcie do sekcji B → fokus na pierwszym pytaniu.
6. **Ćwiczenie:** Użytkownik klika przełącznik practiced przy pytaniu → request `PATCH /api/questions/{id}` → po sukcesie ikona ASCII zmienia kolor.
7. **Błąd (dowolny punkt):** Pojawia się toast destruktywny z opisem i przyciskiem „Zamknij”.
8. **Wylogowanie:** Kliknięcie avatara lub opcji „Wyloguj” w `TopBar` → Supabase `signOut()` → powrót na stronę powitalną.

## 4. Układ i struktura nawigacji
- **`TopBar` (fixed top):** Logo ASCII + po prawej avatar GitHub (menu: „Wyloguj”).
- **Jednopoziomowa nawigacja:** Brak bocznego menu; główny scroll.
- **Sekcje:**
  1. **JobPostingForm** (max-w 720 px, grid `lg:grid-cols-[2fr_3fr]`).
  2. **QuestionsList** (stacked pod formularzem).
- **Responsywność:** Desktop-first; breakpointy Tailwind `lg:` – na mobile sekcje układają się kolumnowo.

## 5. Kluczowe komponenty
- **LandingLayout:** Strona powitalna + CTA logowania.
- **TopBar:** Logo, avatar, przycisk wylogowania.
- **JobPostingForm:** Textarea `@react-hook-form`; walidacja 100-10 000 znaków; `GenerateButton`.
- **LoadingOverlay:** Spinner ASCII + tekst; atrybut `aria-disabled` na formularzu.
- **QuestionsList:** Pobranie `/api/questions` (hook `useQuestions`).
- **QuestionItem:** Pytanie + `PracticeToggle` + data.
- **PracticeToggle:** Checkbox/btn ASCII „[ ]” / „[x]” – zmiana koloru po zatwierdzeniu.
- **ToastProvider:** shadcn/ui toast; typy: success, destructive.
- **ErrorPage:** Uniwersalne 404 / fallback. 