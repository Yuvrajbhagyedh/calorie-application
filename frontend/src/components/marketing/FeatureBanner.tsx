import { useEffect, useState } from 'react';

const FeatureBanner = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section
      id="banner"
      className="feature-banner"
      style={{
        position: 'relative',
        minHeight: 'min(85vh, 560px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '80px 24px',
      }}
    >
      {/* Background image with parallax-style scale */}
      <div
        className="feature-banner-bg"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&q=80)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Multi-layer overlay: dark gradient + mesh glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(5,5,5,0.92) 0%, rgba(15,23,42,0.88) 50%, rgba(5,5,5,0.9) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(34, 197, 94, 0.12) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 80% at 80% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 720,
          textAlign: 'center',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <span
          className="feature-banner-badge"
          style={{
            display: 'inline-block',
            padding: '8px 18px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          Eat well. Track simple.
        </span>
        <h2
          style={{
            margin: '0 0 20px 0',
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 24px rgba(0,0,0,0.3)',
          }}
        >
          Small steps,
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #4ade80, #22c55e, #16a34a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            big results
          </span>
        </h2>
        <p
          style={{
            margin: '0 0 32px 0',
            fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.82)',
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Stay consistent with gentle tracking. No guilt, no overwhelm—just clarity.
        </p>
        <a
          href="#tracker"
          className="btn btn-primary feature-banner-cta"
          style={{
            padding: '16px 36px',
            fontSize: '1.05rem',
            fontWeight: 700,
            boxShadow: '0 12px 40px rgba(34, 197, 94, 0.35)',
            border: 'none',
          }}
        >
          Log your next meal →
        </a>
      </div>

      {/* Bottom fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: 'linear-gradient(to top, var(--bg-primary), transparent)',
          pointerEvents: 'none',
        }}
      />
    </section>
  );
};

export default FeatureBanner;
