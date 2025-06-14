# 🧪 Demo Mode - Test without OpenRouter API Key

## Quick Start

### Option 1: Set Demo Mode Environment Variable
```bash
# In your .env.local file
NEXT_PUBLIC_DEMO_MODE=true
# Leave OPENROUTER_API_KEY empty or don't set it
```

### Option 2: Simply Don't Set API Key
If you don't set `OPENROUTER_API_KEY`, the app automatically enters demo mode.

## What Demo Mode Provides

✅ **Realistic mock questions** in English, Polish, and German  
✅ **Simulated API delay** for authentic experience  
✅ **Language detection** based on job posting content  
✅ **All other features work** (auth, database, practice tracking)  
⚠️ **Console shows**: "🚧 AI Service running in DEMO MODE"

## Example Test Flow

1. **Paste a job posting** in any supported language
2. **Get 5 realistic mock questions** like:
   - "Can you walk me through your experience with the technologies mentioned in this role?"
   - "How do you approach problem-solving when facing a challenging technical issue?"
   - "Tell me about a time when you had to learn a new technology quickly."

3. **Practice tracking works** - mark questions as practiced/unpracticed
4. **Questions save to database** normally

## Supported Languages

- **English** (default)
- **Polish** - detects keywords like "praca", "stanowisko", "wymagania"
- **German** - detects keywords like "stelle", "arbeit", "erfahrung"

## Perfect For

- 🎯 **Development and testing**
- 🎯 **Demos and presentations**  
- 🎯 **Understanding app functionality** before getting API keys
- 🎯 **CI/CD pipelines** without real API calls

## Start Application

```bash
npm run dev
```

Visit http://localhost:3000 and start testing with mock questions! 