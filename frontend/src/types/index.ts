export type Role = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  dailyCalorieGoal: number;
  dob?: string | null;
  phone?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Entry {
  id: number;
  food: string;
  calories: number;
  mealTime: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats extends User {
  entryCount: number;
  totalCalories: number;
  lastMealTime: string | null;
}

export interface GrowthMetric {
  id: number;
  heightCm?: number | null;
  weightKg?: number | null;
  bmi?: number | null;
  recordedAt: string;
  notes?: string | null;
  createdAt?: string;
}

