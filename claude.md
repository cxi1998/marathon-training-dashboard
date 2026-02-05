# Marathon Training Dashboard - Technical Documentation
I am a product manager with limited coding experience who is looking to learn and become more technical. When coding and doing your work, please share tips that explain the tech architecture and any changes that you’re making and why.

## Overview
A full-stack web application for tracking marathon training progress by integrating Strava (training data) and Oura (recovery data). Built with React/TypeScript frontend and Node.js/Express backend.

**Purpose**: Track and visualize training metrics, recovery data, and correlate training load with readiness scores for NYC Marathon 2026.

## Architecture

### System Design
```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   React Frontend│◄───────►│  Express Backend │◄───────►│ Strava API  │
│   (Port 5173)   │         │   (Port 3001)    │         └─────────────┘
│                 │  HTTP   │                  │  OAuth
│  - Dashboard    │  +CORS  │  - OAuth Handler │         ┌─────────────┐
│  - Auth UI      │         │  - Data Aggreg.  │◄───────►│  Oura API   │
│  - Charts       │         │  - Cache Layer   │         └─────────────┘
│  - Tables       │         │  - Session Mgmt  │
└─────────────────┘         └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Node-Cache      │
                            │  (In-Memory)     │
                            │  TTL: 1 hour     │
                            └──────────────────┘
```

### Technology Stack

**Frontend:**
- React 18.3 with TypeScript 5.9
- Vite 7.2 (build tool & dev server)
- Recharts 2.10 (data visualization)
- Axios 1.6 (HTTP client)
- date-fns 3.0 (date utilities)

**Backend:**
- Node.js 20+ with Express 4.18
- TypeScript 5.3
- express-session 1.17 (session management)
- node-cache 5.1 (in-memory caching)
- axios 1.6 (API calls)
- cors 2.8 (CORS handling)

## Project Structure

```
Marathon Training Dashboard/
├── backend/                           # Express API server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts               # OAuth routes (Strava, Oura)
│   │   │   └── dashboard.ts          # Dashboard data routes
│   │   ├── services/
│   │   │   ├── strava.ts             # Strava API integration
│   │   │   ├── oura.ts               # Oura API integration
│   │   │   └── cache.ts              # Caching service
│   │   ├── utils/
│   │   │   └── dataAggregation.ts    # Data processing utilities
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript type definitions
│   │   └── server.ts                 # Express server setup
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                          # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx         # Main dashboard container
│   │   │   ├── DateControls.tsx      # Date picker & filters
│   │   │   ├── HeroKPIs.tsx          # KPI cards
│   │   │   ├── TimeSeriesChart.tsx   # Recharts visualizations
│   │   │   ├── ActivityTable.tsx     # Strava activities
│   │   │   ├── SleepTable.tsx        # Oura sleep data
│   │   │   ├── ReadinessTable.tsx    # Oura readiness
│   │   │   └── *.css                 # Component styles
│   │   ├── services/
│   │   │   └── api.ts                # Backend API client
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript types
│   │   ├── App.tsx                   # Root component
│   │   ├── App.css
│   │   ├── main.tsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
└── [documentation files]
```

---

## Backend Architecture

### Server Setup (server.ts)

**Express Application:**
```typescript
- Port: 3001 (configurable via PORT env var)
- CORS: Enabled for frontend origin (http://localhost:5173)
- Session middleware: express-session with in-memory store
- Body parsing: JSON and URL-encoded
```

**Key Configuration:**
- Session secret from environment variable
- Cookie settings: httpOnly, secure in production
- Session TTL: 7 days
- Health check endpoint: GET /health

### Authentication System (routes/auth.ts)

**OAuth 2.0 Flow Implementation:**

1. **Initiate OAuth**
   - `GET /api/auth/strava` - Returns Strava authorization URL
   - `GET /api/auth/oura` - Returns Oura authorization URL
   - Generates random state token for CSRF protection
   - Stores state in session

2. **OAuth Callback**
   - `GET /api/auth/strava/callback?code=...&state=...`
   - `GET /api/auth/oura/callback?code=...&state=...`
   - Validates state parameter
   - Exchanges authorization code for access/refresh tokens
   - Stores tokens in session
   - Redirects to frontend with success/error status

