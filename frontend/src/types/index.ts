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
  timeSeries: TimeSeriesData[];
  activities: ActivitySummary[];
  sleepData: SleepSummary[];
  readinessData: ReadinessSummary[];
}

export interface TimeSeriesData {
  date: string;
  mileage: number;
  readinessScore: number | null;
  sleepDuration: number | null;
  sleepScore: number | null;
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

export interface AuthStatus {
  strava: boolean;
  oura: boolean;
}
