import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/marketing/LandingNavbar';
import Footer from '../components/marketing/Footer';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import ProductManagement from '../components/admin/ProductManagement';
import OrderMonitoring from '../components/admin/OrderMonitoring';
import GrowthMonitoring from '../components/admin/GrowthMonitoring';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAuthStore } from '../store/authStore';

type Tab = 'dashboard' | 'users' | 'products' | 'orders' | 'growth';

const AdminPage = () => {
  const { user, initialize, hydrated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { users, loading, error, fetchUsers } = useAdminUsers(
    hydrated && user?.role === 'admin',
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (!hydrated) {
    return null;
  }

  if (!user) {
    navigate('/auth', { replace: true });
    return null;
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'products', label: 'Products', icon: '🛍️' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'growth', label: 'Growth', icon: '📈' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <LandingNavbar variant="app" />
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px', overflowX: 'hidden', minWidth: 0 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ marginTop: 0, fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: 8 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Manage users, products, orders, and monitor application activity.
          </p>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 24,
            borderBottom: '2px solid var(--border)',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid var(--accent-strong)' : '3px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-strong)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content - contain layout to prevent horizontal shake */}
        <div style={{ minWidth: 0, overflow: 'hidden', minHeight: 360 }}>
          {loading && activeTab === 'dashboard' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            </div>
          )}

          {error && activeTab === 'dashboard' && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: '#f87171' }}>{error}</p>
            </div>
          )}

          {!loading && activeTab === 'dashboard' && <AdminDashboard users={users} />}
          {activeTab === 'users' && <UserManagement users={users} onUpdate={fetchUsers} />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'orders' && <OrderMonitoring />}
          {activeTab === 'growth' && <GrowthMonitoring users={users} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
