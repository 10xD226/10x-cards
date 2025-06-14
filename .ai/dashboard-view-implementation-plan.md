# Plan implementacji widoku "Dashboard"

## 1. Przegląd
Widok "Dashboard" jest głównym ekranem przeznaczonym dla zalogowanego użytkownika. Umożliwia on wygenerowanie pięciu pytań rekrutacyjnych na podstawie wklejonego ogłoszenia o pracę oraz zarządzanie listą już wygenerowanych pytań (przegląd i oznaczanie jako przećwiczone). Widok odpowiada na wymagania FR-002, FR-003, FR-004, FR-005 oraz user stories US-002 – US-004.

## 2. Routing widoku
- **Ścieżka:** `/`
- **Ochrona:** komponent layoutu z middleware Supabase sprawdza sesję; niezalogowany użytkownik jest przekierowywany do landing page'a.
- **Typ komponentu strony:** Server Component (`src/app/page.tsx`).

## 3. Struktura komponentów
```
DashboardPage (RSC)
 ├─ TopBar (RSC)
 └─ DashboardClient (Client)
     ├─ JobPostingSection
     │   ├─ JobPostingForm
     │   │   └─ GenerateButton
     │   └─ LoadingOverlay
     └─ QuestionsSection
         ├─ QuestionsList
         │   └─ QuestionItem × n
         │       └─ PracticeToggle
         └─ EmptyState / ErrorState
```

## 4. Szczegóły komponentów
### 4.1 TopBar
- **Opis:** Pasek górny z logo i avatarem GitHub. Menu avatara zawiera opcję "Wyloguj".
- **Elementy:** `<header>`, logo (Next.js `<Link>`), `<Avatar>` z shadcn/ui, `<DropdownMenu>`.
- **Interakcje:** `onSignOut` – wywołuje `supabase.auth.signOut()` i `router.refresh()`.
- **Walidacja:** brak.
- **Typy:** `User` (z Supabase), brak własnych.
- **Propsy:** `{ user: User }` (przekazane z layoutu).

### 4.2 DashboardClient
- **Opis:** Otoczka kliencka przechowująca stan formularza i listy pytań.
- **Elementy:** `<section>` x2, kontekst `QuestionsContext`.
- **Interakcje:** renderuje JobPostingSection i QuestionsSection.
- **Walidacja:** brak.
- **Typy:** patrz sekcja 5.
- **Propsy:** `{ initialQuestions: QuestionDto[] }`.

### 4.3 JobPostingForm
- **Opis:** Textarea z licznikiem znaków oraz przyciskiem "Generuj". Używa `react-hook-form`.
- **Elementy:** `<form>`, `<textarea>`, `<span>` counter, `GenerateButton`.
- **Interakcje:** `onSubmit(jobPosting)` → `mutateAsync` (React Query) → POST `/api/questions/generate`.
- **Walidacja:**
  - min 100 / max 10 000 znaków (zgodnie z `GenerateQuestionsSchema`).
  - Required.
- **Typy:** `GenerateQuestionsCommand`.
- **Propsy:** `{ onSuccess: (questions: QuestionDto[]) => void }`.

### 4.4 LoadingOverlay
- **Opis:** Pół-transparentna nakładka z ASCII spinnerem; pojawia się nad JobPostingForm podczas requestu.
- **Elementy:** absolutnie pozycjonowany `<div>`.
- **Interakcje:** sterowane przez stan `isGenerating`.
- **Walidacja:** brak.
- **Typy/Propsy:** `{ visible: boolean }`.

### 4.5 QuestionsList
- **Opis:** Renderuje listę QuestionItem na podstawie stanu `questions` z kontekstu.
- **Elementy:** `<ul>` lub `<div role=list>`.
- **Interakcje:** brak bezpośrednich – przekazuje callback do QuestionItem.
- **Walidacja:** brak.
- **Typy:** `QuestionDto[]`.
- **Propsy:** `{ questions: QuestionDto[] }`.

### 4.6 QuestionItem
- **Opis:** Pojedyncze pytanie z przełącznikiem practiced i datą.
- **Elementy:** `<article>`, treść pytania, `PracticeToggle`.
- **Interakcje:** `onToggle(practiced)`.
- **Walidacja:** brak.
- **Typy:** `QuestionDto`.
- **Propsy:** `{ question: QuestionDto }`.

