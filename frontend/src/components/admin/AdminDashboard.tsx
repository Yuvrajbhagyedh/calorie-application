import { useEffect, useState } from 'react';
import api from '../../api/client';
import type { UserStats } from '../../types';

interface AdminDashboardProps {
  users: UserStats[];
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalEntries: number;
  totalCalories: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

const AdminDashboard = ({ users }: AdminDashboardProps) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/api/orders/admin').catch(() => ({ data: [] })),
        api.get('/api/products').catch(() => ({ data: [] })),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];

      const totalUsers = users.length;
      const activeUsers = users.filter((u) => (Number(u.entryCount) || 0) > 0).length;
      const totalEntries = users.reduce((sum, u) => sum + (Number(u.entryCount) || 0), 0);
      const totalCalories = users.reduce((sum, u) => sum + (Number(u.totalCalories) || 0), 0);
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
      const totalProducts = products.length;

      setStats({
        totalUsers,
        activeUsers,
        totalEntries,
        totalCalories,
        totalOrders,
        totalRevenue,
        totalProducts,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
      </div>
    );
  }

  const num = (n: number | string | undefined | null) => Number(n) || 0;
  const fmtInt = (n: number | string | undefined | null) =>
    Math.round(num(n)).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const fmtCurrency = (n: number | string | undefined | null) =>
    `₹${Math.round(num(n)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const statCards = [
    {
      title: 'Total Users',
      value: fmtInt(stats?.totalUsers),
      icon: '👥',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.15)',
    },
    {
      title: 'Active Users',
      value: fmtInt(stats?.activeUsers),
      icon: '✅',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
    },
    {
      title: 'Total Entries',
      value: fmtInt(stats?.totalEntries),
      icon: '📝',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.15)',
    },
    {
      title: 'Total Calories',
      value: fmtInt(stats?.totalCalories),
      icon: '🔥',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
    },
    {
      title: 'Total Orders',
      value: fmtInt(stats?.totalOrders),
      icon: '📦',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
    },
    {
      title: 'Total Revenue',
      value: fmtCurrency(stats?.totalRevenue),
      icon: '💰',
      color: 'var(--accent-strong)',
      bg: 'rgba(255, 187, 102, 0.15)',
    },
    {
      title: 'Total Products',
      value: fmtInt(stats?.totalProducts),
      icon: '🛍️',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.15)',
    },
    {
      title: 'Avg Calories/User',
      value: fmtInt(
        stats?.totalUsers ? num(stats.totalCalories) / Math.max(1, stats.totalUsers) : 0,
      ),
      icon: '📊',
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.15)',
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        {statCards.map((card, index) => (
          <div
            key={index}
            className="card"
            style={{
              background: card.bg,
              border: `1px solid ${card.color}40`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 10px 30px ${card.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.45)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>
                  {card.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: card.color,
                  }}
                >
                  {card.value}
                </p>
              </div>
              <div
                style={{
                  fontSize: '2.5rem',
                  opacity: 0.8,
                }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: 20 }}>
          Recent Users
        </h3>
        {users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No users yet</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                style={{
                  padding: 16,
                  background: 'rgba(15, 15, 16, 0.6)',
                  borderRadius: 8,
                  border: '1px solid rgba(245, 222, 179, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {user.name}
                  </p>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {user.email}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, color: 'var(--accent-strong)', fontWeight: 600 }}>
                    {Math.round(Number(user.entryCount) || 0)} entries
                  </p>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {Math.round(Number(user.totalCalories) || 0)} cal
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
