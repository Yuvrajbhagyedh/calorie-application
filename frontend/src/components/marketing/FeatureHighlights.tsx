const features = [
  {
    title: 'Smart calorie scoring',
    description: 'Each meal is tagged with micro/macro quality so you can balance enjoyment and recovery.',
  },
  {
    title: 'Admin visibility',
    description: 'Coaches and admins get live dashboards with every user trend and adherence metric.',
  },
  {
    title: 'Goal automation',
    description: 'Adaptive goals recalc every week based on your logged meals and body feedback.',
  },
  {
    title: 'Device-friendly',
    description: 'Syncs across desktop and mobile so logging a quick meal takes seconds.',
  },
];

import SectionHeader from './SectionHeader';

const FeatureHighlights = () => (
  <section
    id="features"
    style={{
      background: 'radial-gradient(circle at top, rgba(0, 216, 255, 0.08), transparent 55%)',
      padding: '80px 24px',
    }}
  >
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <SectionHeader
        label="Why Calorie IQ"
        title="Advanced tooling that feels effortless."
        description="Designed for nutrition coaches, athletes, and everyday users alike."
        align="center"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}
      >
        {features.map((feature) => (
          <div key={feature.title} className="card" style={{ minHeight: 160 }}>
            <h3 style={{ marginTop: 0 }}>{feature.title}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureHighlights;

