import type { DashboardData } from '../types';
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
        <div className="kpi-value">{weeklyMileage.toFixed(1)} mi</div>
        {weeklyMileageChange !== 0 && (
          <div className={`kpi-change ${weeklyMileageChange > 0 ? 'positive' : 'negative'}`}>
            {weeklyMileageChange > 0 ? '▲' : '▼'} {Math.abs(weeklyMileageChange).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Avg Readiness</div>
        <div className="kpi-value">{averageReadinessScore.toFixed(0)}</div>
        <div className={`kpi-trend ${readinessTrend}`}>
          {readinessTrend === 'up' ? '▲' : readinessTrend === 'down' ? '▼' : '—'}
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Avg Sleep</div>
        <div className="kpi-value">{averageSleepDuration.toFixed(1)} hrs</div>
        <div className="kpi-subvalue">Score: {averageSleepScore.toFixed(0)}</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Training Sessions</div>
        <div className="kpi-value">{totalTrainingSessions}</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Elevation Gain</div>
        <div className="kpi-value">{cumulativeElevationGain.toFixed(0)} ft</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Training Load</div>
        <div className="kpi-value">{trainingLoad.toFixed(0)}</div>
      </div>
    </div>
  );
}
