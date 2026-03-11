import { format } from 'date-fns';
import type { Entry } from '../types';

interface EntryListProps {
  entries: Entry[];
  onDelete: (id: number) => Promise<void>;
}

const EntryList = ({ entries, onDelete }: EntryListProps) => {
  if (!entries.length) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        No entries yet. Start logging meals!
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
        maxHeight: 280,
        overflowY: 'auto',
        padding: '4px 0',
        paddingRight: 4,
      }}
      className="meal-history-grid"
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="card"
          style={{
            padding: 10,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            border: '1px solid var(--border)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--card-shadow)';
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong
              style={{
                display: 'block',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {entry.food}
            </strong>
            <p
              style={{
                margin: '4px 0 0 0',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
              }}
            >
              {format(new Date(entry.mealTime), 'MMM d, HH:mm')}
            </p>
            {entry.notes && (
              <small
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  display: 'block',
                  marginTop: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {entry.notes}
              </small>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginTop: 'auto',
              paddingTop: 8,
              borderTop: '1px solid var(--border)',
            }}
          >
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--accent-strong)',
              }}
            >
              {entry.calories} cal
            </span>
            <button
              type="button"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '4px 8px',
                borderRadius: 6,
                transition: 'color 0.2s, background 0.2s',
              }}
              onClick={() => onDelete(entry.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EntryList;
