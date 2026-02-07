import type { ReadinessSummary } from '../types';
import { formatNumber } from '../utils/formatNumber';
import './DataTable.css';

interface ReadinessTableProps {
  readinessData: ReadinessSummary[];
}

export default function ReadinessTable({ readinessData }: ReadinessTableProps) {
  return (
    <div className="data-table">
      <h3>Readiness</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Score</th>
              <th>HRV Balance</th>
              <th>Sleep Balance</th>
              <th>Activity Balance</th>
              <th>RHR</th>
            </tr>
          </thead>
          <tbody>
            {readinessData.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">No readiness data found</td>
              </tr>
            ) : (
              readinessData.map((readiness) => (
                <tr key={readiness.id}>
                  <td>{readiness.date}</td>
                  <td className="score">{formatNumber(readiness.readinessScore)}</td>
                  <td>{formatNumber(readiness.hrvBalance)}</td>
                  <td>{formatNumber(readiness.sleepBalance)}</td>
                  <td>{formatNumber(readiness.activityBalance)}</td>
                  <td>{formatNumber(readiness.restingHeartRate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
