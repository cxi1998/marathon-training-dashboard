import type { SleepSummary } from '../types';
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
                  <td>{sleep.duration.toFixed(1)} hrs</td>
                  <td>{sleep.deepSleep.toFixed(1)} hrs</td>
                  <td>{sleep.lightSleep.toFixed(1)} hrs</td>
                  <td>{sleep.remSleep.toFixed(1)} hrs</td>
                  <td>{sleep.efficiency}%</td>
                  <td className="score">{sleep.sleepScore}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
