import type { Entry } from '../types';

interface AdminEntriesPanelProps {
  entries: Entry[];
}

const AdminEntriesPanel = ({ entries }: AdminEntriesPanelProps) => (
  <div className="card" style={{ maxHeight: 500, overflowY: 'auto' }}>
    <h3 style={{ marginTop: 0 }}>User Entries</h3>
    {!entries.length ? (
      <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No entries logged yet. Select a user to view their entries.</p>
    ) : (
      entries.map((entry) => (
        <div
          key={entry.id}
          style={{
            borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
            padding: '16px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong style={{ color: '#0f172a', display: 'block', marginBottom: 4 }}>{entry.food}</strong>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              {new Date(entry.mealTime).toLocaleString()}
            </p>
            {entry.notes && (
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                {entry.notes}
              </p>
            )}
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>{entry.calories} cal</span>
        </div>
      ))
    )}
  </div>
);

export default AdminEntriesPanel;

