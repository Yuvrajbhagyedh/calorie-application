const HeroSection = () => (
  <section
    id="hero"
    style={{
      display: 'grid',
      placeItems: 'center',
      textAlign: 'center',
      padding: '90px 24px 70px',
      maxWidth: 900,
      margin: '0 auto',
    }}
  >
    <div>
      <h1 style={{ fontSize: 'clamp(2.6rem, 5vw, 4.5rem)', margin: '0 0 16px', color: 'var(--text-primary)' }}>
        Master your calories and stay on track with ease.
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.8, maxWidth: 640, margin: '0 auto 32px' }}>
        Smart logging, guided planning, and admin insights—all wrapped in a calming interface so you can focus on habits
        that matter.
      </p>
      <a className="btn btn-primary" href="#tracker" style={{ padding: '14px 32px', fontSize: '1rem', textDecoration: 'none' }}>
        Start tracking today
      </a>
    </div>
  </section>
);

export default HeroSection;

