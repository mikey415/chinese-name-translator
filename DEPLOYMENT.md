# Deployment Guide

## Overview
This guide covers how to deploy the Chinese Name Translator to production.

## Technology Recommendations

For **easiest deployment & maintenance**:
- **Frontend**: Vercel (free)
- **Backend**: Railway or Render ($7-15/month)

## Frontend Deployment (Vercel)

Vercel is the best for React/Vite apps. It's free and automatic.

### Prerequisites
- GitHub account with your code pushed
- Vercel account (free, sign in with GitHub)

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Go to Vercel**
   - Visit https://vercel.com
   - Click "New Project"
   - Select your GitHub repo
   - Vercel auto-detects it's a Vite project
   - Click "Deploy"

3. **That's it!** Your frontend is live at `https://your-project.vercel.app`

### Update Deployment
Every time you push to GitHub, Vercel automatically redeploys.

## Backend Deployment (Railway)

Railway is simple, affordable, and has generous free tier.

### Prerequisites
- GitHub account with your code
- Railway account (free, sign in with GitHub)

### Steps

1. **Go to Railway**
   - Visit https://railway.app
   - Sign in with GitHub
   - Click "New Project"

2. **Deploy from GitHub**
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Railway detects Node.js project automatically

3. **Set Environment Variables**
   - In Railway dashboard, go to "Variables"
   - Add these:
     ```
     OPENAI_API_KEY=sk-your-key-here
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend.vercel.app
     OPENAI_MODEL=gpt-4o-mini
     ```

4. **Deploy**
   - Click "Deploy"
   - Railway generates URL: `https://your-backend-1234567890.railway.app`

### Update Deployment
Push to GitHub → Railway auto-redeploys.

## Frontend Configuration

Update the frontend to use production backend:

### Option 1: Create `.env.production` (Recommended)
Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend.railway.app/api
```

### Option 2: Configure in Vercel UI
In Vercel dashboard → Settings → Environment Variables:
```
VITE_API_URL=https://your-backend.railway.app/api
```

## Alternative: Backend Deployment (Render)

If you prefer Render over Railway:

### Steps
1. Go to https://render.com
2. Create account, sign in with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Set:
   - **Name**: `chinese-name-translator-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add same as Railway

6. Deploy

Render is similar to Railway, slightly different pricing.

## Alternative: Backend Deployment (Heroku)

Heroku removed free tier, but still works for small projects.

Similar steps as Railway/Render.

## Testing Production Deployment

After deploying both frontend and backend:

1. Open your Vercel frontend URL
2. Try entering a Chinese name
3. Should work end-to-end
4. Check browser console for errors
5. Check backend logs in Railway/Render dashboard

## Production Checklist

Before going live:
- [ ] OpenAI API key is valid and has credits
- [ ] Backend environment variables are set correctly
- [ ] Frontend environment variable points to production backend
- [ ] CORS is configured correctly (FRONTEND_URL in backend)
- [ ] Test at least 3 Chinese names
- [ ] Test follow-up conversation
- [ ] Check error messages are user-friendly
- [ ] Monitor API costs (watch OpenAI billing)

## Cost Considerations

### OpenAI API Costs
- **gpt-4o-mini**: ~$0.00015 per token
- **gpt-4o**: ~$0.0015 per token
- Typical request: ~1000 tokens = $0.00015-0.0015 per translation
- Budget: $5-10/month for reasonable usage

### Hosting Costs
- **Vercel**: Free for frontend
- **Railway**: Free tier (up to $5 credits), then pay-as-you-go
- **Render**: Free tier (sleeps after inactivity), $7+/month for guaranteed uptime

### Total Monthly Cost
- With free tiers: $5-10 for OpenAI only
- With paid hosting: $15-30 total

## Monitoring & Logs

### Vercel Logs
- Dashboard → Your Project → Deployments
- Click recent deployment → Logs

### Railway Logs
- Dashboard → Your Project
- Click "Logs" tab
- Real-time server logs

### Checking API Health
```bash
curl https://your-backend.railway.app/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Troubleshooting Production

### 504 Gateway Timeout
- Backend might be starting (cold start)
- Check backend logs in Railway/Render
- Might need to upgrade tier for better performance

### CORS Error
- Frontend URL not in backend `FRONTEND_URL` environment variable
- Update in Railway/Render dashboard
- Restart backend

### OpenAI API Error
- API key invalid or expired
- Generate new key at https://platform.openai.com/api-keys
- Update in environment variables
- Restart backend

### Slow Responses
- First request is slow (cold start)
- Normal first response: 5-10 seconds
- Use paid tier for instant responses

## Advanced: Auto-Deploy on Push

Both Vercel and Railway auto-deploy when you push to GitHub (default behavior).

To disable:
- Vercel: Settings → Git → Uncheck "Deploy on every push"
- Railway: Settings → Deployments → Disable auto-deploy

## Custom Domain

### Vercel
1. Domain → Add Domain
2. Configure DNS (easy step-by-step)
3. Free with SSL certificate

### Railway
1. Project Settings → Domain
2. Add custom domain
3. Configure DNS

See their docs for detailed steps.

## Database (Optional for Future)

Currently, the app stores sessions in memory. For persistence:

### Option 1: Railway PostgreSQL Add-on
1. Railway dashboard → Add database
2. Select PostgreSQL
3. Railway auto-configures connection string

### Option 2: Supabase (Free PostgreSQL)
1. Go to https://supabase.com
2. Create project
3. Get connection string
4. Modify backend code to use database

See code comments in [backend/src/services/llmService.js](./backend/src/services/llmService.js) for database integration points.

## Summary

**Fastest deployment path:**
1. Push code to GitHub
2. Deploy frontend to Vercel (1 click)
3. Deploy backend to Railway (1 click)
4. Update environment variables
5. Done!

**Total time**: ~15 minutes
**Total cost**: $5-30/month (mostly OpenAI)
**Maintenance**: Minimal (auto-deploys on git push)
