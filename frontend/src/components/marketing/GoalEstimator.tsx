import { useState } from 'react';
import SectionHeader from './SectionHeader';

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  intense: 1.725,
};

const GoalEstimator = () => {
  const [weight, setWeight] = useState<number | ''>(70);
  const [height, setHeight] = useState<number | ''>(170);
  const [goal, setGoal] = useState<'loss' | 'maintain' | 'gain'>('maintain');
  const [activity, setActivity] = useState<keyof typeof activityMultipliers>('moderate');
  const [target, setTarget] = useState(() => Math.round(70 * 22 * activityMultipliers.moderate));

  const calculate = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    const w = typeof weight === 'number' ? weight : 70;
    const h = typeof height === 'number' ? height : 170;
    const maintenance = Math.round(w * 22 * activityMultipliers[activity]);
    const adjustment = goal === 'loss' ? -400 : goal === 'gain' ? 300 : 0;
    setTarget(maintenance + adjustment);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/^0+/, '') || '';
    setWeight(cleaned === '' ? '' : Number(cleaned));
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/^0+/, '') || '';
    setHeight(cleaned === '' ? '' : Number(cleaned));
  };

  return (
    <section
      id="planner"
      style={{
        padding: '80px 24px',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
          alignItems: 'center',
        }}
      >
        <SectionHeader
          label="Interactive planner"
          title="Estimate your daily target in seconds."
          description="Adjust your stats and we’ll propose a starting point you can refine inside the dashboard."
        />
        <form className="card" onSubmit={calculate}>
          <div className="input-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              min={35}
              max={180}
              value={weight}
              onChange={handleWeightChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              id="height"
              type="number"
              min={120}
              max={230}
              value={height}
              onChange={handleHeightChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="activity">Activity</label>
            <select
              id="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value as keyof typeof activityMultipliers)}
              style={{ padding: 12, borderRadius: 12, border: 'none' }}
            >
              <option value="sedentary">Sedentary · desk job</option>
              <option value="light">Light · 1-2 workouts</option>
              <option value="moderate">Moderate · 3-5 workouts</option>
              <option value="intense">Intense · daily training</option>
            </select>
          </div>
          <div className="input-group">
            <label>Goal</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['loss', 'maintain', 'gain'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGoal(option)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 999,
                    border: `1px solid ${goal === option ? 'var(--accent-strong)' : 'var(--border)'}`,
                    background: goal === option ? 'var(--accent-strong)' : 'transparent',
                    color: goal === option ? 'var(--bg-primary)' : 'var(--text-primary)',
                    fontWeight: 600,
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }}>
            Calculate
          </button>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ marginBottom: 4, color: 'var(--text-muted)' }}>Suggested calories</p>
            <h3 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text-primary)' }}>{target} cal</h3>
            <small style={{ color: 'var(--text-muted)' }}>
              Maint. reference: {(typeof weight === 'number' ? weight : 70) * 22} cal · Height: {typeof height === 'number' ? height : 170} cm
            </small>
          </div>
        </form>
      </div>
    </section>
  );
};

export default GoalEstimator;

