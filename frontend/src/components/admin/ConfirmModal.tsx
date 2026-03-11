interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
}: ConfirmModalProps) => {
  const colors = {
    danger: {
      border: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      button: 'rgba(239, 68, 68, 0.2)',
      text: '#ef4444',
    },
    warning: {
      border: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      button: 'rgba(245, 158, 11, 0.2)',
      text: '#f59e0b',
    },
    info: {
      border: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
      button: 'rgba(59, 130, 246, 0.2)',
      text: '#3b82f6',
    },
  };

  const colorScheme = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 24,
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          background: colorScheme.bg,
          border: `2px solid ${colorScheme.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: '3rem',
            marginBottom: 16,
          }}
        >
          {type === 'danger' ? '⚠️' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>

        <h2
          style={{
            marginTop: 0,
            marginBottom: 16,
            color: colorScheme.text,
            fontSize: '1.5rem',
          }}
        >
          {title}
        </h2>

        <div
          style={{
            padding: 20,
            background: '#f8f9fa',
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '1rem',
              background: '#f8f9fa',
              color: '#0f172a',
            }}
          >
            {cancelText}
          </button>
          <button
            className="btn"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '1rem',
              background: colorScheme.button,
              color: colorScheme.text,
              fontWeight: 600,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;



















