import SectionHeader from './SectionHeader';

// Shutterstock-style placeholder images - using Unsplash URLs for demo
// Each URL is a distinct healthy meal shot (salads, bowls, balanced plates).
const imageUrls = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', // salad bowl
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80', // mixed bowl
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', // avocado toast plate
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVhbHRoeSUyMG1lYWx8ZW58MHx8MHx8&auto=format&fit=crop&w=1200&q=80', // veggie bowl variant
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aGVhbHRoeSUyMG1lYWx8ZW58MHx8MHx8&auto=format&fit=crop&w=1200&q=80', // grain + veg plate
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2FsbW9uJTIwYm93bHxlbnwwfHwwfHx8&auto=format&fit=crop&w=1200&q=80', // salmon bowl
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80', // poke-style bowl
  'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80', // breakfast bowl
];

const ImageGrid = () => (
  <section
    id="features"
    style={{
      background: 'radial-gradient(circle at top, rgba(0, 216, 255, 0.08), transparent 55%)',
      padding: '80px 24px',
    }}
  >
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <SectionHeader
        label="Why Calorie IQ"
        title="Visual inspiration for your journey."
        description="Discover healthy meals and lifestyle choices that align with your goals."
        align="center"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginTop: 48,
        }}
      >
        {imageUrls.map((url, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              aspectRatio: '4/3',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: 'var(--card-shadow)',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--card-shadow)';
            }}
          >
            <img
              src={url}
              alt={`Healthy meal ${idx + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ImageGrid;
