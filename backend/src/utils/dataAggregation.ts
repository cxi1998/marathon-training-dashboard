import {
  StravaActivity,
  OuraSleep,
  OuraReadiness,
  DashboardData,
  ActivitySummary,
  SleepSummary,
  ReadinessSummary,
} from '../types';

export function metersToMiles(meters: number): number {
  return meters * 0.000621371;
}

export function secondsToMinutes(seconds: number): number {
  return seconds / 60;
}

export function calculatePace(distanceMeters: number, timeSeconds: number): number {
  if (distanceMeters === 0) return 0;
  const miles = metersToMiles(distanceMeters);
  const minutes = secondsToMinutes(timeSeconds);
  return minutes / miles;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function aggregateDashboardData(
  activities: StravaActivity[],
  sleepData: OuraSleep[],
  readinessData: OuraReadiness[],
  startDate: Date,
  endDate: Date,
  lookbackDays: number
): DashboardData {
  const activitySummaries = activities.map((activity): ActivitySummary => ({
    id: activity.id,
    date: activity.start_date_local.split('T')[0],
    type: activity.sport_type || activity.type,
    name: activity.name,
    distance: metersToMiles(activity.distance),
    duration: secondsToMinutes(activity.moving_time),
    pace: calculatePace(activity.distance, activity.moving_time),
    elevationGain: activity.total_elevation_gain * 3.28084,
    averageHeartRate: activity.average_heartrate,
    sufferScore: activity.suffer_score,
  }));

  const sleepSummaries = sleepData.map((sleep): SleepSummary => ({
    id: sleep.id,
    date: sleep.day,
    duration: sleep.total_sleep_duration / 3600,
    deepSleep: sleep.deep_sleep_duration / 3600,
    lightSleep: sleep.light_sleep_duration / 3600,
    remSleep: sleep.rem_sleep_duration / 3600,
    efficiency: sleep.efficiency,
    sleepScore: sleep.score,
    averageHrv: sleep.average_hrv,
  }));

  const readinessSummaries = readinessData.map((readiness): ReadinessSummary => ({
    id: readiness.id,
    date: readiness.day,
    readinessScore: readiness.score,
    hrvBalance: readiness.contributors.hrv_balance,
    sleepBalance: readiness.contributors.sleep_balance,
    activityBalance: readiness.contributors.activity_balance,
    restingHeartRate: readiness.contributors.resting_heart_rate,
    temperatureDeviation: readiness.temperature_deviation,
  }));

  const totalMileage = activitySummaries.reduce((sum, act) => sum + act.distance, 0);
  const avgReadiness =
    readinessSummaries.length > 0
      ? readinessSummaries.reduce((sum, r) => sum + r.readinessScore, 0) /
        readinessSummaries.length
      : 0;
  const avgSleepDuration =
    sleepSummaries.length > 0
      ? sleepSummaries.reduce((sum, s) => sum + s.duration, 0) / sleepSummaries.length
      : 0;
  const avgSleepScore =
    sleepSummaries.length > 0
      ? sleepSummaries.reduce((sum, s) => sum + s.sleepScore, 0) / sleepSummaries.length
      : 0;
  const totalElevation = activitySummaries.reduce((sum, act) => sum + act.elevationGain, 0);
  const trainingLoad = activitySummaries.reduce(
    (sum, act) => sum + (act.sufferScore || 0),
    0
  );

  const previousWeekStart = new Date(startDate);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const previousWeekActivities = activities.filter((act) => {
    const actDate = new Date(act.start_date_local);
    return actDate >= previousWeekStart && actDate < startDate;
  });
  const previousWeekMileage = previousWeekActivities.reduce(
    (sum, act) => sum + metersToMiles(act.distance),
    0
  );
  const weeklyMileageChange =
    previousWeekMileage > 0 ? ((totalMileage - previousWeekMileage) / previousWeekMileage) * 100 : 0;

  const recentReadiness = readinessSummaries.slice(-3);
  const earlierReadiness = readinessSummaries.slice(0, -3);
  const recentAvg =
    recentReadiness.length > 0
      ? recentReadiness.reduce((sum, r) => sum + r.readinessScore, 0) / recentReadiness.length
      : 0;
  const earlierAvg =
    earlierReadiness.length > 0
      ? earlierReadiness.reduce((sum, r) => sum + r.readinessScore, 0) / earlierReadiness.length
      : 0;
  const readinessTrend =
    recentAvg > earlierAvg + 2 ? 'up' : recentAvg < earlierAvg - 2 ? 'down' : 'stable';

  const dateMap = new Map<string, { date: string; mileage: number; readinessScore: number | null; sleepDuration: number | null; sleepScore: number | null }>();

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDate(d);
    dateMap.set(dateStr, {
      date: dateStr,
      mileage: 0,
      readinessScore: null,
      sleepDuration: null,
      sleepScore: null,
    });
  }

  activitySummaries.forEach((act) => {
    const existing = dateMap.get(act.date);
    if (existing) {
      existing.mileage += act.distance;
    }
  });

  readinessSummaries.forEach((readiness) => {
    const existing = dateMap.get(readiness.date);
    if (existing) {
      existing.readinessScore = readiness.readinessScore;
    }
  });

  sleepSummaries.forEach((sleep) => {
    const existing = dateMap.get(sleep.date);
    if (existing) {
      existing.sleepDuration = sleep.duration;
      existing.sleepScore = sleep.sleepScore;
    }
  });

  const timeSeries = Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return {
    dateRange: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      lookbackDays,
    },
    kpis: {
      weeklyMileage: totalMileage,
      weeklyMileageChange,
      averageReadinessScore: avgReadiness,
      readinessTrend,
      averageSleepDuration: avgSleepDuration,
      averageSleepScore: avgSleepScore,
      totalTrainingSessions: activitySummaries.length,
      cumulativeElevationGain: totalElevation,
      trainingLoad,
    },
    timeSeries,
    activities: activitySummaries.sort((a, b) => b.date.localeCompare(a.date)),
    sleepData: sleepSummaries.sort((a, b) => b.date.localeCompare(a.date)),
    readinessData: readinessSummaries.sort((a, b) => b.date.localeCompare(a.date)),
  };
}
