# Plan implementacji usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter jest kluczowym komponentem aplikacji InterviewPrep, odpowiedzialnym za generowanie pytań rekrutacyjnych na podstawie treści ogłoszenia o pracę. Wykorzystuje OpenRouter API do komunikacji z różnymi modelami AI, zapewniając elastyczność w wyborze modelu i spójność w generowaniu odpowiedzi.

### 1.1 Kluczowe komponenty

1. **OpenRouterClient**
   - Cel: Zarządzanie połączeniem z OpenRouter API
   - Funkcjonalność: Inicjalizacja klienta, zarządzanie kluczem API, podstawowa konfiguracja

2. **QuestionGenerator**
   - Cel: Generowanie pytań rekrutacyjnych
   - Funkcjonalność: Przygotowanie promptów, wywołanie API, walidacja odpowiedzi

3. **LanguageDetector**
   - Cel: Wykrywanie języka ogłoszenia
   - Funkcjonalność: Analiza tekstu, określenie języka, mapowanie na odpowiedni prompt

4. **ResponseValidator**
   - Cel: Walidacja odpowiedzi z API
   - Funkcjonalność: Sprawdzanie struktury JSON, walidacja zawartości, obsługa błędów

## 2. Opis konstruktora

```typescript
class OpenRouterService {
  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || 'openai/gpt-3.5-turbo';
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 30000;
    this.client = this.initializeClient();
  }
}
```

### 2.1 Konfiguracja

```typescript
interface OpenRouterConfig {
  apiKey: string;
  defaultModel?: string;
  maxRetries?: number;
  timeout?: number;
  baseUrl?: string;
}
```

## 3. Publiczne metody i pola

### 3.1 Metody

```typescript
interface OpenRouterService {
  // Główne metody
  generateQuestions(jobPosting: string): Promise<Question[]>;
  detectLanguage(text: string): Promise<Language>;
  
  // Konfiguracja
  setModel(model: string): void;
  setSystemPrompt(prompt: string): void;
  
  // Status
  isDemoMode(): boolean;
  getLastError(): Error | null;
}
```

### 3.2 Przykłady użycia

#### Generowanie pytań
```typescript
const questions = await openRouterService.generateQuestions(jobPosting);
```

#### Wykrywanie języka
```typescript
const language = await openRouterService.detectLanguage(jobPosting);
```

## 4. Prywatne metody i pola

### 4.1 Metody pomocnicze

```typescript
private async makeRequest(endpoint: string, data: any): Promise<any>;
private validateResponse(response: any): void;
private handleError(error: any): never;
private getSystemPrompt(language: Language): string;
```

### 4.2 Pola wewnętrzne

```typescript
private readonly apiKey: string;
private readonly client: OpenRouterClient;
private currentModel: string;
private systemPrompt: string;
private lastError: Error | null;
```

## 5. Obsługa błędów

### 5.1 Scenariusze błędów

1. **Brak klucza API**
   - Kod: `OPENROUTER_API_KEY_MISSING`
   - Rozwiązanie: Przełączenie w tryb demo

2. **Nieprawidłowy klucz API**
   - Kod: `OPENROUTER_API_KEY_INVALID`
   - Rozwiązanie: Zwrócenie błędu 401

3. **Przekroczenie limitu zapytań**
   - Kod: `OPENROUTER_RATE_LIMIT`
   - Rozwiązanie: Implementacja exponential backoff

4. **Błąd walidacji odpowiedzi**
   - Kod: `OPENROUTER_INVALID_RESPONSE`
   - Rozwiązanie: Próba ponownego wygenerowania

5. **Timeout**
   - Kod: `OPENROUTER_TIMEOUT`
   - Rozwiązanie: Retry z zwiększonym timeoutem

### 5.2 Implementacja obsługi błędów

```typescript
class OpenRouterError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}
```

## 6. Kwestie bezpieczeństwa

### 6.1 Ochrona klucza API
- Przechowywanie w zmiennych środowiskowych
- Walidacja na poziomie konstruktora
- Brak logowania w produkcji

### 6.2 Sanityzacja danych
- Walidacja długości promptów
- Escapowanie znaków specjalnych
- Filtrowanie HTML

### 6.3 Rate limiting
- Implementacja na poziomie usługi
- Exponential backoff
- Cache odpowiedzi

## 7. Plan wdrożenia krok po kroku

### 7.1 Przygotowanie środowiska

1. Instalacja zależności
```bash
npm install @openrouter/api
```

2. Konfiguracja zmiennych środowiskowych
```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_DEFAULT_MODEL=openai/gpt-3.5-turbo
```

### 7.2 Implementacja podstawowej struktury

1. Utworzenie pliku `src/lib/openrouter.ts`
2. Implementacja interfejsów i typów
3. Implementacja klasy OpenRouterService

### 7.3 Konfiguracja promptów

1. System prompt
```typescript
const SYSTEM_PROMPT = {
  en: "You are an expert interviewer. Generate 5 interview questions based on the job posting.",
  pl: "Jesteś ekspertem w przeprowadzaniu rozmów kwalifikacyjnych. Wygeneruj 5 pytań na podstawie ogłoszenia o pracę."
};
```

2. Response format
```typescript
const RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'InterviewQuestions',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'string',
            minLength: 20,
            maxLength: 300
          },
          minItems: 5,
          maxItems: 5
        }
      },
      required: ['questions']
    }
  }
};
```

### 7.4 Implementacja metod

1. Inicjalizacja klienta
2. Implementacja generowania pytań
3. Implementacja wykrywania języka
4. Implementacja walidacji odpowiedzi

### 7.5 Testy

1. Testy jednostkowe
2. Testy integracyjne
3. Testy e2e

### 7.6 Dokumentacja

1. JSDoc dla wszystkich metod
2. Przykłady użycia
3. Instrukcje konfiguracji

## 8. Przykłady implementacji

### 8.1 Generowanie pytań

```typescript
async generateQuestions(jobPosting: string): Promise<Question[]> {
  const language = await this.detectLanguage(jobPosting);
  const systemPrompt = this.getSystemPrompt(language);
  
  const response = await this.makeRequest('/v1/chat/completions', {
    model: this.currentModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: jobPosting }
    ],
    response_format: RESPONSE_FORMAT
  });
  
  return this.validateAndTransformResponse(response);
}
```

### 8.2 Wykrywanie języka

```typescript
async detectLanguage(text: string): Promise<Language> {
  const response = await this.makeRequest('/v1/chat/completions', {
    model: this.currentModel,
    messages: [
      { role: 'system', content: 'Detect the language of the following text.' },
      { role: 'user', content: text }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'LanguageDetection',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              enum: ['en', 'pl', 'de']
            }
          },
          required: ['language']
        }
      }
    }
  });
  
  return response.language;
}
```

## 9. Monitoring i logowanie

### 9.1 Metryki
- Liczba zapytań
- Czas odpowiedzi
- Wskaźnik błędów
- Użycie modeli

### 9.2 Logi
- Błędy API
- Walidacja odpowiedzi
- Zmiany konfiguracji
- Przełączenia w tryb demo 