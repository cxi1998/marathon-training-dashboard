import './DateControls.css';

interface DateControlsProps {
  endDate: string;
  lookback: number;
  onDateChange: (date: string) => void;
  onLookbackChange: (days: number) => void;
}

export default function DateControls({
  endDate,
  lookback,
  onDateChange,
  onLookbackChange,
}: DateControlsProps) {
  const setToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const setThisWeek = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
    onLookbackChange(7);
  };

  const setLastWeek = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    onDateChange(date.toISOString().split('T')[0]);
    onLookbackChange(7);
  };

  const setThisMonth = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
    onLookbackChange(28);
  };

  return (
    <div className="date-controls">
      <div className="control-group">
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="control-group">
        <label>Lookback Period:</label>
        <select value={lookback} onChange={(e) => onLookbackChange(Number(e.target.value))}>
          <option value={1}>1 day (R1)</option>
          <option value={7}>7 days (R7)</option>
          <option value={14}>14 days (R14)</option>
          <option value={28}>28 days (R28)</option>
          <option value={90}>90 days (R90)</option>
        </select>
      </div>

      <div className="quick-filters">
        <button onClick={setToday}>Today</button>
        <button onClick={setThisWeek}>This Week</button>
        <button onClick={setLastWeek}>Last Week</button>
        <button onClick={setThisMonth}>This Month</button>
      </div>
    </div>
  );
}
