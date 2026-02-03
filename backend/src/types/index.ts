// Session data types
export interface SessionData {
  stravaTokens?: TokenData;
  ouraTokens?: TokenData;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Strava API types
export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  suffer_score?: number;
}

export interface StravaStats {
  recent_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  ytd_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  all_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
}

// Oura API types
export interface OuraSleep {
  id: string;
  day: string;
  score: number;
  timestamp: string;
  duration?: number | null;
  total_sleep_duration?: number | null;
  awake_time?: number | null;
  light_sleep_duration?: number | null;
  deep_sleep_duration?: number | null;
  rem_sleep_duration?: number | null;
  efficiency?: number | null;
  restless_periods?: number | null;
  average_heart_rate?: number | null;
  lowest_heart_rate?: number | null;
  average_hrv?: number | null;
  temperature_delta?: number | null;
}

export interface OuraReadiness {
  id: string;
  day: string;
  score: number;
  timestamp: string;
  temperature_deviation?: number | null;
  temperature_trend_deviation?: number | null;
  contributors?: {
    activity_balance?: number | null;
    body_temperature?: number | null;
    hrv_balance?: number | null;
    previous_day_activity?: number | null;
    previous_night?: number | null;
    recovery_index?: number | null;
    resting_heart_rate?: number | null;
    sleep_balance?: number | null;
  } | null;
}

export interface OuraHeartRate {
  bpm: number;
  source: string;
  timestamp: string;
}

// Dashboard aggregated data types
export interface DashboardData {
  dateRange: {
    startDate: string;
    endDate: string;
    lookbackDays: number;
  };
  kpis: {
    weeklyMileage: number;
    weeklyMileageChange: number;
    averageReadinessScore: number;
    readinessTrend: 'up' | 'down' | 'stable';
    averageSleepDuration: number;
    averageSleepScore: number;
    totalTrainingSessions: number;
    cumulativeElevationGain: number;
    trainingLoad: number;
  };
  timeSeries: {
    date: string;
    mileage: number;
    readinessScore: number | null;
    sleepDuration: number | null;
    sleepScore: number | null;
  }[];
  activities: ActivitySummary[];
  sleepData: SleepSummary[];
  readinessData: ReadinessSummary[];
}

export interface ActivitySummary {
  id: number;
  date: string;
  type: string;
  name: string;
  distance: number;
  duration: number;
  pace: number;
  elevationGain: number;
  averageHeartRate?: number;
  sufferScore?: number;
}

export interface SleepSummary {
  id: string;
  date: string;
  duration: number;
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  efficiency: number;
  sleepScore: number;
  averageHrv: number;
}

export interface ReadinessSummary {
  id: string;
  date: string;
  readinessScore: number;
  hrvBalance: number;
  sleepBalance: number;
  activityBalance: number;
  restingHeartRate: number;
  temperatureDeviation: number;
}

// OAuth types
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
}
