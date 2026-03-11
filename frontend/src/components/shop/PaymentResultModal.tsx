import type { Order } from '../../types/shop';

interface PaymentResultModalProps {
  result: Order;
  onClose: () => void;
}

const PaymentResultModal = ({ result, onClose }: PaymentResultModalProps) => {
  const isSuccess = result.status === 'success';

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
          textAlign: 'center',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: isSuccess
                ? 'rgba(34, 197, 94, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '3rem',
            }}
          >
            {isSuccess ? '✓' : '✗'}
          </div>
          <h2
            style={{
              margin: 0,
              color: isSuccess ? '#22c55e' : '#ef4444',
              fontSize: '2rem',
              marginBottom: 8,
            }}
          >
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </h2>
          {result.message && (
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1rem' }}>{result.message}</p>
          )}
        </div>

        {isSuccess && (
          <div
            style={{
              background: 'rgba(15, 15, 16, 0.6)',
              padding: 20,
              borderRadius: 12,
              marginBottom: 24,
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>#{result.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
              <span style={{ color: 'var(--accent-strong)', fontWeight: 600, fontSize: '1.2rem' }}>
                ₹{result.total.toLocaleString('en-IN')}
              </span>
            </div>
            {result.paymentMode && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <span style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  {result.paymentMode}
                </span>
              </div>
            )}
          </div>
        )}

        <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
          {isSuccess ? 'Continue Shopping' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default PaymentResultModal;
