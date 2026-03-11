import Logo from './Logo';

const Footer = () => (
  <footer
    id="footer"
    style={{
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      padding: '40px 24px 24px',
      borderTop: '1px solid var(--border)',
    }}
  >
    <div
      className="footer-grid"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 48,
        alignItems: 'start',
        textAlign: 'center',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Logo size={28} />
        </div>
        <p style={{ marginTop: 12, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Built for nutrition coaches, athletes, and anyone who wants a frictionless way to manage calories.
        </p>
      </div>
      <div style={{ minWidth: 140 }}>
        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Contact</p>
        <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>hello@calorieiq.app</p>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>+1 (555) 012-3344</p>
      </div>
      <div style={{ minWidth: 100 }}>
        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Links</p>
        <a href="#features" style={{ color: 'var(--text-muted)', display: 'block', textDecoration: 'none', fontSize: '0.9rem', marginTop: 8 }}>Features</a>
        <a href="#planner" style={{ color: 'var(--text-muted)', display: 'block', textDecoration: 'none', fontSize: '0.9rem', marginTop: 4 }}>Planner</a>
        <a href="/auth" style={{ color: 'var(--text-muted)', display: 'block', textDecoration: 'none', fontSize: '0.9rem', marginTop: 4 }}>Sign in</a>
      </div>
    </div>
    <p
      style={{
        maxWidth: 1100,
        margin: '32px auto 0',
        paddingTop: 24,
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
      }}
    >
      © {new Date().getFullYear()} Calorie IQ. All rights reserved.
    </p>
  </footer>
);

export default Footer;