3. **Session Management**
   - `GET /api/auth/status` - Returns connection status
   - `POST /api/auth/logout` - Destroys session

**Security Features:**
- State parameter prevents CSRF attacks
- Tokens stored server-side only (never exposed to client)
- HttpOnly session cookies
- CORS restricted to specific origin

### Strava Service (services/strava.ts)

**Purpose**: Interface with Strava API v3

**Key Methods:**

```typescript
exchangeToken(code: string): Promise<TokenData>
  - Exchanges OAuth code for tokens
  - Returns: { accessToken, refreshToken, expiresAt }

refreshToken(refreshToken: string): Promise<TokenData>
  - Refreshes expired access token
  - Called automatically when token expires

getActivities(tokens, startDate, endDate): Promise<StravaActivity[]>
  - Fetches activities in date range
  - Handles pagination (200 per page)
  - Filters for running activities only (Run, TrailRun)
  - Caches results for 1 hour

getAthlete(tokens): Promise<{id, username}>
  - Fetches athlete profile
  - Used for stats API calls

getAuthorizationURL(state): string
  - Builds OAuth authorization URL
  - Scopes: activity:read_all
```

**Caching Strategy:**
- Cache key format: `strava:activities:start={ISO}&end={ISO}`
- TTL: 3600 seconds (1 hour)
- Reduces API calls and improves response time

### Oura Service (services/oura.ts)

**Purpose**: Interface with Oura API v2

**Key Methods:**

```typescript
exchangeToken(code: string): Promise<TokenData>
  - OAuth token exchange

getSleepData(tokens, startDate, endDate): Promise<OuraSleep[]>
  - Fetches daily sleep data
  - Endpoint: /v2/usercollection/daily_sleep
  - Returns: duration, stages, efficiency, score, HRV

getReadinessData(tokens, startDate, endDate): Promise<OuraReadiness[]>
  - Fetches daily readiness data
  - Endpoint: /v2/usercollection/daily_readiness
  - Returns: score, contributors (HRV, sleep, activity balance)

getHeartRateData(tokens, startDate, endDate): Promise<OuraHeartRate[]>
  - Fetches time-series heart rate (5-min intervals)
  - Endpoint: /v2/usercollection/heartrate
```

**Rate Limiting:**
- Oura limit: 5,000 requests per 5 minutes
- Caching mitigates rate limit concerns

### Cache Service (services/cache.ts)

**Implementation**: node-cache wrapper

**Features:**
```typescript
get<T>(key: string): T | undefined
set<T>(key, value, ttl?): boolean
has(key: string): boolean
del(key: string): number
flush(): void
generateKey(prefix, params): string
```

**Cache Key Generation:**
- Format: `{prefix}:{param1}={value1}&{param2}={value2}`
- Sorted parameters for consistent keys
- Example: `oura:sleep:start=2024-01-01T00:00:00.000Z&end=2024-01-07T00:00:00.000Z`

### Data Aggregation (utils/dataAggregation.ts)

**Purpose**: Transform raw API data into dashboard-ready format

**Key Functions:**

```typescript
metersToMiles(meters: number): number
  - Conversion factor: 0.000621371

secondsToMinutes(seconds: number): number
  - Simple division by 60

calculatePace(distanceMeters, timeSeconds): number
  - Returns minutes per mile
  - Formula: (time / 60) / (distance * 0.000621371)

aggregateDashboardData(activities, sleep, readiness, startDate, endDate, lookback): DashboardData
  - Main aggregation function
  - Computes KPIs, time series, and summaries
```

**KPI Calculations:**

1. **Weekly Mileage**: Sum of all activity distances
2. **Weekly Mileage Change**: ((current - previous) / previous) * 100
3. **Average Readiness**: Mean of all readiness scores
4. **Readiness Trend**: Compare recent 3 days to earlier days (up/down/stable)
5. **Average Sleep Duration**: Mean of total_sleep_duration in hours
6. **Average Sleep Score**: Mean of sleep scores
7. **Training Load**: Sum of suffer_score from all activities
8. **Elevation Gain**: Sum converted to feet (meters * 3.28084)

**Time Series Generation:**
- Creates entry for each date in range
- Aggregates activities by date (sum mileage)
- Joins with sleep/readiness data by date
- Fills missing values with null
- Sorts by date ascending

