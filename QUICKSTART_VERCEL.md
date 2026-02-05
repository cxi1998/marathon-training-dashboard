# Vercel Deployment Quick Start

This is the fastest path to get your dashboard live on Vercel (100% free).

**Time Required:** ~40 minutes
**Monthly Cost:** $0

---

## Prerequisites

- [x] GitHub account
- [x] Vercel account (sign up at vercel.com)
- [x] This code pushed to GitHub
- [x] Strava/Oura developer apps created

---

## Step 1: Get OAuth Tokens (10 minutes)

### 1.1 Update OAuth Redirect URIs

**Strava Developer Portal** (https://www.strava.com/settings/api):
- Authorization Callback Domain: `localhost`
- Redirect URI: `http://localhost:3002/auth/strava/callback`

**Oura Developer Portal** (https://cloud.ouraring.com/oauth/applications):
- Redirect URI: `http://localhost:3002/auth/oura/callback`

### 1.2 Run Token Script

```bash
cd scripts
npm install
npm run get-tokens
```

### 1.3 Complete OAuth Flows

1. Open http://localhost:3002
2. Click "Connect Strava" → Authorize → Copy tokens from terminal
3. Click "Connect Oura" → Authorize → Copy tokens from terminal

**Save these tokens!** You'll paste them into Vercel in Step 3.

### 1.4 Stop the Server

Press `Ctrl+C`

---

## Step 2: Push Code to GitHub (2 minutes)

```bash
git add .
git commit -m "feat: Vercel deployment ready"
git push origin main
```

---

## Step 3: Deploy Backend (10 minutes)

### 3.1 Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository

### 3.2 Configure Backend

- **Root Directory:** `backend`
- **Framework:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 3.3 Add Environment Variables

Click "Environment Variables" and add these 12 variables:

```env
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
STRAVA_CLIENT_ID=199861
STRAVA_CLIENT_SECRET=fe24464c0d71afe5fce0525a2e31e728f05a9ead
STRAVA_ACCESS_TOKEN=<paste-from-step-1>
STRAVA_REFRESH_TOKEN=<paste-from-step-1>
STRAVA_TOKEN_EXPIRES_AT=<paste-from-step-1>
OURA_CLIENT_ID=4e28a8ce-6091-4f13-afa4-d42493d4d8fe
OURA_CLIENT_SECRET=bWUMyYSBZoPYIXio7CP0J3sZc9GsDwoybW3gsaEdIcU
OURA_ACCESS_TOKEN=<paste-from-step-1>
OURA_REFRESH_TOKEN=<paste-from-step-1>
OURA_TOKEN_EXPIRES_AT=<paste-from-step-1>
CACHE_TTL=3600
```

### 3.4 Deploy

Click "Deploy" and wait ~2 minutes.

### 3.5 Save Backend URL

Copy your backend URL (e.g., `https://marathon-backend-abc123.vercel.app`)

---

## Step 4: Deploy Frontend (10 minutes)

### 4.1 Create Another Vercel Project

1. Back to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import the **same** GitHub repository

### 4.2 Configure Frontend

- **Root Directory:** `frontend`
- **Framework:** Vite (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 4.3 Add Environment Variable

Click "Environment Variables" and add:

```env
VITE_API_URL=<your-backend-url-from-step-3.5>
```

Example: `VITE_API_URL=https://marathon-backend-abc123.vercel.app`

### 4.4 Deploy

Click "Deploy" and wait ~2 minutes.

### 4.5 Save Frontend URL

Copy your frontend URL (e.g., `https://marathon-frontend-xyz789.vercel.app`)

---

## Step 5: Update Backend CORS (5 minutes)

### 5.1 Update Environment Variable

1. Go to backend project in Vercel
2. Settings → Environment Variables
3. Edit `FRONTEND_URL`
4. Change to: `https://marathon-frontend-xyz789.vercel.app`
5. Save

### 5.2 Redeploy Backend

Click "Redeploy" or it will auto-redeploy.

---

## Step 6: Test Production (3 minutes)

### 6.1 Open Your Dashboard

Visit your frontend URL: `https://marathon-frontend-xyz789.vercel.app`

### 6.2 Verify Everything Works

- [x] Dashboard loads without auth prompt
- [x] Training data displays (Strava activities)
- [x] Sleep data displays (Oura)
- [x] Readiness scores display (Oura)
- [x] Charts render properly
- [x] Date controls update data
- [x] No errors in browser console

---

## Done! 🎉

Your dashboard is now live at:
**`https://marathon-frontend-xyz789.vercel.app`**

Share this URL with anyone to show your marathon training progress!

---

## Troubleshooting

### Dashboard shows no data

**Check:**
1. Backend health: `curl https://your-backend.vercel.app/health`
2. Tokens in backend environment variables
3. Browser console for errors

**Solution:** Re-run Step 1 to get fresh tokens

### CORS errors

**Error:** "Access-Control-Allow-Origin" in console

**Solution:**
- Verify `FRONTEND_URL` matches frontend URL exactly
- No trailing slashes
- Redeploy backend

### Backend won't deploy

**Check Vercel build logs**

Common issues:
- Missing environment variables
- TypeScript errors
- Wrong root directory

---

## What's Next?

### Make Updates
Just push to GitHub - Vercel auto-deploys:
```bash
git add .
git commit -m "Add new feature"
git push origin main
```

### Refresh Tokens (When They Expire)
1. Re-run `scripts/get-tokens.ts`
2. Update Vercel environment variables
3. Redeploy

### Add Password Protection (Optional)
See DEPLOYMENT.md "Future Enhancements" section

### Share Your Dashboard
Your frontend URL is public - share it with:
- Friends & family
- Running club
- Social media
- Anyone interested in your training!

---

## Need Help?

- **Detailed Guide:** See DEPLOYMENT.md
- **Code Changes:** See VERCEL_DEPLOYMENT_CHANGES.md
- **Token Script:** See scripts/README.md
- **Vercel Docs:** https://vercel.com/docs

---

**Monthly Cost:** $0
**Deployment Time:** ~40 minutes
**Next Token Refresh:** ~6 months from now

Enjoy tracking your marathon training! 🏃‍♂️
