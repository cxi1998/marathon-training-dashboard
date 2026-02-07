import type { SleepSummary } from '../types';
import { formatNumber } from '../utils/formatNumber';
import './DataTable.css';

interface SleepTableProps {
  sleepData: SleepSummary[];
}

export default function SleepTable({ sleepData }: SleepTableProps) {
  return (
    <div className="data-table">
      <h3>Sleep</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Deep</th>
              <th>Light</th>
              <th>REM</th>
              <th>Efficiency</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {sleepData.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">No sleep data found</td>
              </tr>
            ) : (
              sleepData.map((sleep) => (
                <tr key={sleep.id}>
                  <td>{sleep.date}</td>
                  <td>{formatNumber(sleep.duration)} hrs</td>
                  <td>{formatNumber(sleep.deepSleep)} hrs</td>
                  <td>{formatNumber(sleep.lightSleep)} hrs</td>
                  <td>{formatNumber(sleep.remSleep)} hrs</td>
                  <td>{formatNumber(sleep.efficiency)}%</td>
                  <td className="score">{formatNumber(sleep.sleepScore)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
