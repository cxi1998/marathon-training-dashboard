import axios from 'axios';
import type { DashboardData, AuthStatus } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const authAPI = {
  getStravaAuthUrl: async (): Promise<{ url: string }> => {
    const response = await apiClient.get('/api/auth/strava');
    return response.data;
  },

  getOuraAuthUrl: async (): Promise<{ url: string }> => {
    const response = await apiClient.get('/api/auth/oura');
    return response.data;
  },

  getAuthStatus: async (): Promise<AuthStatus> => {
    const response = await apiClient.get('/api/auth/status');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },
};

export const dashboardAPI = {
  getDashboardData: async (date: string, lookback: number): Promise<DashboardData> => {
    const response = await apiClient.get('/api/dashboard/data', {
      params: { date, lookback },
    });
    return response.data;
  },

  getActivities: async (startDate: string, endDate: string) => {
    const response = await apiClient.get('/api/dashboard/activities', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getSleep: async (startDate: string, endDate: string) => {
    const response = await apiClient.get('/api/dashboard/sleep', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getReadiness: async (startDate: string, endDate: string) => {
    const response = await apiClient.get('/api/dashboard/readiness', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  refreshCache: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/api/dashboard/refresh');
    return response.data;
  },
};

export default apiClient;
