import type { Entry } from '../types';

interface StatsCardsProps {
  entries: Entry[];
  dailyGoal: number;
  userName?: string;
}

const StatsCards = ({ entries, dailyGoal, userName }: StatsCardsProps) => {
  const today = new Date().toDateString();
  const todayCalories = entries
    .filter((entry) => new Date(entry.mealTime).toDateString() === today)
    .reduce((sum, entry) => sum + entry.calories, 0);
  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
  const goal = dailyGoal || 2000;
  const pct = goal > 0 ? Math.min(100, (todayCalories / goal) * 100) : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid var(--border)',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {userName && (
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
            Welcome back, {userName}
          </span>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Today <strong style={{ color: 'var(--text-primary)' }}>{todayCalories}</strong> / {goal} cal
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          · <strong style={{ color: 'var(--text-primary)' }}>{entries.length}</strong> meals · <strong style={{ color: 'var(--text-primary)' }}>{totalCalories}</strong> total
        </span>
      </div>
      <div
        style={{
          width: 80,
          height: 6,
          borderRadius: 3,
          background: 'var(--bg-tertiary)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 3,
            background: pct >= 100 ? 'var(--accent-strong)' : 'var(--border-strong)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

export default StatsCards;
