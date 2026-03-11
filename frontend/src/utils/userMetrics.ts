const streakKey = (userId: number) => `streak:${userId}`;
const profileKey = (userId: number) => `profile:${userId}`;

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export interface StreakInfo {
  streak: number;
  lastLogin: string | null;
  firstLogin: string | null;
}

export const readLoginStreak = (userId: number): StreakInfo => {
  const raw = localStorage.getItem(streakKey(userId));
  if (!raw) {
    return { streak: 0, lastLogin: null, firstLogin: null };
  }
  try {
    return JSON.parse(raw) as StreakInfo;
  } catch {
    return { streak: 0, lastLogin: null, firstLogin: null };
  }
};

export const touchLoginStreak = (userId: number) => {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const existing = readLoginStreak(userId);

  if (existing.lastLogin === today) {
    return existing;
  }

  const newStreak = existing.lastLogin === yesterday ? existing.streak + 1 : 1;
  const payload: StreakInfo = {
    streak: newStreak,
    lastLogin: today,
    firstLogin: existing.firstLogin ?? today,
  };

  localStorage.setItem(streakKey(userId), JSON.stringify(payload));
  return payload;
};

export interface ProfileSettings {
  weight: number | null;
  height: number | null;
}

export const readProfileSettings = (userId: number): ProfileSettings => {
  const raw = localStorage.getItem(profileKey(userId));
  if (!raw) {
    return { weight: null, height: null };
  }
  try {
    const parsed = JSON.parse(raw) as ProfileSettings;
    return {
      weight: parsed.weight === 0 || parsed.weight === undefined ? null : parsed.weight,
      height: parsed.height === 0 || parsed.height === undefined ? null : parsed.height,
    };
  } catch {
    return { weight: null, height: null };
  }
};

export const saveProfileSettings = (userId: number, settings: ProfileSettings) => {
  const normalized = {
    weight: settings.weight === 0 ? null : settings.weight,
    height: settings.height === 0 ? null : settings.height,
  };
  localStorage.setItem(profileKey(userId), JSON.stringify(normalized));
};

