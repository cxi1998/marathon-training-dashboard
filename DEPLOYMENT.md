# Deployment Guide: Vercel (Free Tier)

This guide walks you through deploying the Marathon Training Dashboard to Vercel using environment variables for authentication.

## Architecture Overview

**Simplified Single-User Deployment:**
- Backend and Frontend both deployed to Vercel (free tier)
- OAuth tokens obtained locally once and stored as Vercel environment variables
- No session management or database required
- No OAuth flow in production

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Node.js 20+ installed locally
- Strava Developer account with OAuth app configured
- Oura Developer account with OAuth app configured

---

## Step 1: Obtain OAuth Tokens Locally

Before deploying, you need to obtain OAuth tokens from Strava and Oura by running the authentication flow locally.

### 1.1 Update OAuth Redirect URIs

Temporarily update your OAuth app redirect URIs to point to localhost:

**Strava Developer Portal:**
1. Go to https://www.strava.com/settings/api
2. Add Authorization Callback Domain: `localhost`
3. Set Redirect URI to: `http://localhost:3002/auth/strava/callback`

**Oura Developer Portal:**
1. Go to https://cloud.ouraring.com/oauth/applications
2. Add Redirect URI: `http://localhost:3002/auth/oura/callback`

### 1.2 Install Dependencies for Token Script

```bash
cd scripts
npm install
```

### 1.3 Run Token Retrieval Server

```bash
cd scripts
npm run get-tokens
```

This starts a local server on http://localhost:3002

### 1.4 Complete OAuth Flows

1. Open http://localhost:3002 in your browser
2. Click "Connect Strava"
3. Authorize the application
4. Copy the tokens from your terminal:
   ```
   STRAVA_ACCESS_TOKEN=...
   STRAVA_REFRESH_TOKEN=...
   STRAVA_TOKEN_EXPIRES_AT=...
   ```
5. Click "Connect Oura"
6. Authorize the application
7. Copy the tokens from your terminal:
   ```
   OURA_ACCESS_TOKEN=...
   OURA_REFRESH_TOKEN=...
   OURA_TOKEN_EXPIRES_AT=...
   ```

**IMPORTANT:** Save these tokens securely. You'll need them for Vercel environment variables.

### 1.5 Stop the Server

Press `Ctrl+C` to stop the token retrieval server.

---

## Step 2: Push Code to GitHub

```bash
# From project root
git add .
git commit -m "feat: Vercel deployment with environment variable tokens"
git push origin main
```

---

## Step 3: Deploy Backend to Vercel

### 3.1 Create New Project

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Project Name:** `marathon-dashboard-backend` (or your choice)
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3.2 Add Environment Variables

Before deploying, add these environment variables in the Vercel dashboard:

**Required Variables:**

```bash
# Node Environment
NODE_ENV=production

# Frontend URL (will update after frontend deployment)
FRONTEND_URL=http://localhost:5173

# Strava OAuth Credentials
STRAVA_CLIENT_ID=199861
STRAVA_CLIENT_SECRET=fe24464c0d71afe5fce0525a2e31e728f05a9ead

# Strava Tokens (from Step 1)
STRAVA_ACCESS_TOKEN=<paste-from-step-1>
STRAVA_REFRESH_TOKEN=<paste-from-step-1>
STRAVA_TOKEN_EXPIRES_AT=<paste-from-step-1>

# Oura OAuth Credentials
OURA_CLIENT_ID=4e28a8ce-6091-4f13-afa4-d42493d4d8fe
OURA_CLIENT_SECRET=bWUMyYSBZoPYIXio7CP0J3sZc9GsDwoybW3gsaEdIcU

# Oura Tokens (from Step 1)
OURA_ACCESS_TOKEN=<paste-from-step-1>
OURA_REFRESH_TOKEN=<paste-from-step-1>
OURA_TOKEN_EXPIRES_AT=<paste-from-step-1>

# Cache TTL (optional)
CACHE_TTL=3600
```

### 3.3 Deploy

Click "Deploy" and wait for the build to complete.

### 3.4 Note Backend URL

After deployment, copy your backend URL:
```
https://marathon-dashboard-backend-xyz.vercel.app
```

