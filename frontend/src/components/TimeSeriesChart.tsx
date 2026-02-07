import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TimeSeriesData } from '../types';
import { formatNumber } from '../utils/formatNumber';
import './TimeSeriesChart.css';

interface TimeSeriesChartProps {
  timeSeries: TimeSeriesData[];
}

// Custom interface for tooltip props since recharts doesn't export TooltipProps
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '2px 0', color: entry.color }}>
            {entry.name}: {formatNumber(entry.value as number)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="mileage" stroke="#fc5200" name="Daily Mileage" connectNulls={false} />
          <Line yAxisId="right" type="monotone" dataKey="readinessScore" stroke="#2d3142" name="Readiness Score" connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={timeSeries}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis label={{ value: 'Hours / Score', angle: -90, position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="sleepDuration" stroke="#4caf50" name="Sleep Duration (hrs)" connectNulls={false} />
          <Line type="monotone" dataKey="sleepScore" stroke="#2196f3" name="Sleep Score" connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
