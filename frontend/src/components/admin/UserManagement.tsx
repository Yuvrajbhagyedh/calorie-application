import { useState } from 'react';
import type { UserStats } from '../../types';
import api from '../../api/client';
import ConfirmModal from './ConfirmModal';

interface UserManagementProps {
  users: UserStats[];
  onUpdate: () => void;
}

const UserManagement = ({ users, onUpdate }: UserManagementProps) => {
  const [editingUser, setEditingUser] = useState<UserStats | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dailyCalorieGoal: 2000,
    heightCm: '',
    weightKg: '',
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  const handleEdit = (user: UserStats) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      dailyCalorieGoal: user.dailyCalorieGoal,
      heightCm: user.heightCm?.toString() || '',
      weightKg: user.weightKg?.toString() || '',
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        dailyCalorieGoal: formData.dailyCalorieGoal,
      };

      if (formData.heightCm) {
        payload.heightCm = parseFloat(formData.heightCm);
      } else {
        payload.heightCm = null;
      }

      if (formData.weightKg) {
        payload.weightKg = parseFloat(formData.weightKg);
      } else {
        payload.weightKg = null;
      }

      await api.put(`/api/admin/users/${editingUser.id}`, payload);
      setEditingUser(null);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setShowDeleteModal(null);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete user');
      setShowDeleteModal(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (userId: number) => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/admin/users/${userId}/password`, { password });
      setPassword('');
      setShowPasswordModal(null);
      alert('Password updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.8rem' }}>User Management</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem' }}>{users.length} total users</p>
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

      {users.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No users found</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(245, 222, 179, 0.2)' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Goal</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Height</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Weight</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: '1px solid rgba(245, 222, 179, 0.1)',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 15, 16, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '16px', color: 'var(--text-primary)', fontWeight: 500 }}>{user.name}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td style={{ padding: '16px', color: 'var(--accent-strong)', fontWeight: 600 }}>{user.dailyCalorieGoal} cal</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{user.heightCm ? `${user.heightCm} cm` : '—'}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{user.weightKg ? `${user.weightKg} kg` : '—'}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        className="btn"
                        onClick={() => handleEdit(user)}
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn"
                        onClick={() => setShowPasswordModal(user.id)}
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                      >
                        Password
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          className="btn"
                          onClick={() => setShowDeleteModal(user.id)}
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.9rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                          }}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setEditingUser(null)}
        >
          <div
            className="card"
            style={{ maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem' }}>Edit User: {editingUser.name}</h3>
              <button
                onClick={() => setEditingUser(null)}
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
            <div className="input-group">
              <label htmlFor="edit-name">Name</label>
              <input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="edit-email">Email</label>
              <input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="edit-goal">Daily Calorie Goal</label>
              <input
                id="edit-goal"
                type="number"
                min={800}
                max={10000}
                value={formData.dailyCalorieGoal}
                onChange={(e) => setFormData({ ...formData, dailyCalorieGoal: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="edit-height">Height (cm)</label>
              <input
                id="edit-height"
                type="number"
                min={50}
                max={300}
                step={0.1}
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="input-group">
              <label htmlFor="edit-weight">Weight (kg)</label>
              <input
                id="edit-weight"
                type="number"
                min={10}
                max={500}
                step={0.1}
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button className="btn" onClick={() => setEditingUser(null)} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowPasswordModal(null);
            setPassword('');
            setError(null);
          }}
        >
          <div
            className="card"
            style={{ maxWidth: 400, width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem' }}>Update Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(null);
                  setPassword('');
                  setError(null);
                }}
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
            <div className="input-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                className="btn btn-primary"
                onClick={() => handleUpdatePassword(showPasswordModal)}
                disabled={loading || !password}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowPasswordModal(null);
                  setPassword('');
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone. All user data including entries and orders will be permanently deleted."
          onConfirm={() => handleDelete(showDeleteModal)}
          onCancel={() => setShowDeleteModal(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;



















