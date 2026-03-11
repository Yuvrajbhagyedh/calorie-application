const Logo = ({ size = 32 }: { size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '12px',
        background: 'var(--text-primary)',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--bg-primary)',
        fontWeight: 700,
        fontSize: size * 0.45,
      }}
    >
      Qi
    </div>
    <span style={{ fontSize: size * 0.45, fontWeight: 800, color: 'var(--text-primary)' }}>Calorie IQ</span>
  </div>
);

export default Logo;

