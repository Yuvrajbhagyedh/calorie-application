import { useMemo } from 'react';
import { subDays, startOfDay, format } from 'date-fns';
import type { Entry } from '../../types';
import SectionHeader from './SectionHeader';

const buildChartData = (entries: Entry[]) => {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }).map((_, idx) => subDays(today, 6 - idx));
  const totals: Record<string, number> = {};

  entries.forEach((entry) => {
    const key = format(startOfDay(new Date(entry.mealTime)), 'yyyy-MM-dd');
    totals[key] = (totals[key] ?? 0) + entry.calories;
  });

  return days.map((day) => {
    const key = format(day, 'yyyy-MM-dd');
    return {
      label: format(day, 'EEE'),
      total: totals[key] ?? 0,
      key,
    };
  });
};

interface InsightsSectionProps {
  entries: Entry[];
  dailyGoal: number;
}

const InsightsSection = ({ entries, dailyGoal }: InsightsSectionProps) => {
  const chartData = useMemo(() => buildChartData(entries), [entries]);
  const average = chartData.length ? Math.round(chartData.reduce((sum, day) => sum + day.total, 0) / chartData.length) : 0;
  const goal = dailyGoal || 2000;

  return (
    <section
      id="insights"
      style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, rgba(0, 216, 255, 0.05), transparent)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionHeader
          label="Insights"
          title="Instant clarity on compliance."
          description="Your last 7 days at a glance. Stay close to the goal, spot dips, and react fast."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div className="card">
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Average intake</p>
            <strong style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>{average} cal</strong>
            <small style={{ color: 'var(--text-muted)' }}>vs goal {goal} cal</small>
          </div>
          <div className="card">
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Best day</p>
            <strong style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
              {chartData.length ? Math.max(...chartData.map((d) => d.total)) : 0} cal
            </strong>
          </div>
          <div className="card">
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Meals logged</p>
            <strong style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>{entries.length}</strong>
          </div>
        </div>
        <div className="card" style={{ paddingTop: 36 }}>
          <h3 style={{ marginTop: 0 }}>Past 7 days</h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 16,
              height: 240,
            }}
          >
            {chartData.length ? (
              chartData.map((day) => {
                const height = goal ? Math.min((day.total / goal) * 100, 120) : 0;
                return (
                  <div key={day.key} style={{ textAlign: 'center', flex: 1 }}>
                    <div
                      style={{
                        height: `${height}%`,
                        background:
                          height >= 100
                            ? 'linear-gradient(180deg, #a7f3d0, #34d399)'
                            : 'linear-gradient(180deg, #60a5fa, #2563eb)',
                        borderRadius: 14,
                        transition: 'height 0.3s ease',
                        boxShadow: '0 15px 30px rgba(37, 99, 235, 0.25)',
                      }}
                      title={`${day.total} cal`}
                    />
                    <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>{day.label}</p>
                  </div>
                );
              })
            ) : (
              <p>No meals logged yet. Start tracking to see insights.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;

