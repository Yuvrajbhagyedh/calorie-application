import { useState, useEffect } from 'react';
import api from '../../api/client';
import type { Product } from '../../types/shop';
import ConfirmModal from './ConfirmModal';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    inStock: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Product[]>('/api/products');
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
      inStock: true,
    });
    setShowAddModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image: product.image || '',
      category: product.category || '',
      inStock: product.inStock,
    });
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        image: formData.image || null,
        category: formData.category || null,
        inStock: formData.inStock,
      };

      if (editingProduct) {
        await api.put(`/api/admin/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/api/admin/products', payload);
      }

      setShowAddModal(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to save product');
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      await api.delete(`/api/admin/products/${productId}`);
      setShowDeleteModal(null);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete product');
      setShowDeleteModal(null);
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.8rem' }}>Product Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Product
        </button>
      </div>

      {error && (
        <div
          className="card"
          style={{
            padding: 16,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            marginBottom: 24,
          }}
        >
          <p style={{ margin: 0, color: '#f87171' }}>{error}</p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No products found. Add your first product!</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
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
                    borderRadius: 8,
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
                    }}
                  >
                    {product.category}
                  </p>
                )}
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  {product.name}
                </h3>
                {product.description && (
                  <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {product.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-strong)' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: product.inStock ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: product.inStock ? '#10b981' : '#ef4444',
                    }}
                  >
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    className="btn"
                    onClick={() => handleEdit(product)}
                    style={{ flex: 1, fontSize: '0.9rem' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn"
                    onClick={() => setShowDeleteModal(product.id)}
                    style={{
                      flex: 1,
                      fontSize: '0.9rem',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.8rem' }}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleSave}>
              <div className="input-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    border: '1px solid rgba(245, 222, 179, 0.2)',
                    padding: 12,
                    borderRadius: 12,
                    fontSize: '1rem',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="input-group">
                  <label htmlFor="price">Price (₹) *</label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="category">Category</label>
                  <input
                    id="category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="image">Image URL</label>
                <input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  <span>In Stock</span>
                </label>
              </div>

              {error && (
                <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.15)', borderRadius: 8, marginBottom: 16 }}>
                  <p style={{ margin: 0, color: '#f87171' }}>{error}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={() => handleDelete(showDeleteModal)}
          onCancel={() => setShowDeleteModal(null)}
        />
      )}
    </div>
  );
};

export default ProductManagement;