### Dashboard Routes (routes/dashboard.ts)

**Middleware**: `requireAuth` - Checks session for tokens

**Endpoints:**

```typescript
GET /api/dashboard/data?date=YYYY-MM-DD&lookback=7
  - Main dashboard endpoint
  - Fetches activities, sleep, readiness in parallel
  - Aggregates data using dataAggregation utility
  - Returns: DashboardData object

GET /api/dashboard/activities?startDate=...&endDate=...
  - Raw activities endpoint
  - Returns: StravaActivity[]

GET /api/dashboard/sleep?startDate=...&endDate=...
  - Raw sleep endpoint
  - Returns: OuraSleep[]

GET /api/dashboard/readiness?startDate=...&endDate=...
  - Raw readiness endpoint
  - Returns: OuraReadiness[]
```

**Error Handling:**
- 400: Invalid/missing parameters
- 401: Not authenticated
- 500: API errors or server errors

---

## Frontend Architecture

### App Component (App.tsx)

**Purpose**: Root component handling authentication flow

**State:**
```typescript
authStatus: { strava: boolean, oura: boolean }
loading: boolean
error: string | null
```

**Authentication Flow:**
1. Check auth status on mount
2. Check URL params for OAuth redirects
3. Show auth UI if not fully authenticated
4. Show dashboard if authenticated

**Key Methods:**
- `checkAuthStatus()`: Polls /api/auth/status
- `checkURLParams()`: Handles OAuth redirect callbacks
- `connectStrava()`: Redirects to Strava OAuth
- `connectOura()`: Redirects to Oura OAuth
- `handleLogout()`: Destroys session

### Dashboard Component (Dashboard.tsx)

**Purpose**: Main dashboard container and data orchestrator

**State:**
```typescript
data: DashboardData | null
loading: boolean
error: string | null
endDate: string (ISO format)
lookback: number (days)
```

**Lifecycle:**
- Fetches data on mount and when date controls change
- Uses useEffect hook with [endDate, lookback] dependencies

**Data Flow:**
```
User changes date → State update → useEffect triggered →
fetchData() → API call → Set data state → Re-render children
```

### Date Controls Component (DateControls.tsx)

**Purpose**: Date picker and lookback period selector

**Props:**
```typescript
endDate: string
lookback: number
onDateChange: (date: string) => void
onLookbackChange: (days: number) => void
```

**Features:**
- Date input (max: today)
- Lookback dropdown (R1, R7, R14, R28, R90)
- Quick filters: Today, This Week, Last Week, This Month

**Quick Filter Logic:**
- Today: endDate = today, lookback = 1
- This Week: endDate = today, lookback = 7
- Last Week: endDate = today - 7 days, lookback = 7
- This Month: endDate = today, lookback = 28

### Hero KPIs Component (HeroKPIs.tsx)

**Purpose**: Display 6 key performance indicators

**Props:**
```typescript
kpis: DashboardData['kpis']
```

**KPI Cards:**
1. Weekly Mileage (with % change indicator)
2. Average Readiness (with trend arrow)
3. Average Sleep (duration + score)
4. Training Sessions (count)
5. Elevation Gain (feet)
6. Training Load (suffer score sum)

**Styling:**
- Grid layout (auto-fit, minmax(180px, 1fr))
- Color coding: green for positive, red for negative
- Responsive: 2 columns on mobile

### Time Series Chart Component (TimeSeriesChart.tsx)

**Purpose**: Visualize trends over time using Recharts

**Charts:**

1. **Training & Recovery Trends**
   - Dual Y-axis line chart
   - Left axis: Daily mileage (miles)
   - Right axis: Readiness score (0-100)
   - Orange line: Mileage
   - Dark blue line: Readiness

2. **Sleep Trends**
   - Single Y-axis line chart
   - Green line: Sleep duration (hours)
   - Blue line: Sleep score (0-100)

**Configuration:**
- Responsive container (100% width, 300px height)
- Grid lines
- Tooltips on hover
- Legend

### Data Tables (ActivityTable, SleepTable, ReadinessTable)

**Common Features:**
- Horizontal scroll on small screens
- Hover effect on rows
- "No data" message when empty
- Consistent styling via DataTable.css

