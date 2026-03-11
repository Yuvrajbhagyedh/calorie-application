import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

const CartIcon = () => {
  const navigate = useNavigate();
  const getItemCount = useCartStore((state) => state.getItemCount);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setCount(getItemCount());
    };

    updateCount();
    const interval = setInterval(updateCount, 500);

    return () => clearInterval(interval);
  }, [getItemCount]);

  return (
    <button
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        position: 'relative',
        padding: '8px',
      }}
      onClick={() => navigate('/cart')}
    >
      <span style={{ fontSize: '1.2rem' }}>🛒</span>
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
            color: '#fff',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

export default CartIcon;

























