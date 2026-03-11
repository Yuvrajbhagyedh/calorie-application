import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/marketing/LandingNavbar';
import Footer from '../components/marketing/Footer';
import CheckoutModal from '../components/shop/CheckoutModal';
import PaymentResultModal from '../components/shop/PaymentResultModal';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import type { Order } from '../types/shop';
import type { Product } from '../types/shop';

const CartPage = () => {
  const { user, hydrated, initialize } = useAuthStore();
  const { items, updateQuantity, removeFromCart, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentResult, setPaymentResult] = useState<Order | null>(null);

  useEffect(() => {
    if (!hydrated) {
      initialize();
    }
  }, [hydrated, initialize]);

  useEffect(() => {
    if (hydrated && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, hydrated, navigate]);

  // Validate cart items against database
  useEffect(() => {
    const validateCartItems = async () => {
      if (!user || items.length === 0) return;

      try {
        const { data: products } = await api.get<Product[]>('/api/products');
        const validProductIds = new Set(products.map(p => p.id));
        
        // Remove invalid items from cart
        const invalidItems = items.filter(item => !validProductIds.has(item.product.id));
        if (invalidItems.length > 0) {
          invalidItems.forEach(item => {
            removeFromCart(item.product.id);
          });
          alert(`Some items in your cart are no longer available and have been removed.`);
        }
      } catch (error) {
        console.error('Failed to validate cart items:', error);
      }
    };

    if (hydrated && user && items.length > 0) {
      validateCartItems();
    }
  }, [hydrated, user, items, removeFromCart]);

  if (!hydrated || !user) {
    return null;
  }

  const total = getTotal();
  const isEmpty = items.length === 0;

  const handleCheckout = () => {
    if (isEmpty) return;
    setShowCheckout(true);
  };

  const handlePaymentComplete = (result: Order) => {
    setShowCheckout(false);
    setPaymentResult(result);
    if (result.status === 'success') {
      clearCart();
    }
  };

  const handleClosePaymentResult = () => {
    setPaymentResult(null);
    if (paymentResult?.status === 'success') {
      navigate('/shop');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <LandingNavbar variant="app" />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
        <div className="card">
          <h1 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Shopping Cart</h1>

          {isEmpty ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: 24 }}>🛒</div>
              <h2 style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '1.5rem' }}>Your cart is empty</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '1rem' }}>
                Add some products from the shop to get started!
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/shop')}>
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: 16,
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      background: 'var(--bg-tertiary)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-strong)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '1px solid rgba(245, 222, 179, 0.1)',
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.product.name}</h3>
                      {item.product.description && (
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                          {item.product.description}
                        </p>
                      )}
                      {item.product.category && (
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 12px 0', fontSize: '0.85rem' }}>
                          Category: {item.product.category}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <label htmlFor={`qty-${item.product.id}`} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Quantity:
                          </label>
                          <input
                            id={`qty-${item.product.id}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value, 10);
                              if (!isNaN(qty) && qty > 0) {
                                updateQuantity(item.product.id, qty);
                              }
                            }}
                            style={{
                              width: 60,
                              padding: '6px 8px',
                              background: 'var(--input-bg)',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              color: 'var(--text-primary)',
                              fontSize: '0.9rem',
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }} />
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Price per unit</p>
                          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </p>
                          <p style={{ margin: '4px 0 0 0', color: 'var(--accent-strong)', fontSize: '1.2rem', fontWeight: 600 }}>
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: 6,
                            color: '#f87171',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 32,
                  padding: 24,
                  background: 'var(--bg-tertiary)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem' }}>Total Items</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem' }}>Total Amount</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-strong)' }}>
                      ₹{total.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button className="btn" onClick={() => navigate('/shop')} style={{ flex: 1 }}>
                    Continue Shopping
                  </button>
                  <button className="btn btn-primary" onClick={handleCheckout} style={{ flex: 1 }}>
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      {showCheckout && (
        <CheckoutModal total={total} onClose={() => setShowCheckout(false)} onPaymentComplete={handlePaymentComplete} />
      )}

      {paymentResult && (
        <PaymentResultModal result={paymentResult} onClose={handleClosePaymentResult} />
      )}
    </div>
  );
};

export default CartPage;
