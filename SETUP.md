# Marathon Training Dashboard - Setup Guide

This guide will walk you through setting up the Marathon Training Dashboard from scratch.

## Prerequisites

- Node.js 18+ and npm installed
- A Strava account with some running activities
- An Oura ring and account with sleep/readiness data
- Basic familiarity with terminal/command line

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Set Up OAuth Applications

You need to create OAuth applications for both Strava and Oura to allow the dashboard to access your data.

### Strava OAuth Setup

1. Go to https://www.strava.com/settings/api
2. Click "Create App" or "My API Application"
3. Fill in the application details:
   - **Application Name**: Marathon Training Dashboard
   - **Category**: Training
   - **Club**: Leave blank
   - **Website**: http://localhost:5173 (for development)
   - **Authorization Callback Domain**: localhost
4. Click "Create"
5. Note down your:
   - **Client ID** (a number)
   - **Client Secret** (a long string)

For the Authorization Callback Domain in production, you'll use your deployed backend URL.

### Oura OAuth Setup

1. Go to https://cloud.ouraring.com/oauth/applications
2. Click "Create a New Application"
3. Fill in the application details:
   - **Application Name**: Marathon Training Dashboard
   - **Redirect URI**: http://localhost:3001/api/auth/oura/callback
4. Click "Create Application"
5. Note down your:
   - **Client ID**
   - **Client Secret**

## Step 3: Configure Environment Variables

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` in a text editor and fill in your credentials:
   ```env
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Generate a random string for session secret (e.g., use: openssl rand -base64 32)
   SESSION_SECRET=your_random_session_secret_here

   # Strava credentials from Step 2
   STRAVA_CLIENT_ID=your_strava_client_id
   STRAVA_CLIENT_SECRET=your_strava_client_secret
   STRAVA_REDIRECT_URI=http://localhost:3001/api/auth/strava/callback

   # Oura credentials from Step 2
   OURA_CLIENT_ID=your_oura_client_id
   OURA_CLIENT_SECRET=your_oura_client_secret
   OURA_REDIRECT_URI=http://localhost:3001/api/auth/oura/callback

   # Cache TTL in seconds (3600 = 1 hour)
   CACHE_TTL=3600
   ```

To generate a secure session secret on Mac/Linux:
```bash
openssl rand -base64 32
```

### Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. The default should work for local development:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

## Step 4: Start the Development Servers

You'll need two terminal windows/tabs.

### Terminal 1: Start Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
Marathon Training Dashboard backend running on port 3001
Frontend URL: http://localhost:5173
Environment: development
```

### Terminal 2: Start Frontend Server
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 5: Access the Dashboard

1. Open your browser and go to: http://localhost:5173

2. You should see the "Marathon Training Dashboard" with two buttons:
   - "Connect Strava"
   - "Connect Oura"

3. Click "Connect Strava"
   - You'll be redirected to Strava's authorization page
   - Click "Authorize" to grant access
   - You'll be redirected back to the dashboard
   - You should see "✓ Strava Connected"

4. Click "Connect Oura"
   - You'll be redirected to Oura's authorization page
   - Click "Authorize" to grant access
   - You'll be redirected back to the dashboard
   - You should see "✓ Oura Connected"

5. Once both are connected, the dashboard will load with your data!

## Step 6: Using the Dashboard

### Date Controls
- **End Date**: Select the last day of data you want to see
- **Lookback Period**: Choose how many days back to look
  - R1 = 1 day
  - R7 = 7 days (1 week)
  - R14 = 14 days (2 weeks)
  - R28 = 28 days (4 weeks)
  - R90 = 90 days (~3 months)

### Quick Filters
- **Today**: Shows just today's data
- **This Week**: Shows the last 7 days
- **Last Week**: Shows 7 days ending last week
- **This Month**: Shows the last 28 days

### Hero KPIs
The top section shows 6 key performance indicators:
- Weekly mileage with % change
- Average readiness score with trend
- Average sleep duration and score
- Total training sessions
- Cumulative elevation gain
- Training load

### Charts
- **Training & Recovery Trends**: Shows daily mileage overlaid with readiness scores
- **Sleep Trends**: Shows sleep duration and sleep scores over time

### Data Tables
- **Activities**: All your runs with details
- **Sleep**: Daily sleep data with stages breakdown
- **Readiness**: Daily readiness scores with contributors

## Troubleshooting

### "Failed to connect to Strava/Oura"
- Check that your Client ID and Client Secret are correct in `.env`
- Make sure the redirect URI in your OAuth app matches exactly
- Try restarting the backend server

### Backend won't start
- Check that port 3001 is not already in use
- Make sure all environment variables are set in `.env`
- Run `npm install` again in the backend directory

### Frontend won't start
- Check that port 5173 is not already in use
- Make sure `VITE_API_URL` in frontend `.env` is correct
- Run `npm install` again in the frontend directory

### "No activities found" or "No data"
- Make sure you have activities/sleep data in your Strava/Oura accounts
- Try selecting a larger lookback period (R28 or R90)
- Check that you authorized the correct scopes (activity:read_all for Strava, daily + heartrate for Oura)

### Data is stale/not updating
- The backend caches data for 1 hour by default
- Restart the backend server to clear the cache
- Or wait up to 1 hour for the cache to expire

## Next Steps

- Start training and track your progress!
- Experiment with different date ranges to see trends
- Use the dashboard to correlate training load with recovery
- Plan your training based on readiness scores

## Deploying to Production

See the main README.md for deployment instructions to Vercel (frontend) and Railway/Render (backend).

Key differences for production:
1. Update OAuth redirect URIs to use your production backend URL
2. Set `NODE_ENV=production` in backend
3. Update `FRONTEND_URL` in backend to your production frontend URL
4. Update `VITE_API_URL` in frontend to your production backend URL
5. Use secure session secrets
6. Enable HTTPS

## Support

If you encounter issues:
1. Check the browser console for errors (F12 → Console tab)
2. Check the backend terminal for errors
3. Verify all environment variables are set correctly
4. Make sure OAuth apps are configured correctly
5. Try clearing browser cache and cookies

Enjoy tracking your marathon training!
