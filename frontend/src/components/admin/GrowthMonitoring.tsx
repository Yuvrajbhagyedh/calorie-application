import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { UserStats, GrowthMetric } from '../../types';
import api from '../../api/client';

interface GrowthMonitoringProps {
  users: UserStats[];
}

const GrowthMonitoring = ({ users }: GrowthMonitoringProps) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<GrowthMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    heightCm: '',
    weightKg: '',
    recordedAt: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  useEffect(() => {
    if (selectedUserId) {
      fetchMetrics(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchMetrics = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<GrowthMetric[]>(`/api/admin/users/${userId}/growth`);
      setMetrics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load growth metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = async () => {
    if (!selectedUserId) return;

    if (!formData.heightCm && !formData.weightKg) {
      setError('Please enter at least height or weight');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post(`/api/admin/users/${selectedUserId}/growth`, {
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
        recordedAt: new Date(formData.recordedAt).toISOString(),
        notes: formData.notes || null,
      });
      setFormData({
        heightCm: '',
        weightKg: '',
        recordedAt: new Date().toISOString().slice(0, 16),
        notes: '',
      });
      setShowAddModal(false);
      fetchMetrics(selectedUserId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to add growth metric');
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const chartData = metrics.map((m) => ({
    date: new Date(m.recordedAt).toLocaleDateString(),
    height: m.heightCm,
    weight: m.weightKg,
    bmi: m.bmi,
  }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="user-select" style={{ display: 'block', marginBottom: 8, color: '#64748b' }}>
          Select User
        </label>
        <select
          id="user-select"
          value={selectedUserId || ''}
          onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
          style={{
            padding: '12px',
            borderRadius: '12px',
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid rgba(15, 23, 42, 0.2)',
            minWidth: 300,
          }}
        >
          <option value="">Select a user...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ padding: 12, background: 'rgba(248, 113, 113, 0.2)', borderRadius: 8, marginBottom: 16, color: '#f87171' }}>
          {error}
        </div>
      )}

      {selectedUserId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>
              Growth Metrics: {selectedUser?.name}
            </h3>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              Add Metric
            </button>
          </div>

          {loading && <p>Loading metrics...</p>}

          {!loading && metrics.length > 0 && (
            <>
              <div className="card" style={{ marginBottom: 24 }}>
                <h4>Height & Weight Chart</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.1)" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis yAxisId="left" stroke="#64748b" />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid rgba(15, 23, 42, 0.2)',
                        borderRadius: 8,
                        color: '#0f172a',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="height"
                      stroke="#0f172a"
                      strokeWidth={2}
                      name="Height (cm)"
                      dot={{ fill: '#0f172a', r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="weight"
                      stroke="#64748b"
                      strokeWidth={2}
                      name="Weight (kg)"
                      dot={{ fill: '#64748b', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card" style={{ marginBottom: 24 }}>
                <h4>BMI Chart</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.1)" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid rgba(15, 23, 42, 0.2)',
                        borderRadius: 8,
                        color: '#0f172a',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bmi"
                      stroke="#f87171"
                      strokeWidth={2}
                      name="BMI"
                      dot={{ fill: '#f87171', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          <div className="card">
            <h4>History</h4>
            {metrics.length === 0 ? (
              <p>No growth metrics recorded yet.</p>
            ) : (
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {metrics.map((metric) => (
                  <div
                    key={metric.id}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#0f172a' }}>
                        {new Date(metric.recordedAt).toLocaleString()}
                      </strong>
                      <div style={{ marginTop: 8, color: '#64748b', fontSize: '0.9rem' }}>
                        {metric.heightCm && <span>Height: {metric.heightCm} cm</span>}
                        {metric.heightCm && metric.weightKg && <span> • </span>}
                        {metric.weightKg && <span>Weight: {metric.weightKg} kg</span>}
                        {metric.bmi && <span> • BMI: {metric.bmi}</span>}
                      </div>
                      {metric.notes && (
                        <p style={{ marginTop: 4, color: '#64748b', fontSize: '0.85rem' }}>{metric.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showAddModal && (
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
            setShowAddModal(false);
            setError(null);
          }}
        >
          <div
            className="card"
            style={{ maxWidth: 500, width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add Growth Metric</h3>
            <div className="input-group">
              <label htmlFor="add-height">Height (cm)</label>
              <input
                id="add-height"
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
              <label htmlFor="add-weight">Weight (kg)</label>
              <input
                id="add-weight"
                type="number"
                min={10}
                max={500}
                step={0.1}
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="input-group">
              <label htmlFor="add-date">Recorded At</label>
              <input
                id="add-date"
                type="datetime-local"
                value={formData.recordedAt}
                onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="add-notes">Notes</label>
              <textarea
                id="add-notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                className="btn btn-primary"
                onClick={handleAddMetric}
                disabled={loading || (!formData.heightCm && !formData.weightKg)}
              >
                {loading ? 'Adding...' : 'Add Metric'}
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowAddModal(false);
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
    </div>
  );
};

export default GrowthMonitoring;



