### 3.5 Test Backend Health

```bash
curl https://marathon-dashboard-backend-xyz.vercel.app/health
```

Should return: `{"status":"ok"}`

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Create New Project

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import the **same GitHub repository**
4. Configure project:
   - **Project Name:** `marathon-dashboard-frontend` (or your choice)
   - **Framework Preset:** Vite (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 4.2 Add Environment Variables

Add this single environment variable:

```bash
VITE_API_URL=https://marathon-dashboard-backend-xyz.vercel.app
```

(Replace with your actual backend URL from Step 3.4)

### 4.3 Deploy

Click "Deploy" and wait for the build to complete.

### 4.4 Note Frontend URL

After deployment, copy your frontend URL:
```
https://marathon-dashboard-frontend-xyz.vercel.app
```

---

## Step 5: Update Backend CORS

Now that you have the frontend URL, update the backend environment variables:

1. Go to Vercel Dashboard → Backend Project → Settings → Environment Variables
2. Edit `FRONTEND_URL`
3. Change from `http://localhost:5173` to your frontend URL:
   ```
   FRONTEND_URL=https://marathon-dashboard-frontend-xyz.vercel.app
   ```
4. Save
5. Redeploy backend (or it will auto-redeploy)

---

## Step 6: Update OAuth Redirect URIs (Production)

**OPTIONAL:** If you want to enable OAuth in production later (for multi-user support), update the redirect URIs:

**Strava:**
- Add: `https://marathon-dashboard-backend-xyz.vercel.app/api/auth/strava/callback`

**Oura:**
- Add: `https://marathon-dashboard-backend-xyz.vercel.app/api/auth/oura/callback`

**Note:** For the current single-user deployment, this is NOT needed since tokens come from environment variables.

---

## Step 7: Verify Deployment

### 7.1 Test Dashboard

Visit your frontend URL:
```
https://marathon-dashboard-frontend-xyz.vercel.app
```

You should see:
- Dashboard loads without authentication prompt
- Training data displays (Strava activities)
- Recovery data displays (Oura sleep and readiness)
- Charts render properly
- Date controls work

### 7.2 Check Browser Console

Open Developer Tools → Console. There should be no authentication errors.

### 7.3 Test Date Ranges

- Change the date picker
- Change lookback period (R7, R14, etc.)
- Verify data updates correctly

---

## Troubleshooting

### Dashboard shows no data

**Check:**
1. Tokens are correctly set in backend environment variables
2. Tokens haven't expired (check `STRAVA_TOKEN_EXPIRES_AT` and `OURA_TOKEN_EXPIRES_AT`)
3. Backend health endpoint responds: `curl https://your-backend.vercel.app/health`
4. Browser console for errors

**Solution:** Re-run Step 1 to get fresh tokens and update Vercel env vars.

### CORS errors in browser console

**Error:** `Access-Control-Allow-Origin` error

**Solution:**
1. Verify `FRONTEND_URL` in backend matches your frontend URL exactly
2. No trailing slash in URLs
3. Redeploy backend after changing `FRONTEND_URL`

### Backend deployment fails

**Common issues:**
- Missing environment variables → Add all required variables from Step 3.2
- Build errors → Check Vercel build logs
- TypeScript errors → Run `npm run type-check` locally first

### Tokens expired

**Symptoms:** API calls return 401 errors after several hours

**Solution:**
Strava tokens expire after ~6 hours. To refresh:

**Option 1: Manual refresh**
1. Re-run token retrieval script (Step 1)
2. Update Vercel environment variables
3. Redeploy (or auto-redeploys)

**Option 2: Implement auto-refresh (future enhancement)**
- Modify Strava/Oura services to check `expiresAt`
- Call refresh token API if expired
- This would require updating env vars programmatically (not currently supported)

---

## Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment | `production` |
| `FRONTEND_URL` | Yes | Frontend domain for CORS | `https://your-frontend.vercel.app` |
| `STRAVA_CLIENT_ID` | Yes | From Strava Developer Portal | `199861` |
| `STRAVA_CLIENT_SECRET` | Yes | From Strava Developer Portal | `fe24464c0...` |
| `STRAVA_ACCESS_TOKEN` | Yes | From token retrieval script | `a1b2c3d4...` |
| `STRAVA_REFRESH_TOKEN` | Yes | From token retrieval script | `e5f6g7h8...` |
| `STRAVA_TOKEN_EXPIRES_AT` | Yes | From token retrieval script | `1735689600` |
| `OURA_CLIENT_ID` | Yes | From Oura Developer Portal | `4e28a8ce...` |
| `OURA_CLIENT_SECRET` | Yes | From Oura Developer Portal | `bWUMyYSB...` |
| `OURA_ACCESS_TOKEN` | Yes | From token retrieval script | `i9j0k1l2...` |
| `OURA_REFRESH_TOKEN` | Yes | From token retrieval script | `m3n4o5p6...` |
| `OURA_TOKEN_EXPIRES_AT` | Yes | From token retrieval script | `1735689600` |
| `CACHE_TTL` | No | Cache duration in seconds | `3600` (default) |

### Frontend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | `https://your-backend.vercel.app` |

---

## Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| Vercel (Frontend) | Hobby | $0/month |
| Vercel (Backend) | Hobby | $0/month |
| **Total** | | **$0/month** |

**Vercel Hobby Tier Limits:**
- Bandwidth: 100 GB/month
- Serverless Function Executions: 100 GB-hours/month
- Serverless Function Duration: 10 seconds max
- Build Minutes: 6000 minutes/month

For this single-user dashboard, these limits are more than sufficient.

---

## Future Enhancements

### Make Dashboard Public (Read-Only)

To allow others to view your training data without authentication:

1. No code changes needed!
2. Just share your frontend URL
3. Anyone can see your marathon training progress

### Add Password Protection (Optional)

If you want basic privacy while keeping it simple:

**Backend changes:**
```typescript
// Add to dashboard routes
function checkPassword(req, res, next) {
  const pwd = req.headers['x-password'];
  if (pwd !== process.env.DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  next();
}

router.get('/data', checkPassword, async (req, res) => { ...
```

**Frontend changes:**
- Add password input field
- Send password in headers with API requests

**Vercel env var:**
```
DASHBOARD_PASSWORD=your-secret-password
```

### Automatic Token Refresh

Modify Strava/Oura services to automatically refresh tokens:

```typescript
// In strava.ts
async getActivities(tokens, startDate, endDate) {
  // Check if token expired
  if (Date.now() / 1000 > tokens.expiresAt) {
    console.warn('Token expired - manual refresh needed');
    // Or implement automatic refresh here
  }
  // Continue with API call...
}
```

**Note:** Refreshed tokens would need to be manually updated in Vercel env vars (no way to update programmatically).

---

## Maintenance

### Updating Code

```bash
git add .
git commit -m "feat: Add new feature"
git push origin main
```

Vercel will automatically redeploy both frontend and backend.

### Monitoring

**Vercel Dashboard:**
- View deployment logs
- Monitor function invocations
- Check error rates

**Browser DevTools:**
- Console for frontend errors
- Network tab for API calls

### Token Expiration

**Strava tokens:** Expire after ~6 hours
**Oura tokens:** Vary (typically longer)

When tokens expire:
1. Re-run token retrieval script
2. Update Vercel environment variables
3. Redeploy (or auto-redeploys)

---

## Security Notes

### Token Storage
- Tokens stored as Vercel environment variables (encrypted at rest)
- Never exposed to frontend
- Only accessible to backend serverless functions

### CORS Protection
- Backend only accepts requests from your frontend domain
- Prevents unauthorized access

### Public Access
- Current setup: Anyone with frontend URL can view your training data
- This is intentional for read-only public dashboard
- For privacy, add password protection (see Future Enhancements)

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test backend health endpoint
4. Check browser console for errors
5. Verify tokens haven't expired

For Vercel-specific issues, see: https://vercel.com/docs

---

**Deployment complete!** Your Marathon Training Dashboard is now live on Vercel (100% free).

Frontend: `https://your-frontend.vercel.app`
Backend: `https://your-backend.vercel.app`

Share your frontend URL with anyone to show off your marathon training progress.
