import type { DashboardData } from '../types';
import './HeroKPIs.css';

interface HeroKPIsProps {
  kpis: DashboardData['kpis'];
}

export default function HeroKPIs({ kpis }: HeroKPIsProps) {
  return (
    <div className="hero-kpis">
      <div className="kpi-card">
        <div className="kpi-label">Weekly Mileage</div>
        <div className="kpi-value">{kpis.weeklyMileage.toFixed(1)} mi</div>
        {kpis.weeklyMileageChange !== 0 && (
          <div className={`kpi-change ${kpis.weeklyMileageChange > 0 ? 'positive' : 'negative'}`}>
            {kpis.weeklyMileageChange > 0 ? '▲' : '▼'} {Math.abs(kpis.weeklyMileageChange).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Avg Readiness</div>
        <div className="kpi-value">{kpis.averageReadinessScore.toFixed(0)}</div>
        <div className={`kpi-trend ${kpis.readinessTrend}`}>
          {kpis.readinessTrend === 'up' ? '▲' : kpis.readinessTrend === 'down' ? '▼' : '—'}
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Avg Sleep</div>
        <div className="kpi-value">{kpis.averageSleepDuration.toFixed(1)} hrs</div>
        <div className="kpi-subvalue">Score: {kpis.averageSleepScore.toFixed(0)}</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Training Sessions</div>
        <div className="kpi-value">{kpis.totalTrainingSessions}</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Elevation Gain</div>
        <div className="kpi-value">{kpis.cumulativeElevationGain.toFixed(0)} ft</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Training Load</div>
        <div className="kpi-value">{kpis.trainingLoad.toFixed(0)}</div>
      </div>
    </div>
  );
}
