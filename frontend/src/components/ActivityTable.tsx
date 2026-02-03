import type { ActivitySummary } from '../types';
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
                  <td>{activity.distance.toFixed(2)} mi</td>
                  <td>{activity.duration.toFixed(0)} min</td>
                  <td>{activity.pace.toFixed(2)} min/mi</td>
                  <td>{activity.elevationGain.toFixed(0)} ft</td>
                  <td>{activity.averageHeartRate ? Math.round(activity.averageHeartRate) : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
