import { create } from 'zustand';
import api from '../api/client';
import type { AuthResponse, User } from '../types';
import { touchLoginStreak } from '../utils/userMetrics';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    dob: string;
    phone: string;
    dailyCalorieGoal?: number;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const persistAuth = (auth: Partial<AuthResponse>) => {
  if (auth.token) {
    localStorage.setItem('token', auth.token);
  }
  if (auth.user) {
    localStorage.setItem('user', JSON.stringify(auth.user));
  }
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  hydrated: false,
  initialize: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    set({
      token: token ?? null,
      user: token && user ? (JSON.parse(user) as User) : null,
      hydrated: true,
    });
  },
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
      persistAuth(data);
      touchLoginStreak(data.user.id);
      set({ user: data.user, token: data.token, loading: false, hydrated: true });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Unable to login',
        loading: false,
      });
      throw error;
    }
  },
  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/register', payload);
      persistAuth(data);
      touchLoginStreak(data.user.id);
      set({ user: data.user, token: data.token, loading: false, hydrated: true });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Unable to register',
        loading: false,
      });
      throw error;
    }
  },
  logout: () => {
    clearAuth();
    set({ user: null, token: null, hydrated: true });
  },
  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const user = { ...state.user, ...updates };
      persistAuth({ token: state.token, user });
      return { user };
    });
  },
}));

