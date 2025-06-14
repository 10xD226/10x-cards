# Testing Environment

Środowisko testowe dla InterviewPrep zgodne z `tech-stack.md` i `test-rules`.

## 🧪 Technologie

- **Unit Tests**: Vitest (zamiast Jest)
- **E2E Tests**: Playwright (tylko Chromium)
- **UI Testing**: @testing-library/react + jsdom

## 📁 Struktura

```
tests/
├── e2e/                     # Testy E2E Playwright
│   ├── interview-flow.test.ts
│   └── basic-flow.test.ts
├── pages/                   # Page Object Model
│   └── HomePage.ts
├── global-setup.ts          # Setup hook
├── global-teardown.ts       # Teardown hook
└── README.md

src/lib/__tests__/           # Testy jednostkowe
├── demo-vitest.test.ts      # Demo best practices
├── openai.test.ts
├── openrouter.service.test.ts
└── openrouter-adapter.test.ts
```

## 🚀 Komendy

### Unit Tests (Vitest)
```bash
# Uruchom testy jednostkowe
npm run test

# Watch mode (dla development)
npm run test:watch

# UI mode (wizualna nawigacja)
npm run test:ui

# Coverage report
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
# Uruchom testy E2E
npm run test:e2e

# Tryb headed (z interfejem)
npm run test:e2e:headed

# UI mode (debugowanie)
npm run test:e2e:ui

# Wszystkie testy
npm run test:all
```

## ⚙️ Konfiguracja

### Vitest (`vitest.config.ts`)
- **jsdom** dla testów DOM
- **TypeScript** type checking
- **Coverage** z progami 70%
- **Path aliasing** (`@/`)

### Playwright (`playwright.config.ts`)
- **Tylko Chromium** (zgodnie z guidelines)
- **Trace viewer** do debugowania
- **Visual regression** screenshots
- **Global setup/teardown**

## 🎯 Best Practices

### Unit Tests
- ✅ **vi object** dla mocków (`vi.fn()`, `vi.spyOn()`, `vi.stubGlobal()`)
- ✅ **Inline snapshots** zamiast equality checks
- ✅ **Arrange-Act-Assert** pattern
- ✅ **TypeScript** type checking w testach
- ✅ **Explicit assertion messages**

### E2E Tests
- ✅ **Page Object Model** dla maintainability
- ✅ **Resilient locators** (`getByRole`, `getByTestId`)
- ✅ **Browser contexts** dla izolacji
- ✅ **Visual comparison** (`toHaveScreenshot()`)
- ✅ **API testing** dla backend validation

## 🔧 Hooks

### Global Setup (`tests/global-setup.ts`)
- Weryfikacja połączenia z aplikacją
- Setup środowiska testowego

### Global Teardown (`tests/global-teardown.ts`)
- Cleanup po testach

### Test Setup (`src/test-setup.ts`)
- Konfiguracja zmiennych środowiskowych
- Global mocks z `vi.stubGlobal()`

## 📊 Coverage

Coverage konfigurowany w `vitest.config.ts`:
- **Threshold**: 70% (branches, functions, lines, statements)
- **Include**: `src/**/*.{ts,tsx}`
- **Exclude**: `src/db/**`, `src/types.ts`

## 🐛 Debugowanie

### Vitest
```bash
# Watch mode z UI
npm run test:ui

# Debug pojedynczy test
npx vitest run specific-test.test.ts
```

### Playwright
```bash
# Trace viewer
npm run test:e2e:headed

# Codegen (nagrywanie testów)
npx playwright codegen localhost:3000
```

## 🚧 Migracja z Jest

Jest został zastąpiony przez Vitest:
- ❌ `jest.config.js` - usunięty
- ✅ `vitest.config.ts` - nowy
- ✅ `vi` object zamiast `jest`
- ✅ Compatibility z ecosystem Jest 