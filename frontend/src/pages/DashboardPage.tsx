import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/marketing/LandingNavbar';
import Footer from '../components/marketing/Footer';
import EntryForm from '../components/EntryForm';
import EntryList from '../components/EntryList';
import StatsCards from '../components/StatsCards';
import { useEntries } from '../hooks/useEntries';
import { useAuthStore } from '../store/authStore';

const DashboardPage = () => {
  const { user, hydrated, initialize } = useAuthStore();
  const navigate = useNavigate();
  const { entries, loading, error, createEntry, deleteEntry } = useEntries();

  if (!hydrated) {
    initialize();
    return null;
  }

  if (!user) {
    navigate('/auth', { replace: true });
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <LandingNavbar variant="app" />
      <main style={{ padding: '24px 16px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ marginTop: 0, fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: 8 }}>
            Hi {user.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Track your meals and stay on top of your goals.</p>
        </div>
        <StatsCards entries={entries} dailyGoal={user.dailyCalorieGoal} />
        <div
          style={{
            marginTop: 24,
            display: 'grid',
            gap: 24,
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}
        >
          <EntryForm onSubmit={createEntry} />
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 320,
              maxHeight: 520,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 16,
                flexShrink: 0,
              }}
            >
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem' }}>Meal history</h3>
              {!loading && entries.length > 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </div>
            {loading && <p style={{ color: 'var(--text-muted)', padding: '24px 0' }}>Loading meals...</p>}
            {error && <p style={{ color: '#f87171', padding: '8px 0' }}>{error}</p>}
            {!loading && <EntryList entries={entries} onDelete={deleteEntry} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;

