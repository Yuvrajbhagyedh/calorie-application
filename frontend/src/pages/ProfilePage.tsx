import { useEffect, useMemo, useState } from 'react';
import LandingNavbar from '../components/marketing/LandingNavbar';
import Footer from '../components/marketing/Footer';
import { useAuthStore } from '../store/authStore';
import { useEntries } from '../hooks/useEntries';
import { readLoginStreak, readProfileSettings, saveProfileSettings } from '../utils/userMetrics';
import api from '../api/client';
import type { ProfileSettings } from '../utils/userMetrics';

const toNum = (v: number | null | undefined): number | null =>
  v === undefined || v === null || v === 0 ? null : v;

const ProfilePage = () => {
  const { user, hydrated, initialize, updateUser } = useAuthStore();
  const { entries } = useEntries();
  const [form, setForm] = useState<ProfileSettings>({ weight: null, height: null });
  const [savedMessage, setSavedMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const streak = user ? readLoginStreak(user.id) : { streak: 0, lastLogin: null, firstLogin: null };

  useEffect(() => {
    if (!hydrated) {
      initialize();
    }
  }, [hydrated, initialize]);

  useEffect(() => {
    if (user) {
      const local = readProfileSettings(user.id);
      const fromBackend = {
        height: toNum(user.heightCm ?? undefined),
        weight: toNum(user.weightKg ?? undefined),
      };
      setForm({
        height: toNum(local.height) ?? fromBackend.height ?? null,
        weight: toNum(local.weight) ?? fromBackend.weight ?? null,
      });
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const firstEntryDate = useMemo(() => {
    if (!entries.length) return null;
    const first = entries.reduce((earliest, current) =>
      new Date(current.mealTime) < new Date(earliest.mealTime) ? current : earliest,
    );
    return new Date(first.mealTime).toLocaleDateString();
  }, [entries]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Remove leading zeros and handle empty string
    const cleaned = value.replace(/^0+/, '') || '';
    const num = cleaned === '' ? null : Number(cleaned);
    setForm((prev) => ({
      ...prev,
      [name]: num === 0 || num === null ? null : num,
    }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      saveProfileSettings(user.id, form);
      const payload = {
        heightCm: form.height ?? null,
        weightKg: form.weight ?? null,
      };
      const { data } = await api.patch<{ heightCm: number | null; weightKg: number | null }>(
        '/api/users/me/profile',
        payload,
      );
      updateUser({ heightCm: data.heightCm ?? undefined, weightKg: data.weightKg ?? undefined });
      setSavedMessage('Profile updated');
      setTimeout(() => setSavedMessage(''), 2000);
    } catch {
      setSavedMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <LandingNavbar variant="app" />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', display: 'grid', gap: 24 }}>
        <section className="card">
          <h1 style={{ marginTop: 0, fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: 8 }}>Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 24 }}>Manage your personal stats and see your streaks.</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>Daily login streak</p>
              <strong style={{ fontSize: '2.5rem', color: 'var(--accent-strong)', display: 'block', marginBottom: 4 }}>{streak.streak} days</strong>
              {streak.lastLogin && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Last login: {new Date(streak.lastLogin).toLocaleDateString()}</p>}
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>Started tracking</p>
              <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)', display: 'block' }}>
                {streak.firstLogin
                  ? new Date(streak.firstLogin).toLocaleDateString()
                  : firstEntryDate ?? 'Log your first meal'}
              </strong>
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>Meals logged</p>
              <strong style={{ fontSize: '2.5rem', color: 'var(--accent-strong)', display: 'block' }}>{entries.length}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: 16 }}>Body metrics</h2>
          <form onSubmit={handleSave}>
            <div className="input-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                name="weight"
                type="number"
                min={30}
                max={250}
                value={form.weight !== null && form.weight !== undefined && form.weight !== 0 ? form.weight : ''}
                onChange={handleChange}
                placeholder="e.g. 72"
              />
            </div>
            <div className="input-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                id="height"
                name="height"
                type="number"
                min={120}
                max={230}
                value={form.height !== null && form.height !== undefined && form.height !== 0 ? form.height : ''}
                onChange={handleChange}
                placeholder="e.g. 178"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            {savedMessage && <p style={{ color: 'var(--accent-strong)' }}>{savedMessage}</p>}
          </form>
        </section>

        <section className="card">
          <h2 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: 16 }}>Consistency tips</h2>
          <ul style={{ color: 'var(--text-muted)', paddingLeft: 20 }}>
            <li>Log at least one meal per day to keep your streak alive.</li>
            <li>Review personal growth weekly to spot trends early.</li>
            <li>Update your weight/height monthly to keep macros aligned.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;

