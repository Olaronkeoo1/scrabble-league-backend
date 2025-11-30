// frontend/src/services/supabase-api.js
import axios from 'axios';
import { supabase } from '../supabase-config';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// attach Supabase access token to every request
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const accessToken = data?.session?.access_token;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const playerAPI = {
  getProfile: () => api.get('/api/players/profile'),
  updateProfile: (data) => api.put('/api/players/profile', data),
  getAll: () => api.get('/api/players'),
  search: (query) => api.get(`/api/players/search/${query}`),
};

export const matchAPI = {
  scheduleMatch: (payload) =>
    api.post('/api/matches/schedule', payload),
  recordResult: (matchId, data) =>
    api.put(`/api/matches/${matchId}/result`, data),
  getUpcoming: () => api.get('/api/matches/upcoming'),
  getHistory: (playerId) =>
    api.get(`/api/matches/history/${playerId}`),
};

export const leagueAPI = {
  getStandings: () => api.get('/api/league/standings'),
  getStats: () => api.get('/api/league/stats'),           // <- changed
  getTop: (limit = 10) => api.get(`/api/league/top/${limit}`),
  addPlayerToLeague: (playerId) =>
    api.post('/api/league/add-player', { player_id: playerId }),
};



export default api;

