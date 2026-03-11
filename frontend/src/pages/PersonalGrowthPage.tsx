import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
} from 'recharts';
import { useEntries } from '../hooks/useEntries';
import { useAuthStore } from '../store/authStore';
import LandingNavbar from '../components/marketing/LandingNavbar';
import Footer from '../components/marketing/Footer';

const PersonalGrowthPage = () => {
  const { user, hydrated, initialize } = useAuthStore();
  const { entries, loading, error } = useEntries();

  if (!hydrated) {
    initialize();
    return null;
  }

  if (!user) {
    return null;
  }

  const { chartData, timeline, bestDay, average } = useMemo(() => {
    if (!entries.length) {
      return {
        chartData: [],
        timeline: [],
        bestDay: null,
        average: 0,
      };
    }

    const sorted = [...entries].sort(
      (a, b) => new Date(a.mealTime).getTime() - new Date(b.mealTime).getTime(),
    );
    const start = startOfDay(new Date(sorted[0].mealTime));
    const end = startOfDay(new Date());
    const days = eachDayOfInterval({ start, end });

    const grouped: Record<
      string,
      {
        total: number;
        meals: typeof entries;
      }
    > = {};

    sorted.forEach((entry) => {
      const key = format(new Date(entry.mealTime), 'yyyy-MM-dd');
      if (!grouped[key]) {
        grouped[key] = { total: 0, meals: [] };
      }
      grouped[key].total += entry.calories;
      grouped[key].meals.push(entry);
    });

    const data = days.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      return {
        date: format(day, 'MMM d'),
        total: grouped[key]?.total ?? 0,
      };
    });

    const best = data.reduce(
      (acc, day) => (day.total > acc.total ? day : acc),
      { date: '', total: 0 },
    );
    const avg = data.length ? Math.round(data.reduce((sum, d) => sum + d.total, 0) / data.length) : 0;

    const timelineData = days
      .map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        return {
          dateLabel: format(day, 'PPP'),
          meals: grouped[key]?.meals ?? [],
          total: grouped[key]?.total ?? 0,
        };
      })
      .reverse();

    return {
      chartData: data,
      timeline: timelineData,
      bestDay: best.date ? best : null,
      average: avg,
    };
  }, [entries]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <LandingNavbar variant="app" />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        <section style={{ marginBottom: 24 }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: 4, color: 'var(--accent-strong)', fontWeight: 700 }}>
            Personal growth
          </p>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', margin: '8px 0', color: 'var(--text-primary)' }}>Your journey in numbers</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Every logged meal contributes to your trend line. Track adherence and momentum from your very
            first entry to today.
          </p>
        </section>

        <section className="card" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Average daily intake</p>
              <strong style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{average} cal</strong>
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Best day</p>
              <strong style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
                {bestDay ? `${bestDay.total} cal` : '—'}{' '}
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{bestDay?.date}</span>
              </strong>
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Total meals logged</p>
              <strong style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{entries.length}</strong>
            </div>
          </div>
          <div style={{ height: 320 }}>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-strong)" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="var(--accent-strong)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: `1px solid var(--border)` }} />
                  <Area type="monotone" dataKey="total" stroke="var(--accent-strong)" fill="url(#colorCal)" />
                  <Line type="monotone" dataKey="total" stroke="var(--accent-strong)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No meals logged yet. Once you add entries, your growth chart appears here.</p>
            )}
          </div>
        </section>

        <section>
          <h2>Daily timeline</h2>
          {loading && <p>Loading timeline...</p>}
          {error && <p style={{ color: '#f87171' }}>{error}</p>}
          {!loading && timeline.length === 0 && <p>No meal history yet. Start logging to see progress.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {timeline.map((day) => (
              <div key={day.dateLabel} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{day.dateLabel}</p>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>{day.total} cal</strong>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{day.meals.length} meals</p>
                </div>
                {day.meals.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {day.meals.map((meal) => (
                      <div
                        key={meal.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 999,
                          background: 'rgba(255, 187, 102, 0.08)',
                          border: '1px solid rgba(255, 187, 102, 0.25)',
                        }}
                      >
                        {meal.food} · {meal.calories} cal
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonalGrowthPage;

