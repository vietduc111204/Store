# 🚀 Setup Guide - Deploy to Render & Production

## 📋 Prerequisites

- Node.js 18+ & npm/pnpm
- PostgreSQL Database (or Neon)
- OpenAI API Key
- Render.com account (for deployment)

---

## 🔐 Secret Files (Git Ignored)

These files are **NEVER** committed to Git and contain sensitive credentials:

```
backend/.env          ← Database URL, API Keys, Secrets
frontend/.env         ← (optional) Backend API URL
```

Use the `.example` files as templates to create your local `.env` files.

---

## 🛠️ Local Development Setup

### 1. Backend Setup

```bash
cd backend
cp .env.example .env    # Create local .env from template
```

Edit `backend/.env` and fill in:
- `DATABASE_URL` - Your PostgreSQL connection string
- `ACCESS_TOKEN_SECRET` - Generate random: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `OPENAI_API_KEY` - Get from https://platform.openai.com/account/api-keys

```bash
npm install
npm run dev           # Starts on http://localhost:5001
```

### 2. Frontend Setup

```bash
cd frontend
npm install
pnpm dev             # Starts on http://localhost:5173
```

---

## 🌐 Deploy to Render.com

### Backend Deployment

1. **Push code to GitHub** (with `.env` git-ignored)

2. **Create New Web Service on Render**:
   - Connect your GitHub repo
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables in Render Dashboard**:
   ```
   PORT=5000
   CLIENT_URL=https://your-frontend-url.onrender.com
   DATABASE_URL=postgresql://...   (from Neon)
   ACCESS_TOKEN_SECRET=...         (generate new)
   OPENAI_API_KEY=sk-proj-...
   ```

4. **Set NODE_ENV**: `production`

### Frontend Deployment

1. **Create New Static Site on Render**:
   - Connect your GitHub repo
   - Build Command: `pnpm install && pnpm build`
   - Publish Directory: `dist`

2. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

3. **Update backend `.env`**:
   ```
   CLIENT_URL=https://your-frontend.onrender.com
   ```

---

## 🔑 Important Environment Variables

### Backend

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `ACCESS_TOKEN_SECRET` | JWT signing key | 64-char hex string |
| `OPENAI_API_KEY` | AI advisor feature | `sk-proj-...` |
| `CLIENT_URL` | Frontend URL (CORS) | `https://frontend.onrender.com` |

### Frontend (if needed)

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API endpoint | `https://backend.onrender.com` |

---

## 📝 What's Git-Ignored (Safe to Commit)

✅ Source code, components, configs  
✅ `.env.example` files (templates only)  
✅ `package.json`, `package-lock.json`  
✅ Build files (`dist/`, `build/`)  

❌ `.env` files (actual secrets)  
❌ `node_modules/`  
❌ API keys, tokens, passwords  

---

## 🚨 Security Checklist

Before deploying:

- [ ] `.env` files are in `.gitignore` (never committed)
- [ ] `.env.example` files have NO real secrets
- [ ] Strong `ACCESS_TOKEN_SECRET` generated
- [ ] `OPENAI_API_KEY` has appropriate rate limits
- [ ] `DATABASE_URL` uses SSL connection (`sslmode=require`)
- [ ] `CLIENT_URL` set to actual frontend domain
- [ ] Never hardcode secrets in code

---

## 🆘 Troubleshooting

**Backend won't start:**
- Check `.env` file exists with all required variables
- Verify `DATABASE_URL` is correct
- Check database is accessible

**Frontend can't connect to API:**
- Verify `CLIENT_URL` in backend matches frontend domain
- Check CORS is configured in backend
- Ensure backend is running and accessible

**OpenAI API errors:**
- Verify API key is valid and has credits
- Check rate limits
- Ensure `OPENAI_API_KEY` is set in backend `.env`

---

## 📚 Useful Commands

```bash
# Backend
npm run dev          # Development with auto-reload
npm start            # Production start
npm run migrations   # Run database migrations

# Frontend
pnpm dev            # Development server
pnpm build          # Production build
pnpm preview        # Preview production build
```

---

## 🎉 You're Ready!

Your app is now:
- Protected from credential leaks
- Ready for production deployment
- Scalable with Render.com infrastructure