**Activity Table Columns:**
- Date, Name, Type, Distance (mi), Duration (min), Pace (min/mi), Elevation (ft), HR Avg

**Sleep Table Columns:**
- Date, Duration (hrs), Deep (hrs), Light (hrs), REM (hrs), Efficiency (%), Score

**Readiness Table Columns:**
- Date, Score, HRV Balance, Sleep Balance, Activity Balance, RHR

### API Service (services/api.ts)

**Purpose**: Centralized API client using Axios

**Configuration:**
```typescript
baseURL: VITE_API_URL (env variable)
withCredentials: true (for session cookies)
```

**API Methods:**

```typescript
authAPI.getStravaAuthUrl(): Promise<{url}>
authAPI.getOuraAuthUrl(): Promise<{url}>
authAPI.getAuthStatus(): Promise<{strava, oura}>
authAPI.logout(): Promise<void>

dashboardAPI.getDashboardData(date, lookback): Promise<DashboardData>
dashboardAPI.getActivities(start, end): Promise<Activity[]>
dashboardAPI.getSleep(start, end): Promise<Sleep[]>
dashboardAPI.getReadiness(start, end): Promise<Readiness[]>
```

---

## Type System

### Backend Types (backend/src/types/index.ts)

**Core Types:**

```typescript
TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number (timestamp)
}

StravaActivity {
  id, name, type, sport_type
  start_date, start_date_local
  distance, moving_time, elapsed_time
  total_elevation_gain
  average_speed, max_speed
  average_heartrate, max_heartrate (optional)
  average_cadence, suffer_score (optional)
}

OuraSleep {
  id, day, score, timestamp
  duration, total_sleep_duration, awake_time
  light_sleep_duration, deep_sleep_duration, rem_sleep_duration
  efficiency, restless_periods
  average_heart_rate, lowest_heart_rate
  average_hrv, temperature_delta
}

OuraReadiness {
  id, day, score, timestamp
  temperature_deviation, temperature_trend_deviation
  contributors: {
    activity_balance, body_temperature, hrv_balance
    previous_day_activity, previous_night
    recovery_index, resting_heart_rate, sleep_balance
  }
}

DashboardData {
  dateRange: { startDate, endDate, lookbackDays }
  kpis: { weeklyMileage, weeklyMileageChange, ... }
  timeSeries: TimeSeriesData[]
  activities: ActivitySummary[]
  sleepData: SleepSummary[]
  readinessData: ReadinessSummary[]
}
```

### Frontend Types (frontend/src/types/index.ts)

**Matches backend types** for dashboard data, with additional:

```typescript
AuthStatus {
  strava: boolean
  oura: boolean
}
```

---

## Data Flow

### Complete Request Flow Example

**User Action**: Changes date to "2024-01-15" with R7 lookback

```
1. Frontend (DateControls.tsx)
   └─> onDateChange('2024-01-15') called
       └─> Dashboard.tsx state updated
           └─> useEffect triggered

2. Dashboard.tsx fetchData()
   └─> dashboardAPI.getDashboardData('2024-01-15', 7)
       └─> axios.get('/api/dashboard/data', { params })

3. Backend (routes/dashboard.ts)
   └─> requireAuth middleware checks session
       ├─> Parse query params: date, lookback
       ├─> Calculate startDate = endDate - lookback + 1
       └─> Promise.all([
             stravaService.getActivities(tokens, startDate, endDate)
             ouraService.getSleepData(tokens, startDate, endDate)
             ouraService.getReadinessData(tokens, startDate, endDate)
           ])

4. Services Check Cache
   └─> If cached: return cached data
   └─> If not cached:
       ├─> Call external API (Strava/Oura)
       ├─> Cache response
       └─> Return data

5. Data Aggregation (utils/dataAggregation.ts)
   └─> aggregateDashboardData(activities, sleep, readiness, ...)
       ├─> Convert units (meters→miles, seconds→minutes)
       ├─> Calculate KPIs
       ├─> Generate time series
       ├─> Create summaries
       └─> Return DashboardData object

6. Backend Response
   └─> Send JSON to frontend

7. Frontend (Dashboard.tsx)
   └─> setData(result)
       └─> Re-render with new data
           ├─> HeroKPIs updates
           ├─> TimeSeriesChart redraws
           └─> Tables repopulate
```

