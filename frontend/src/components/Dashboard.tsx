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
  const [refreshing, setRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear the cache on the backend
      await dashboardAPI.refreshCache();
      // Fetch fresh data
      await fetchData();
    } catch (err: any) {
      setError('Failed to refresh data');
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <DateControls
          endDate={endDate}
          lookback={lookback}
          onDateChange={setEndDate}
          onLookbackChange={setLookback}
        />
        <button
          className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh data from Strava and Oura"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </button>
      </div>

      {loading && <div className="loading-message">Loading data...</div>}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {data && !loading && !error && (
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
