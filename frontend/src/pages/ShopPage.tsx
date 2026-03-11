import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/marketing/LandingNavbar';
import Footer from '../components/marketing/Footer';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import type { Product } from '../types/shop';

const ShopPage = () => {
  const { user, hydrated, initialize } = useAuthStore();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<Product[]>('/api/products');
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (hydrated && user) {
      fetchProducts();
    }
  }, [hydrated, user]);

  if (!hydrated || !user) {
    return null;
  }

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <LandingNavbar variant="app" />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ marginTop: 0, fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: 8 }}>
            Shop
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Discover premium fitness products and supplements
          </p>
        </div>

        {categories.length > 0 && (
          <div style={{ marginBottom: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                border: selectedCategory === null ? '1px solid var(--accent-strong)' : '1px solid var(--border)',
                background: selectedCategory === null ? 'var(--btn-secondary-bg)' : 'transparent',
                color: selectedCategory === null ? 'var(--accent-strong)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 999,
                  border: selectedCategory === category ? '1px solid var(--accent-strong)' : '1px solid var(--border)',
                  background: selectedCategory === category ? 'var(--btn-secondary-bg)' : 'transparent',
                  color: selectedCategory === category ? 'var(--accent-strong)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading products...</p>
          </div>
        )}

        {error && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: '#f87171', fontSize: '1.1rem' }}>{error}</p>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No products found in this category.</p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.45)';
                }}
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 12,
                      marginBottom: 16,
                      border: '1px solid rgba(245, 222, 179, 0.1)',
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  {product.category && (
                    <p
                      style={{
                        margin: '0 0 8px 0',
                        color: 'var(--accent-strong)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      {product.category}
                    </p>
                  )}
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                    {product.name}
                  </h3>
                  {product.description && (
                    <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {product.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-strong)' }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ShopPage;
