import Dashboard from './components/Dashboard';
import './App.css';

/**
 * Simplified App component for Vercel deployment
 * Authentication is handled via environment variables on the backend
 * No OAuth flow needed in production
 */
function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Marathon Training Dashboard</h1>
        <p className="subtitle">NYC Marathon 2026 Training Tracker</p>
      </header>

      <Dashboard />
    </div>
  );
}

export default App;
