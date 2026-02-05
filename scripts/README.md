# OAuth Token Retrieval Script

This script helps you obtain OAuth tokens locally for Vercel deployment.

## Purpose

Since Vercel serverless functions are stateless, we can't use session-based authentication. Instead, we:
1. Run OAuth flows locally once
2. Obtain access and refresh tokens
3. Store tokens as Vercel environment variables
4. Backend reads tokens from `process.env`

## Prerequisites

1. **Update OAuth Redirect URIs** in your developer portals:
   - Strava: `http://localhost:3002/auth/strava/callback`
   - Oura: `http://localhost:3002/auth/oura/callback`

2. **Environment Variables** - Make sure `backend/.env` contains:
   ```
   STRAVA_CLIENT_ID=your-client-id
   STRAVA_CLIENT_SECRET=your-client-secret
   OURA_CLIENT_ID=your-client-id
   OURA_CLIENT_SECRET=your-client-secret
   ```

## Usage

### Step 1: Install Dependencies

```bash
cd scripts
npm install
```

### Step 2: Run Token Retrieval Server

```bash
npm run get-tokens
```

This starts a server on http://localhost:3002

### Step 3: Get Tokens

1. Open http://localhost:3002 in your browser
2. Click "Connect Strava"
3. Authorize the application
4. Copy tokens from your terminal
5. Click "Connect Oura"
6. Authorize the application
7. Copy tokens from your terminal

### Step 4: Save Tokens

You'll receive tokens in this format:

```bash
# Strava
STRAVA_ACCESS_TOKEN=abc123...
STRAVA_REFRESH_TOKEN=xyz789...
STRAVA_TOKEN_EXPIRES_AT=1735689600

# Oura
OURA_ACCESS_TOKEN=def456...
OURA_REFRESH_TOKEN=uvw012...
OURA_TOKEN_EXPIRES_AT=1735689600
```

**Save these securely!** You'll need them for Vercel environment variables.

### Step 5: Stop the Server

Press `Ctrl+C` to stop the server.

### Step 6: Clean Up OAuth Apps

After obtaining tokens, you can:
1. Remove the localhost redirect URIs from your OAuth apps
2. Add production redirect URIs (optional - not needed for env var approach)

## What Happens Next

1. Deploy backend to Vercel
2. Add these tokens as Vercel environment variables
3. Backend reads tokens from `process.env`
4. No OAuth flow needed in production!

## Token Expiration

- **Strava:** Tokens typically expire after ~6 hours
- **Oura:** Expiration varies

When tokens expire, simply re-run this script and update Vercel environment variables.

## Security Notes

- Tokens are stored as Vercel environment variables (encrypted at rest)
- Never committed to git
- Never exposed to frontend
- Only accessible to backend serverless functions

## Troubleshooting

### "Failed to connect to Strava/Oura"

- Verify redirect URIs are exactly: `http://localhost:3002/auth/strava/callback` and `http://localhost:3002/auth/oura/callback`
- Check client ID/secret in `backend/.env`
- Make sure OAuth apps are not in "Sandbox" mode (if applicable)

### "No authorization code received"

- Check browser URL for `?code=...` parameter
- Verify you clicked "Authorize" in the OAuth dialog
- Try closing and reopening the browser

### Environment variable not found

- Make sure `backend/.env` exists
- Check that variables are named exactly as shown in Prerequisites
- Try running from project root: `cd .. && cd scripts && npm run get-tokens`

---

For full deployment instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md)
