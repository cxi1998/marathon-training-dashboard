import type { ActivitySummary } from '../types';
import { formatNumber, formatPace, formatActivityDuration } from '../utils/formatNumber';
import './DataTable.css';

interface ActivityTableProps {
  activities: ActivitySummary[];
}

export default function ActivityTable({ activities }: ActivityTableProps) {
  return (
    <div className="data-table">
      <h3>Activities</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Type</th>
              <th>Distance</th>
              <th>Duration</th>
              <th>Pace</th>
              <th>Elevation</th>
              <th>HR Avg</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">No activities found</td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.date}</td>
                  <td className="activity-name">{activity.name}</td>
                  <td>{activity.type}</td>
                  <td>{formatNumber(activity.distance)} mi</td>
                  <td>{formatActivityDuration(activity.duration)}</td>
                  <td>{formatPace(activity.pace)}</td>
                  <td>{formatNumber(activity.elevationGain)} ft</td>
                  <td>{activity.averageHeartRate ? formatNumber(activity.averageHeartRate) : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
