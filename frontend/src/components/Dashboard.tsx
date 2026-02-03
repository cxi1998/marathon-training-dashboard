import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import type { DashboardData } from '../types';
import DateControls from './DateControls';
import HeroKPIs from './HeroKPIs';
import TimeSeriesChart from './TimeSeriesChart';
import ActivityTable from './ActivityTable';
import SleepTable from './SleepTable';
import ReadinessTable from './ReadinessTable';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [lookback, setLookback] = useState(7);

  useEffect(() => {
    fetchData();
  }, [endDate, lookback]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardAPI.getDashboardData(endDate, lookback);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <DateControls
        endDate={endDate}
        lookback={lookback}
        onDateChange={setEndDate}
        onLookbackChange={setLookback}
      />

      {loading && <div className="loading-message">Loading data...</div>}
      {error && <div className="error-message">{error}</div>}

      {data && !loading && (
        <>
          <HeroKPIs kpis={data.kpis} />
          <TimeSeriesChart timeSeries={data.timeSeries} />
          <div className="tables-grid">
            <ActivityTable activities={data.activities} />
            <SleepTable sleepData={data.sleepData} />
            <ReadinessTable readinessData={data.readinessData} />
          </div>
        </>
      )}
    </div>
  );
}
