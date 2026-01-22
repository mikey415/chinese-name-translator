# Setup & Installation Guide

## Project Structure
```
chinese-name-to-english-name/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── server.js       # Main server entry point
│   │   ├── config.js       # Configuration management
│   │   ├── routes/
│   │   │   └── api.js      # API endpoints
│   │   └── services/
│   │       └── llmService.js # OpenAI integration
│   ├── package.json
│   ├── .env.example        # Environment variables template
│   └── .gitignore
│
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx        # React entry point
│   │   ├── App.jsx         # Main app component
│   │   ├── App.css         # Styles
│   │   └── api/
│   │       └── client.js   # API client
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── REQUIREMENTS.md         # Project requirements
└── SETUP.md               # This file
```

## Prerequisites
- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **OpenAI API Key**: Get from https://platform.openai.com/api-keys

## Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key (you won't see it again!)

## Step 2: Backend Setup

### 2.1 Navigate to backend directory
```bash
cd backend
```

### 2.2 Install dependencies
```bash
npm install
```

### 2.3 Create .env file
```bash
# Copy the example
cp .env.example .env

# Edit .env and add your OpenAI API key
# Windows: Open .env with notepad or your editor
```

Edit `backend/.env`:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2.4 Start backend server
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════╗
║  Chinese Name to English Translator - Backend     ║
╚════════════════════════════════════════════════════╝

Server running on: http://localhost:5000
Frontend URL: http://localhost:3000
Environment: development
OpenAI Model: gpt-4o-mini
```

## Step 3: Frontend Setup

Open a **new terminal** and:

### 3.1 Navigate to frontend directory
```bash
cd frontend
```

### 3.2 Install dependencies
```bash
npm install
```

### 3.3 Start development server
```bash
npm run dev
```

You should see:
```
VITE v5.0.2  ready in 234 ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

## Step 4: Test the Application

1. Open http://localhost:3000 in your browser
2. Enter a Chinese name (e.g., 王小明, 李明, 张三)
3. Click "Generate English Name"
4. Wait for AI response (5-10 seconds)
5. Try follow-up questions like:
   - "Can you suggest more feminine names?"
   - "Make them shorter"
   - "More formal/professional options"
   - "Focus on meaning rather than phonetics"

## Troubleshooting

### Error: "OPENAI_API_KEY is not set"
- Check that `.env` file exists in the `backend/` directory
- Verify your API key is correctly copied (starts with `sk-`)
- Restart the backend server after creating/updating `.env`

### Error: "Cannot POST /api/sessions"
- Make sure backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in `.env` matches where frontend is running

### API Returns Error: "Invalid API Key"
- Your OpenAI API key is incorrect or expired
- Generate a new key from https://platform.openai.com/api-keys
- Update `.env` and restart backend

### Slow Response Time
- First request is often slower (cold start)
- Subsequent requests should be faster (2-5 seconds)
- If consistently slow (> 10s), check OpenAI API status

### Frontend Not Connecting to Backend
- Check that backend runs on port 5000
- Check that frontend runs on port 3000
- Look for CORS errors in browser console
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL

## Backend API Endpoints

### 1. Start a New Session
```
POST /api/sessions
Body: { "chineseName": "王小明" }
Response: { "sessionId": "uuid", "primary": {...}, "alternatives": [...] }
```

### 2. Continue Conversation
```
POST /api/sessions/:sessionId/messages
Body: { "message": "Can you suggest more feminine names?" }
Response: { "sessionId": "uuid", "chineseName": "王小明", "response": "..." }
```

### 3. Get Session Info
```
GET /api/sessions/:sessionId
Response: { "sessionId": "uuid", "chineseName": "王小明", "turnCount": 3, ... }
```

### 4. Clear Session
```
DELETE /api/sessions/:sessionId
Response: { "success": true, "message": "Session cleared successfully" }
```

### 5. Get Current Prompt
```
GET /api/prompt
Response: { "success": true, "data": { "prompt": "..." } }
```

### 6. Update Prompt
```
POST /api/prompt
Body: { "prompt": "Your custom prompt here..." }
Response: { "success": true, "data": { "prompt": "..." } }
```

### 7. Health Check
```
GET /api/health
Response: { "status": "ok", "timestamp": "2024-01-22T..." }
```

## Configuration

### Changing OpenAI Model
Edit `backend/.env`:
```
# Options:
# - gpt-4 (most capable, more expensive)
# - gpt-4o (multimodal, good balance)
# - gpt-4o-mini (cheapest, fast)
# - gpt-3.5-turbo (legacy, not recommended)

OPENAI_MODEL=gpt-4o-mini
```

### Customizing the Prompt
1. Open http://localhost:3000
2. Click "⚙️ Edit Prompt" on the right sidebar
3. Modify the prompt template
4. Click "Save Prompt"
5. The new prompt will be used for future requests

### Adjusting Session Timeout
Edit `backend/.env`:
```
SESSION_TIMEOUT_MINUTES=30  # Sessions expire after 30 minutes
MAX_CONVERSATION_TURNS=20   # Max 20 turns per session
```

## Deployment

### Frontend Deployment (Vercel - FREE)
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repo
5. Deploy (automatic)

### Backend Deployment (Railway - $7/month)
1. Go to https://railway.app
2. Create new project
3. Connect GitHub repo
4. Set environment variables:
   - `OPENAI_API_KEY`
   - `FRONTEND_URL` (your Vercel domain)
5. Deploy (automatic)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Development Tips

### Hot Reloading
- **Frontend**: Vite automatically reloads when you save files
- **Backend**: Nodemon restarts server when files change

### Debugging Backend
Add `console.log()` statements in backend code. Logs appear in terminal.

### Debugging Frontend
Use browser DevTools:
- `F12` → Console tab to see errors
- `F12` → Network tab to inspect API calls

### Testing with cURL
```bash
# Start a session
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"chineseName":"王小明"}'

# Check health
curl http://localhost:5000/api/health
```

## Next Steps

- [ ] Get OpenAI API key
- [ ] Set up and run backend
- [ ] Set up and run frontend
- [ ] Test with a Chinese name
- [ ] Customize the prompt
- [ ] Deploy to production
- [ ] (Optional) Add database for saving history
- [ ] (Optional) Build admin panel

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review your `.env` files
3. Check that both servers are running
4. Look at console/terminal output for error messages
5. Verify OpenAI API key is valid and has credits
