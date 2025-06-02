import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized access - user may need to login');
      // Optionally redirect to login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: { email: string; password: string; fullName: string; role?: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshSession: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

// Team API functions
export const teamAPI = {
  createTeam: async (teamData: { name: string; description?: string }) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  getMyTeams: async () => {
    const response = await api.get('/teams/my');
    return response.data;
  },

  joinTeam: async (inviteCode: string) => {
    const response = await api.post('/teams/join', { inviteCode });
    return response.data;
  }
};

// Pulse API functions
export const pulseAPI = {
  submitPulse: async (pulseData: { rating: number; comment?: string }) => {
    const response = await api.post('/pulse', pulseData);
    return response.data;
  },

  getTodaysPulse: async () => {
    const response = await api.get('/pulse/today');
    return response.data;
  }
};

// Check-in API functions
export const checkinAPI = {
  submitCheckin: async (checkinData: FormData) => {
    const response = await api.post('/checkins', checkinData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Schedule API functions
export const scheduleAPI = {
  updateSchedule: async (schedule: any) => {
    const response = await api.post('/schedule', { schedule });
    return response.data;
  },

  getSchedule: async () => {
    const response = await api.get('/schedule');
    return response.data;
  }
};

// Analytics API functions
export const analyticsAPI = {
  getTeamAnalytics: async () => {
    const response = await api.get('/analytics/team');
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await api.get('/leaderboard');
    return response.data;
  }
};

export default api;