---

## Security Implementation

### OAuth Security

**State Parameter:**
- Random 16-byte hex string generated per OAuth flow
- Stored in server session
- Validated on callback to prevent CSRF

**Token Storage:**
- Access tokens never sent to client
- Stored in express-session (server-side)
- Session cookie is HttpOnly (JavaScript cannot access)
- Secure flag enabled in production (HTTPS only)

**Scope Limiting:**
- Strava: `activity:read_all` (read-only access)
- Oura: `daily heartrate` (specific data scopes)

### CORS Configuration

```typescript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

- Restricts requests to specific frontend origin
- Allows credentials (cookies) to be sent

### Environment Variables

**Sensitive data in .env:**
- API client secrets
- Session secret
- Redirect URIs

**Never committed to git** (in .gitignore)

---

## Performance Optimizations

### Caching Strategy

**Benefits:**
- Reduces API calls to Strava/Oura (rate limit protection)
- Faster response times (from memory vs network)
- Lower latency for users

**Cache Configuration:**
- Default TTL: 3600 seconds (1 hour)
- Configurable via CACHE_TTL env variable
- Automatic expiration and cleanup

**Cache Invalidation:**
- Time-based (TTL)
- Manual: restart server to flush cache
- Future: Add manual refresh button

### Parallel Data Fetching

```typescript
Promise.all([
  stravaService.getActivities(...),
  ouraService.getSleepData(...),
  ouraService.getReadinessData(...)
])
```

- All API calls execute simultaneously
- Reduces total request time by ~66%

### Frontend Optimizations

- **React.memo**: Could be added to prevent unnecessary re-renders
- **Recharts**: Handles large datasets efficiently
- **Lazy Loading**: Could add for tables with many rows

---

## Extending the Codebase

### Adding a New API Integration

**Example: Add Garmin Integration**

1. **Create Service** (`backend/src/services/garmin.ts`):
```typescript
class GarminService {
  exchangeToken(code: string): Promise<TokenData>
  getActivities(tokens, start, end): Promise<Activity[]>
  getAuthorizationURL(state): string
}
```

2. **Add Routes** (`backend/src/routes/auth.ts`):
```typescript
router.get('/garmin', (req, res) => { ... })
router.get('/garmin/callback', (req, res) => { ... })
```

3. **Update Types** (`backend/src/types/index.ts`):
```typescript
interface SessionData {
  garminTokens?: TokenData
}
```

4. **Frontend Updates**:
- Add "Connect Garmin" button to `App.tsx`
- Update `AuthStatus` type to include `garmin: boolean`

### Adding a New KPI

**Example: Add "Average Cadence"**

1. **Backend** (`utils/dataAggregation.ts`):
```typescript
const avgCadence = activities
  .filter(a => a.average_cadence)
  .reduce((sum, a) => sum + a.average_cadence!, 0) /
  activities.filter(a => a.average_cadence).length
```

2. **Update Types**:
```typescript
interface KPIs {
  averageCadence: number
}
```

3. **Frontend** (`HeroKPIs.tsx`):
```tsx
<div className="kpi-card">
  <div className="kpi-label">Avg Cadence</div>
  <div className="kpi-value">{kpis.averageCadence.toFixed(0)} spm</div>
</div>
```

### Adding a New Chart

**Example: Heart Rate Zones Chart**

1. **Fetch Data** (if not already available)
2. **Process Data** (calculate time in each zone)
3. **Add Chart Component**:
```tsx
import { BarChart, Bar, XAxis, YAxis } from 'recharts'

<BarChart data={heartRateZones}>
  <Bar dataKey="minutes" fill="#fc5200" />
  <XAxis dataKey="zone" />
  <YAxis />
