import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type Mode = 'login' | 'register';

const AuthPage = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dailyCalorieGoal: 2000,
  });
  const { login, register, user, loading, error, initialize, hydrated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (hydrated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [user, hydrated, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'login') {
      await login(form.email, form.password);
    } else {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        dailyCalorieGoal: Number(form.dailyCalorieGoal),
      });
    }
  };

  if (!hydrated) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: 'var(--bg-primary)', overflowX: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 420, minHeight: 380 }} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16, background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <h2 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{mode === 'login' ? 'Welcome Back' : 'Create an account'}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 24 }}>
          {mode === 'login' ? 'Log in to continue tracking your meals.' : 'Start logging calories in seconds.'}
        </p>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
          )}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {mode === 'register' && (
            <div className="input-group">
              <label htmlFor="dailyCalorieGoal">Daily goal (cal)</label>
              <input
                id="dailyCalorieGoal"
                name="dailyCalorieGoal"
                type="number"
                min={800}
                max={10000}
                value={form.dailyCalorieGoal}
                onChange={handleChange}
                required
              />
            </div>
          )}
          {error && <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
        <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <>
              Need an account?{' '}
              <button 
                style={{ 
                  border: 'none', 
                  background: 'transparent', 
                  color: 'var(--accent-strong)', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }} 
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                style={{ 
                  border: 'none', 
                  background: 'transparent', 
                  color: 'var(--accent-strong)', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }} 
                onClick={() => setMode('login')}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

