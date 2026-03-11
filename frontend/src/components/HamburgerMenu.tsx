import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import CartIcon from './shop/CartIcon';

interface HamburgerMenuProps {
  variant?: 'marketing' | 'app';
}

const HamburgerMenu = ({ variant = 'app' }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

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

  const handleScroll = (target: string) => {
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsOpen(false);
  };

  const handleNavClick = (to: string) => {
    navigate(to);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'transparent',
          border: 'none',
          padding: 8,
          cursor: 'pointer',
          zIndex: 1001,
        }}
      >
        <span
          style={{
            width: 24,
            height: 2,
            background: 'var(--text-primary)',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
          }}
        />
        <span
          style={{
            width: 24,
            height: 2,
            background: 'var(--text-primary)',
            transition: 'all 0.3s ease',
            opacity: isOpen ? 0 : 1,
          }}
        />
        <span
          style={{
            width: 24,
            height: 2,
            background: 'var(--text-primary)',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none',
          }}
        />
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />
          <nav
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '280px',
              height: '100vh',
              background: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border)',
              padding: '80px 24px 24px',
              zIndex: 1000,
              overflowY: 'auto',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {variant === 'marketing'
                ? marketingLinks.map((link) => (
                    <button
                      key={link.target}
                      onClick={() => handleScroll(link.target)}
                      style={{
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        fontSize: '1rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        borderRadius: 8,
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {link.label}
                    </button>
                  ))
                : appLinks.map((link) => (
                    <button
                      key={link.to}
                      onClick={() => handleNavClick(link.to)}
                      style={{
                        padding: '12px 16px',
                        background: location.pathname === link.to ? 'var(--bg-tertiary)' : 'transparent',
                        border: 'none',
                        color: location.pathname === link.to ? 'var(--accent-strong)' : 'var(--text-primary)',
                        textAlign: 'left',
                        fontSize: '1rem',
                        fontWeight: location.pathname === link.to ? 600 : 500,
                        cursor: 'pointer',
                        borderRadius: 8,
                        transition: 'background 0.2s ease',
                      }}
                    >
                      {link.label}
                    </button>
                  ))}

              {user && variant === 'app' && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <CartIcon />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.name}</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      logout();
                      navigate('/auth');
                      setIsOpen(false);
                    }}
                    style={{ width: '100%' }}
                  >
                    Logout
                  </button>
                </div>
              )}

              {!user && variant === 'marketing' && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button className="btn" onClick={() => { navigate('/auth'); setIsOpen(false); }} style={{ width: '100%' }}>
                    Log in
                  </button>
                  <button className="btn btn-primary" onClick={() => { handleScroll('planner'); setIsOpen(false); }} style={{ width: '100%' }}>
                    Try planner
                  </button>
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default HamburgerMenu;