</BarChart>
```

---

## Testing Guide

### Manual Testing Checklist

**Authentication:**
- [ ] Strava OAuth completes successfully
- [ ] Oura OAuth completes successfully
- [ ] Session persists after page refresh
- [ ] Logout clears session
- [ ] Invalid state parameter rejected

**Dashboard:**
- [ ] Data loads on successful auth
- [ ] Date controls update dashboard
- [ ] All KPIs display correctly
- [ ] Charts render without errors
- [ ] Tables populate with data

**Edge Cases:**
- [ ] No activities in date range
- [ ] No sleep/readiness data
- [ ] Invalid date selection
- [ ] Network errors handled gracefully
- [ ] Expired tokens refresh automatically

### Unit Testing (Future)

**Recommended frameworks:**
- Backend: Jest + Supertest
- Frontend: Jest + React Testing Library

**Test Coverage Priorities:**
1. Data aggregation functions
2. Unit conversions
3. KPI calculations
4. Date range calculations
5. Cache service methods

---

## Deployment Guide

### Environment Variables

**Backend Production:**
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app
SESSION_SECRET=<strong-random-secret>
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REDIRECT_URI=https://your-backend.railway.app/api/auth/strava/callback
OURA_CLIENT_ID=...
OURA_CLIENT_SECRET=...
OURA_REDIRECT_URI=https://your-backend.railway.app/api/auth/oura/callback
CACHE_TTL=3600
```

**Frontend Production:**
```env
VITE_API_URL=https://your-backend.railway.app
```

### Deployment Platforms

**Frontend (Vercel):**
1. Connect GitHub repo
2. Framework: Vite
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add env variable: `VITE_API_URL`

**Backend (Railway):**
1. Connect GitHub repo
2. Root directory: `backend`
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add all env variables
6. Enable automatic HTTPS

**Update OAuth Apps:**
- Change redirect URIs to production URLs
- Update Authorization Callback Domains

---

## Troubleshooting

### Common Issues

**"Failed to connect to Strava/Oura"**
- Verify Client ID/Secret in .env
- Check redirect URI matches exactly
- Ensure callback domain is authorized
- Restart backend after .env changes

**Cached data not updating**
- Default TTL is 1 hour
- Restart backend to flush cache
- Or wait for TTL to expire

**CORS errors**
- Check FRONTEND_URL matches exactly
- Ensure withCredentials: true in axios
- Verify CORS origin in Express config

**Session not persisting**
- Check SESSION_SECRET is set
- Verify secure: false in development
- Clear browser cookies and retry

**TypeScript errors**
- Run `npm run type-check` in both directories
- Ensure types are consistent between frontend/backend
- Check tsconfig.json settings

---

## Future Enhancements

### Milestone 2 Features

1. **Database Integration**
   - PostgreSQL or MongoDB
   - Historical data retention
   - User accounts

2. **Advanced Analytics**
   - Training load vs recovery correlation
   - Pace improvements over time
   - Heart rate zone analysis
   - VO2 max tracking

3. **Recommendations Engine**
   - Training plan suggestions
   - Rest day recommendations
   - Race day predictions

4. **Export & Sharing**
   - CSV/PDF export
   - Weekly email summaries
   - Shareable reports

5. **Mobile App**
   - React Native version
   - Push notifications
   - Offline support

---

## API Rate Limits

### Strava
- **Rate Limit**: 100 requests per 15 minutes, 1000 per day (per user)
- **Mitigation**: Caching (1 hour TTL), pagination

### Oura
- **Rate Limit**: 5,000 requests per 5 minutes
- **Mitigation**: Caching, reasonable date ranges

---

## Contributing

### Code Style

- TypeScript strict mode enabled
- ESLint configuration in place
- Consistent naming: camelCase for variables/functions
- Component files: PascalCase.tsx
- Utility files: camelCase.ts

### Git Workflow

1. Create feature branch
2. Make changes
3. Test locally
4. Commit with descriptive message
5. Push and create PR
6. Review and merge

### Pull Request Template

```markdown
## Description
[What does this PR do?]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
[How was this tested?]

## Screenshots
[If UI changes]
```

---

## License

MIT License - See LICENSE file

---

## Support

For issues and questions:
1. Check this documentation
2. Review SETUP.md for setup issues
3. Check GitHub Issues
4. Create new issue with:
   - Environment (OS, Node version)
   - Steps to reproduce
   - Error messages
   - Screenshots

---

## Changelog

### v1.0.0 (Current)
- Initial release
- Strava and Oura OAuth integration
- Dashboard with KPIs, charts, and tables
- Date range controls
- Responsive design
- In-memory caching

### Future Versions
- v1.1.0: Database integration
- v1.2.0: Advanced analytics
- v2.0.0: Multi-user support

---

**Built with ❤️ for marathon training**
