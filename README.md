# Quick Start (TL;DR)

## Installation (5 minutes)

### 1. Get OpenAI API Key
https://platform.openai.com/api-keys → Create new key

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-your-key-here

npm install
npm run dev
```

### 3. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

### 4. Open http://localhost:3000

Done! 🎉

## Testing
1. Enter Chinese name: `王小明`
2. Get English names
3. Ask: "Can you suggest more feminine names?"
4. Edit prompt in right sidebar

## File Structure
```
backend/           ← Node.js + OpenAI API
frontend/          ← React + Vite UI
SETUP.md          ← Detailed setup guide
DEPLOYMENT.md     ← How to deploy to production
REQUIREMENTS.md   ← Original requirements
```

## Key Features
✅ Conversational sessions (multi-turn AI chat)
✅ Customizable AI prompt
✅ Memory-based sessions (configurable timeout)
✅ Easy to deploy (Vercel + Railway)
✅ Beautiful, responsive UI

## Production Deployment
- Frontend → Vercel (free)
- Backend → Railway ($7/month)

See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Need Help?
See [SETUP.md](./SETUP.md) Troubleshooting section
