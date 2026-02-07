import type { DashboardData } from '../types';
import { formatNumber } from '../utils/formatNumber';
import './HeroKPIs.css';

interface HeroKPIsProps {
  kpis: DashboardData['kpis'];
}

export default function HeroKPIs({ kpis }: HeroKPIsProps) {
  // Add null safety with default values
  const {
    weeklyMileage = 0,
    weeklyMileageChange = 0,
    averageReadinessScore = 0,
    readinessTrend = 'stable' as 'up' | 'down' | 'stable',
    averageSleepDuration = 0,
    averageSleepScore = 0,
    totalTrainingSessions = 0,
    cumulativeElevationGain = 0,
    trainingLoad = 0,
  } = kpis || {};

  return (
    <div className="hero-kpis">
      <div className="kpi-card">
        <div className="kpi-label">Weekly Mileage</div>
        <div className="kpi-value">{formatNumber(weeklyMileage)} mi</div>
        {weeklyMileageChange !== 0 && (
          <div className={`kpi-change ${weeklyMileageChange > 0 ? 'positive' : 'negative'}`}>
            {weeklyMileageChange > 0 ? '▲' : '▼'} {formatNumber(Math.abs(weeklyMileageChange))}%
          </div>
        )}
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Avg Readiness</div>
        <div className="kpi-value">{formatNumber(averageReadinessScore)}</div>
        <div className={`kpi-trend ${readinessTrend}`}>
          {readinessTrend === 'up' ? '▲' : readinessTrend === 'down' ? '▼' : '—'}
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Avg Sleep</div>
        <div className="kpi-value">{formatNumber(averageSleepDuration)} hrs</div>
        <div className="kpi-subvalue">Score: {formatNumber(averageSleepScore)}</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Training Sessions</div>
        <div className="kpi-value">{totalTrainingSessions}</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Elevation Gain</div>
        <div className="kpi-value">{formatNumber(cumulativeElevationGain)} ft</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Training Load</div>
        <div className="kpi-value">{formatNumber(trainingLoad)}</div>
      </div>
    </div>
  );
}
