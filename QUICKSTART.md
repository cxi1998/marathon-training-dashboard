# Quick Start Guide

Get the Marathon Training Dashboard running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Strava account with running activities
- Oura ring/account with data

## 1. Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

## 2. Set Up OAuth Apps (2 minutes)

### Strava
1. Visit: https://www.strava.com/settings/api
2. Create app, note Client ID & Secret
3. Set redirect: `http://localhost:3001/api/auth/strava/callback`

### Oura
1. Visit: https://cloud.ouraring.com/oauth/applications
2. Create app, note Client ID & Secret
3. Set redirect: `http://localhost:3001/api/auth/oura/callback`

## 3. Configure Environment Variables (1 minute)

### Backend `.env`
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

Required values:
```env
SESSION_SECRET=any_random_string_here
STRAVA_CLIENT_ID=your_value
STRAVA_CLIENT_SECRET=your_value
OURA_CLIENT_ID=your_value
OURA_CLIENT_SECRET=your_value
```

### Frontend `.env`
```bash
cd frontend
cp .env.example .env
# No edits needed for local dev
```

## 4. Start Servers (30 seconds)

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

## 5. Use the Dashboard!

1. Open: http://localhost:5173
2. Click "Connect Strava" → Authorize
3. Click "Connect Oura" → Authorize
4. View your training data!

## Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill
```

**Auth not working?**
- Double-check Client ID/Secret in `.env`
- Verify redirect URIs match exactly
- Restart backend server after `.env` changes

**No data showing?**
- Ensure you have activities in Strava
- Try a larger lookback period (R28 or R90)
- Check browser console for errors (F12)

## What You'll See

- **Hero KPIs**: Weekly mileage, readiness, sleep, training load
- **Charts**: Training trends over time
- **Tables**: Detailed activity, sleep, and readiness data

For detailed setup and features, see `SETUP.md` and `README.md`.

Happy training! 🏃‍♂️
