# Test Suite Documentation

## Overview

This test suite implements comprehensive testing for the InterviewPrep application, covering both unit tests and end-to-end tests according to the requirements in `prd-interview.md` and `test-plan-gemini.md`.

## Test Structure

```
tests/
├── e2e/                           # End-to-end tests (Playwright)
│   ├── complete-interview-flow.spec.ts  # Main FR-007 test
│   ├── error-scenarios.spec.ts          # Error handling (FR-009)
│   ├── interview-flow.test.ts           # Legacy test
│   └── basic-flow.test.ts               # Basic functionality
├── pages/                         # Page Object Model
│   └── HomePage.ts                # Main page interactions
├── fixtures/                      # Test data
│   └── test-data.ts               # Mock data and fixtures
├── helpers/                       # Test utilities
│   └── api-mocks.ts               # API mocking helpers
├── global-setup.ts                # Global test setup
├── global-teardown.ts             # Global test cleanup
└── README.md                      # This file
```

## Test Categories

### 1. Complete Interview Flow (FR-007)
**File:** `complete-interview-flow.spec.ts`

Tests the main user journey as specified in PRD:
- ✅ Authentication (mock session)
- ✅ Generate 5 interview questions
- ✅ Toggle practice status
- ✅ Data persistence verification
- ✅ Performance thresholds (<15 seconds)

### 2. Error Handling (FR-009)
**File:** `error-scenarios.spec.ts`

Tests error scenarios and edge cases:
- ✅ API errors (500, 429, 401)
- ✅ Loading states and slow responses
- ✅ Form validation edge cases
- ✅ Network failures
- ✅ Race conditions

### 3. API Integration
Tests backend validation and API contracts:
- ✅ Correct API calls with proper payloads
- ✅ Response handling
- ✅ Error propagation

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Ensure Playwright browsers are installed
npx playwright install
```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test complete-interview-flow.spec.ts

# Run specific test with title filter
npx playwright test --grep "should complete full interview preparation workflow"

# Run all tests (unit + e2e)
npm run test:all
```

### Debugging Tests

```bash
# Run with debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report

# Record new tests
npx playwright codegen localhost:3000
```

## Test Design Principles

### 1. Page Object Model (POM)
- Encapsulates page interactions in `HomePage` class
- Provides reusable methods for common actions
- Maintains resilient locators using semantic selectors

### 2. Test Isolation
- Each test uses mock login session
- API calls are mocked for predictable results
- Tests can run in parallel without conflicts

### 3. Realistic Test Data
- Job postings meet character requirements (100-10000 chars)
- Mock questions in Polish to match application language
- Covers various content types (special chars, emoji)

### 4. Error Handling
- Tests graceful degradation scenarios
- Verifies user-friendly error messages
- Covers network failures and timeouts

### 5. Performance Considerations
- Optimized timeouts for CI/CD reliability
- Parallel assertions where possible
- Performance measurement for critical workflows

## Mock Strategy

### API Mocking
- Uses Playwright's `page.route()` for API interception
- Simulates realistic delays and responses
- Covers both success and error scenarios

### Session Mocking
- Bypasses GitHub OAuth for test speed
- Uses localStorage to mock Supabase session
- Maintains consistent user state across tests

## CI/CD Integration

### GitHub Actions
Tests are configured to run in CI/CD pipeline:
- Runs on push to any branch
- Blocks merge on test failures
- Generates test reports and artifacts

### Configuration
```yaml
# .github/workflows/test.yml
- name: Run E2E tests
  run: npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Check if dev server is running
   - Verify API mocks are properly set up
   - Increase timeout values in playwright.config.ts

2. **Flaky tests**
   - Use `page.waitForLoadState('networkidle')`
   - Add explicit waits for dynamic content
   - Check for race conditions in test logic

3. **Mock not working**
   - Verify route patterns match actual API calls
   - Clear previous mocks with `apiMocks.clearAllMocks()`
   - Check network tab in browser dev tools

### Debug Steps

1. Run test with `--headed` flag to see browser
2. Add `await page.pause()` to inspect state
3. Use `--debug` flag for step-by-step execution
4. Check test artifacts in `test-results/` folder

## Test Coverage

The test suite covers:
- ✅ All functional requirements (FR-001 to FR-009)
- ✅ All user stories (US-001 to US-005)
- ✅ Happy path scenarios
- ✅ Error handling and edge cases
- ✅ Performance requirements
- ✅ API integration

## Performance Metrics

Target performance thresholds:
- Complete workflow: < 15 seconds
- Question generation: < 10 seconds
- Practice toggle: < 2 seconds

## Maintenance

### Adding New Tests
1. Create test file in appropriate directory
2. Use existing Page Object Model classes
3. Follow naming convention: `feature-name.spec.ts`
4. Add test to CI/CD pipeline if needed

### Updating Test Data
1. Modify fixtures in `test-data.ts`
2. Ensure data meets validation requirements
3. Update related tests if needed

### Updating Page Objects
1. Add new methods to appropriate page class
2. Use resilient locators (data-testid, semantic selectors)
3. Document new methods with JSDoc comments

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