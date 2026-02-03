# Marathon Training Dashboard

A web-based dashboard to track marathon training progress by integrating Strava (training data) and Oura (recovery data).

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: OAuth 2.0 for Strava and Oura
- **Visualizations**: Recharts

## Features

### Hero KPIs
- Weekly mileage with % change vs previous week
- Average readiness score with trend indicator
- Average sleep hours with quality score
- Total training sessions
- Cumulative elevation gain
- Training load (sum of suffer scores)

### Time Series Visualizations
- Daily mileage + Readiness score overlay
- Sleep duration and quality score over time
- Heart rate zone distribution
- Weekly training load trend

### Data Tables
- Activities table with sortable columns
- Sleep log with stages breakdown
- Readiness log with HRV and contributors

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Strava API credentials (Client ID & Secret)
- Oura API credentials (Client ID & Secret)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your API credentials to `.env`:
   ```
   STRAVA_CLIENT_ID=your_strava_client_id
   STRAVA_CLIENT_SECRET=your_strava_client_secret
   OURA_CLIENT_ID=your_oura_client_id
   OURA_CLIENT_SECRET=your_oura_client_secret
   SESSION_SECRET=your_random_session_secret
   FRONTEND_URL=http://localhost:5173
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   echo "VITE_API_URL=http://localhost:3001" > .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:5173`

## OAuth Setup

### Strava
1. Go to https://www.strava.com/settings/api
2. Create new API application
3. Set callback URL:
   - Development: `http://localhost:3001/api/auth/strava/callback`
   - Production: `https://your-backend-url/api/auth/strava/callback`

### Oura
1. Go to https://cloud.ouraring.com/oauth/applications
2. Create new application
3. Set callback URL:
   - Development: `http://localhost:3001/api/auth/oura/callback`
   - Production: `https://your-backend-url/api/auth/oura/callback`

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `VITE_API_URL=https://your-backend-url`
4. Deploy

### Backend (Railway/Render)
1. Push code to GitHub
2. Create new service in Railway/Render
3. Set all environment variables from `.env.example`
4. Update callback URLs in Strava/Oura OAuth apps
5. Deploy

## Usage

1. Open the dashboard in your browser
2. Click "Connect Strava" and authorize the application
3. Click "Connect Oura" and authorize the application
4. Select date range using the date controls
5. View your training metrics, charts, and tables

## Development Timeline

- **Phase 1**: Project Setup (2-3 hours) ✓
- **Phase 2**: Authentication (4-6 hours)
- **Phase 3**: Backend API Services (6-8 hours)
- **Phase 4**: Frontend Components (8-10 hours)
- **Phase 5**: Integration & Polish (3-4 hours)
- **Phase 6**: Deployment (2-3 hours)

**Total Estimated Time**: 25-34 hours

## License

MIT
