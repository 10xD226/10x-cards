# GitHub OAuth App Setup for InterviewPrep

## Kroki konfiguracji:

### 1. Utwórz GitHub OAuth App
1. Idź do https://github.com/settings/developers
2. Kliknij "New OAuth App"
3. Wypełnij formularz:
   - **Application name**: `InterviewPrep Local Development`
   - **Homepage URL**: `http://localhost:3001`
   - **Application description**: `Local development for InterviewPrep - AI-powered interview preparation tool`
   - **Authorization callback URL**: `http://127.0.0.1:54321/auth/v1/callback`

### 2. Skopiuj kredencjały
Po utworzeniu aplikacji skopiuj:
- **Client ID**
- **Client Secret** (kliknij "Generate a new client secret")

### 3. Zaktualizuj .env.local
Otwórz plik `.env.local` i zamień placeholdery:

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=twoj_github_client_id_tutaj
GITHUB_CLIENT_SECRET=twoj_github_client_secret_tutaj
```

### 4. Restart Supabase
```bash
supabase start
```

### 5. Restart Next.js
```bash
npm run dev
```

## Callback URL dla różnych środowisk:

- **Local Development**: `http://127.0.0.1:54321/auth/v1/callback`
- **Production**: `https://twoja-domena.com/auth/callback`

## Troubleshooting:

### Błąd: "redirect_uri_mismatch"
- Sprawdź czy Authorization callback URL w GitHub App jest dokładnie: `http://127.0.0.1:54321/auth/v1/callback`
- Upewnij się że Supabase działa na porcie 54321

### Błąd: "Application suspended"
- Sprawdź czy GitHub OAuth App nie jest zawieszona
- Sprawdź czy kredencjały w .env.local są poprawne

### Logowanie nie działa
- Sprawdź konsole przeglądarki pod kątem błędów JavaScript
- Sprawdź logi Supabase: `supabase logs`
- Upewnij się że zmienne środowiskowe są załadowane (restart dev server) 