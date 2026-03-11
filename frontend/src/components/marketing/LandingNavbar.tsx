import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import CartIcon from '../shop/CartIcon';
import ThemeToggle from '../ThemeToggle';
import HamburgerMenu from '../HamburgerMenu';
import { useAuthStore } from '../../store/authStore';

const marketingLinks = [
  { label: 'Home', target: 'hero' },
  { label: 'Features', target: 'features' },
  { label: 'Insights', target: 'insights' },
  { label: 'Planner', target: 'planner' },
  { label: 'Contact', target: 'footer' },
];

const appLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Growth', to: '/growth' },
  { label: 'Profile', to: '/profile' },
];

interface LandingNavbarProps {
  variant?: 'marketing' | 'app';
}

const LandingNavbar = ({ variant = 'marketing' }: LandingNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleScroll = (target: string) => {
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinks = useMemo(() => {
    if (variant === 'marketing') {
      return marketingLinks.map((link) => (
        <button
          key={link.target}
          style={{
            background: 'transparent',
            border: 'none',
            fontWeight: 600,
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
          onClick={() => handleScroll(link.target)}
        >
          {link.label}
        </button>
      ));
    }

    return appLinks.map((link) => (
      <button
        key={link.to}
        style={{
          background: 'transparent',
          border: 'none',
          fontWeight: 600,
          color: location.pathname === link.to ? 'var(--accent-strong)' : 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'color 0.2s ease',
        }}
        onClick={() => navigate(link.to)}
      >
        {link.label}
      </button>
    ));
  }, [variant, location.pathname, navigate]);

  return (
    <header
      className="main-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <Logo />
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: 'var(--text-primary)',
          }}
          className="desktop-nav"
        >
          {navLinks}
        </nav>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="desktop-nav" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ThemeToggle />
            {user ? (
              <>
                {variant === 'app' && <CartIcon />}
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    logout();
                    navigate('/auth');
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn" onClick={() => navigate('/auth')}>
                  Log in
                </button>
                <button className="btn btn-primary" onClick={() => handleScroll('planner')}>
                  Try planner
                </button>
              </>
            )}
          </div>
          <div className="mobile-nav" style={{ display: 'none' }}>
            <HamburgerMenu variant={variant} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;

