import { useEffect } from 'react';
import LandingNavbar from '../components/marketing/LandingNavbar';
import HeroSection from '../components/marketing/HeroSection';
import ImageGrid from '../components/marketing/ImageGrid';
import GoalEstimator from '../components/marketing/GoalEstimator';
import Footer from '../components/marketing/Footer';
import StatsCards from '../components/StatsCards';
import EntryForm from '../components/EntryForm';
import EntryList from '../components/EntryList';
import { useEntries } from '../hooks/useEntries';
import { useAuthStore } from '../store/authStore';

const HomePage = () => {
  const { user, initialize, hydrated } = useAuthStore();
  const { entries, loading, error, createEntry, deleteEntry } = useEntries();

  useEffect(() => {
    if (!hydrated) {
      initialize();
    }
  }, [hydrated, initialize]);

  if (!user) {
    return null;
  }

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <LandingNavbar variant="app" />
      <div
        className="sticky-tracker-nav"
        style={{
          position: 'sticky',
          top: 56,
          zIndex: 10,
          background: 'var(--bg-secondary)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            gap: 12,
            padding: '12px 24px',
            overflowX: 'auto',
          }}
        >
          {[
            { label: 'Tracker', href: '#tracker' },
            { label: 'Planner', href: '#planner' },
            { label: 'Growth', href: '/growth' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                textDecoration: 'none',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: '0.9rem',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <HeroSection />
      <ImageGrid />
      <section
        id="tracker"
        style={{
          padding: '32px 16px',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <div className="card" style={{ padding: '20px 24px' }}>
          <StatsCards entries={entries} dailyGoal={user.dailyCalorieGoal} userName={user.name} />
          <div style={{ marginBottom: 20 }}>
            <EntryForm onSubmit={createEntry} compact />
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Recent</span>
              {!loading && entries.length > 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{entries.length} entries</span>
              )}
            </div>
            {loading && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Loading…</p>}
            {error && <p style={{ color: '#f87171', fontSize: '0.9rem', margin: 0 }}>{error}</p>}
            {!loading && <EntryList entries={entries} onDelete={deleteEntry} />}
          </div>
        </div>
      </section>
      <GoalEstimator />
      <Footer />
    </div>
  );
};

export default HomePage;
