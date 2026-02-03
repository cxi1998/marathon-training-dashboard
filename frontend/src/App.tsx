import { useState, useEffect } from 'react';
import { authAPI } from './services/api';
import type { AuthStatus } from './types';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ strava: false, oura: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
    checkURLParams();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await authAPI.getAuthStatus();
      setAuthStatus(status);
    } catch (err) {
      console.error('Failed to check auth status:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkURLParams = () => {
    const params = new URLSearchParams(window.location.search);
    const stravaConnected = params.get('strava');
    const ouraConnected = params.get('oura');
    const errorParam = params.get('error');

    if (stravaConnected === 'connected') {
      setError(null);
      checkAuthStatus();
      window.history.replaceState({}, '', '/');
    }

    if (ouraConnected === 'connected') {
      setError(null);
      checkAuthStatus();
      window.history.replaceState({}, '', '/');
    }

    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
      window.history.replaceState({}, '', '/');
    }
  };

  const connectStrava = async () => {
    try {
      const { url } = await authAPI.getStravaAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError('Failed to connect to Strava');
      console.error(err);
    }
  };

  const connectOura = async () => {
    try {
      const { url } = await authAPI.getOuraAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError('Failed to connect to Oura');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setAuthStatus({ strava: false, oura: false });
    } catch (err) {
      setError('Failed to logout');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const isFullyAuthenticated = authStatus.strava && authStatus.oura;

  return (
    <div className="app">
      <header className="header">
        <h1>Marathon Training Dashboard</h1>
        <p className="subtitle">NYC Marathon 2026 Training Tracker</p>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {!isFullyAuthenticated ? (
        <div className="auth-container">
          <h2>Connect Your Accounts</h2>
          <p>Connect both Strava and Oura to view your training dashboard.</p>

          <div className="auth-buttons">
            <button
              onClick={connectStrava}
              disabled={authStatus.strava}
              className={authStatus.strava ? 'connected' : ''}
            >
              {authStatus.strava ? '✓ Strava Connected' : 'Connect Strava'}
            </button>

            <button
              onClick={connectOura}
              disabled={authStatus.oura}
              className={authStatus.oura ? 'connected' : ''}
            >
              {authStatus.oura ? '✓ Oura Connected' : 'Connect Oura'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="auth-status">
            <span>✓ Connected to Strava & Oura</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
          <Dashboard />
        </>
      )}
    </div>
  );
}

export default App;
