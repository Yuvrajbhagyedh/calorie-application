interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  maxWidth?: number;
}

const SectionHeader = ({
  label,
  title,
  description,
  align = 'left',
  maxWidth,
}: SectionHeaderProps) => (
  <div style={{ textAlign: align, maxWidth: maxWidth ? `${maxWidth}px` : 'none', margin: align === 'center' ? '0 auto 32px' : '0 0 32px' }}>
    <span
      style={{
        display: 'inline-flex',
        padding: '4px 14px',
        borderRadius: 999,
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        letterSpacing: 4,
        textTransform: 'uppercase',
        fontSize: '0.7rem',
      }}
    >
      {label}
    </span>
    <h2 style={{ fontSize: '2.2rem', margin: '12px 0 8px', color: 'var(--text-primary)' }}>{title}</h2>
    {description && <p style={{ color: 'var(--text-muted)', margin: 0 }}>{description}</p>}
  </div>
);

export default SectionHeader;

