import { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';
import type { Order, PaymentMode } from '../../types/shop';

interface CheckoutModalProps {
  total: number;
  onClose: () => void;
  onPaymentComplete: (result: Order) => void;
}

const CheckoutModal = ({ total, onClose, onPaymentComplete }: CheckoutModalProps) => {
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create order
      const orderData = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        total,
        paymentMode,
        paymentDetails: paymentMode === 'upi' ? { upiId } : {},
      };

      const { data: order } = await api.post<Order>('/api/orders', orderData);

      onPaymentComplete({
        ...order,
        status: 'success',
        message: 'Payment successful! Your order has been placed.',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.8rem' }}>Checkout</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: 0,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Order Summary</p>
          <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            {items.map((item) => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  {item.product.name} × {item.quantity}
                </span>
                <span style={{ color: 'var(--accent-strong)' }}>
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 12,
                marginTop: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <strong style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>Total</strong>
              <strong style={{ color: 'var(--accent-strong)', fontSize: '1.5rem' }}>₹{total.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="paymentMode">Payment Method</label>
            <select
              id="paymentMode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              style={{
                border: '1px solid rgba(245, 222, 179, 0.2)',
                padding: 12,
                borderRadius: 12,
                fontSize: '1rem',
                background: '#090909',
                color: 'var(--text-primary)',
              }}
            >
              <option value="upi">UPI</option>
              <option value="card">Credit/Debit Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="wallet">Wallet</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {paymentMode === 'upi' && (
            <div className="input-group">
              <label htmlFor="upiId">UPI ID</label>
              <input
                id="upiId"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                required
              />
            </div>
          )}

          {paymentMode === 'cod' && (
            <div style={{ padding: 16, background: 'rgba(255, 187, 102, 0.1)', borderRadius: 8, marginBottom: 16 }}>
              <p style={{ color: 'var(--accent-strong)', margin: 0, fontSize: '0.9rem' }}>
                You will pay ₹{total.toLocaleString('en-IN')} when your order is delivered.
              </p>
            </div>
          )}

          {error && (
            <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.15)', borderRadius: 8, marginBottom: 16 }}>
              <p style={{ color: '#f87171', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{ flex: 1 }}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={processing}
            >
              {processing ? 'Processing...' : paymentMode === 'cod' ? 'Place Order' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