### 4.7 PracticeToggle
- **Opis:** ASCII checkbox "[ ]" / "[x]" zmieniający status.
- **Elementy:** `<button>`.
- **Interakcje:** `onClick` → PATCH `/api/questions/{id}` → optimistic update.
- **Walidacja:** `practiced` jest booleanem (`UpdateQuestionPracticeStatusSchema`).
- **Typy:** `UpdateQuestionPracticeStatusCommand`.
- **Propsy:** `{ id: string; practiced: boolean }`.

### 4.8 ToastProvider
- **Opis:** Globalny provider z shadcn/ui pokazujący toasty "success" i "destructive".
- **Propsy:** brak.

## 5. Typy
1. **QuestionDto** – import z `src/types.ts`.
2. **GenerateQuestionsCommand** `{ jobPosting: string }`.
3. **GenerateQuestionsResponseDto** `ApiSuccessResponse<QuestionDto[]>`.
4. **UpdateQuestionPracticeStatusCommand** `{ practiced: boolean }`.
5. **UpdateQuestionResponseDto** `ApiSuccessResponse<QuestionDto>`.
6. **QuestionsContextValue**
```ts
interface QuestionsContextValue {
  questions: QuestionDto[]
  setQuestions: React.Dispatch<React.SetStateAction<QuestionDto[]>>
}
```

## 6. Zarządzanie stanem
- **Lokalny kontekst React (QuestionsContext)** przechowuje aktualną listę pytań.
- **React Hook Form** zarządza stanem formularza.
- **React Query** (TanStack Query) obsługuje mutacje `generateQuestions` i `updatePracticeStatus` z optimistic update.
- **URL ani globalny store nie są wymagane**.

## 7. Integracja API
| Akcja | Metoda | Endpoint | Typ żądania | Typ odpowiedzi |
|-------|--------|----------|-------------|----------------|
| Generuj pytania | POST | `/api/questions/generate` | `GenerateQuestionsCommand` | `GenerateQuestionsResponseDto` |
| Pobierz listę | GET | `/api/questions?limit=50&offset=0` | – | `ListQuestionsResponseDto` |
| Update practiced | PATCH | `/api/questions/{id}` | `UpdateQuestionPracticeStatusCommand` | `UpdateQuestionResponseDto` |

## 8. Interakcje użytkownika
1. Użytkownik wkleja tekst → przycisk "Generuj".
2. Podczas requestu wyświetla się `LoadingOverlay`, przycisk disabled.
3. Po sukcesie: toast **success**, przewinięcie do QuestionsList, fokus na pierwszym pytaniu.
4. Kliknięcie `PracticeToggle` zmienia ikonę natychmiast (optimistic) → w tle PATCH.
5. Błąd API → toast **destructive**, stan cofnięty.

## 9. Warunki i walidacja
- **Formularz**: 100 ≤ `jobPosting.length` ≤ 10 000; znaków licznik pokazuje czerwony, gdy < 100 lub > 10 000.
- **Toggle**: `practiced` musi być booleanem; przy wysłaniu innych danych request jest blokowany.
- **Lista pytań** renderowana tylko, gdy `questions.length > 0`.

## 10. Obsługa błędów
- **400/422** z POST → toast z listą błędów walidacji.
- **401** → redirect do landing page + toast.
- **429** → toast "Spróbuj ponownie za chwilę".
- **500** → toast "Coś poszło nie tak".
- Optimistic update cofany przy niepowodzeniu PATCH.

## 11. Kroki implementacji
1. Utwórz kontekst `QuestionsContext` + provider.
2. Zaimplementuj RSC `page.tsx` pobierający wstępną listę pytań (`questionService.listByUser`).
3. Dodaj `TopBar` z avatar-dropdown i obsługą `signOut()`.
4. Stwórz komponent `DashboardClient` (Client Component) ‑ importuje `ToastProvider`.
5. Zaimplementuj `JobPostingForm` z react-hook-form + React Query mutation.
6. Dodaj `LoadingOverlay` sterowany przez `isGenerating`.
7. Po sukcesie aktualizuj kontekst, wywołaj `scrollIntoView`.
8. Zaimplementuj `QuestionsList` + `QuestionItem`.
9. Dodaj `PracticeToggle` z optimistic PATCH i cofaniem przy błędzie.
10. Dodaj walidacje i licznik znaków.
11. Napisz testy jednostkowe dla hooków i komponentów, rozszerz e2e.
12. Dopasuj style Tailwind; zastosuj dark mode.
13. Dokonaj przeglądu pod WCAG, responsywność, SEO.
14. Merge przez PR z CI (lint + test + e2e) na branch `main`. 