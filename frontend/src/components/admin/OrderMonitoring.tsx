import { useEffect, useState } from 'react';
import api from '../../api/client';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  image?: string | null;
  category?: string | null;
}

interface Order {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  total: number;
  paymentMode: string;
  status: 'success' | 'failed' | 'pending';
  message?: string;
  createdAt: string;
  itemCount: number;
  items: OrderItem[];
}

interface OrderStats {
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: number;
}

const OrderMonitoring = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Order[]>('/api/orders/admin');
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get<OrderStats>('/api/orders/admin/stats');
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load order stats:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#c4b5fd';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return <p style={{ color: '#f87171' }}>{error}</p>;
  }

  return (
    <div style={{ minWidth: 0, overflow: 'hidden' }}>
      <h2 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Order Monitoring</h2>

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div className="card" style={{ padding: 16 }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Orders</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {stats.totalOrders}
            </p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Successful</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>
              {stats.successfulOrders}
            </p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Revenue</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              ₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : '0'}
            </p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Avg Order Value</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              ₹{stats.averageOrderValue ? stats.averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Last 7 Days</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {stats.recentOrders}
            </p>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden', minWidth: 0 }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
        <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Order ID</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Customer</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Items</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Payment</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px', color: 'var(--text-primary)' }}>#{order.id}</td>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{order.userName}</p>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {order.userEmail}
                      </p>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{order.itemCount}</td>
                  <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    ₹{order.total ? order.total.toLocaleString('en-IN') : '0'}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                    {order.paymentMode}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status),
                        border: `1px solid ${getStatusColor(order.status)}40`,
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      className="btn"
                      onClick={() => setSelectedOrder(order)}
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="card"
            style={{ maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Order Details #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Customer</p>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{selectedOrder.userName}</p>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {selectedOrder.userEmail}
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Order Items</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: 12,
                      background: 'var(--bg-tertiary)',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                    }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 6,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{item.productName}</p>
                      {item.category && (
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {item.category}
                        </p>
                      )}
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Quantity: {item.quantity} × ₹{item.productPrice ? item.productPrice.toLocaleString('en-IN') : '0'} = ₹
                        {item.subtotal ? item.subtotal.toLocaleString('en-IN') : '0'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: 16,
                background: 'var(--bg-tertiary)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Amount</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  ₹{selectedOrder.total ? selectedOrder.total.toLocaleString('en-IN') : '0'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Payment Mode</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  {selectedOrder.paymentMode}
                </p>
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Status: <span style={{ color: getStatusColor(selectedOrder.status) }}>{selectedOrder.status}</span>
              </p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: 'auto' }}>
                {formatDate(selectedOrder.createdAt)}
              </p>
            </div>

            {selectedOrder.message && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedOrder.message}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderMonitoring;

