import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TimeSeriesData } from '../types';
import './TimeSeriesChart.css';

interface TimeSeriesChartProps {
  timeSeries: TimeSeriesData[];
}

export default function TimeSeriesChart({ timeSeries }: TimeSeriesChartProps) {
  return (
    <div className="time-series-chart">
      <h2>Training & Recovery Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={timeSeries}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" label={{ value: 'Miles', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Readiness', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="mileage" stroke="#fc5200" name="Daily Mileage" />
          <Line yAxisId="right" type="monotone" dataKey="readinessScore" stroke="#2d3142" name="Readiness Score" />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={timeSeries}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis label={{ value: 'Hours / Score', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sleepDuration" stroke="#4caf50" name="Sleep Duration (hrs)" />
          <Line type="monotone" dataKey="sleepScore" stroke="#2196f3" name="Sleep Score" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
