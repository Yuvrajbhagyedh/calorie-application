import { useMemo, useState } from 'react';
import type { Entry } from '../types';

interface EntryFormProps {
  onSubmit: (entry: Omit<Entry, 'id'>) => Promise<void>;
  compact?: boolean;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

const mealOptions: Record<MealType, Array<{ id: string; label: string; calories: number }>> = {
  breakfast: [
    { id: 'rava-idli', label: 'Rava idli & chutney', calories: 320 },
    { id: 'set-dosa', label: 'Set dosa (3 pieces)', calories: 280 },
    { id: 'khara-bath', label: 'Khara bath', calories: 350 },
    { id: 'bisi-bele-bath', label: 'Bisi bele bath', calories: 420 },
    { id: 'vada', label: 'Vada (2 pieces) & sambar', calories: 240 },
    { id: 'rava-kesari', label: 'Rava kesari', calories: 280 },
    { id: 'akki-rotti', label: 'Akki rotti & chutney', calories: 300 },
    { id: 'ragi-rotti', label: 'Ragi rotti & chutney', calories: 290 },
    { id: 'poori-saagu', label: 'Poori + saagu (2 pieces)', calories: 380 },
    { id: 'plain-dosa', label: 'Plain dosa & chutney', calories: 250 },
    { id: 'masala-dosa', label: 'Masala dosa', calories: 360 },
    { id: 'uttapam', label: 'Uttapam & chutney', calories: 310 },
  ],
  lunch: [
    { id: 'bisi-bele-bath-lunch', label: 'Bisi bele bath', calories: 450 },
    { id: 'ragi-mudde-saaru', label: 'Ragi mudde + saaru', calories: 380 },
    { id: 'jolada-rotti-enne', label: 'Jolada rotti + enne gai', calories: 420 },
    { id: 'akki-rotti-palya', label: 'Akki rotti + palya', calories: 400 },
    { id: 'rice-saaru-palya', label: 'Rice + saaru + palya', calories: 480 },
    { id: 'karnataka-thali', label: 'Karnataka thali', calories: 650 },
    { id: 'vangi-bath', label: 'Vangi bath', calories: 420 },
    { id: 'puliyogare', label: 'Puliyogare', calories: 400 },
    { id: 'chitranna', label: 'Chitranna (lemon rice)', calories: 380 },
    { id: 'rice-sambar-palya', label: 'Rice + sambar + palya', calories: 520 },
    { id: 'chapathi-saaru', label: 'Chapathi + saaru', calories: 450 },
    { id: 'veg-biryani', label: 'Veg biryani', calories: 580 },
  ],
  dinner: [
    { id: 'ragi-mudde-saaru-dinner', label: 'Ragi mudde + saaru', calories: 400 },
    { id: 'jolada-rotti-enne-dinner', label: 'Jolada rotti + enne gai', calories: 440 },
    { id: 'bisi-bele-bath-dinner', label: 'Bisi bele bath', calories: 460 },
    { id: 'curd-rice', label: 'Curd rice + pickle', calories: 420 },
    { id: 'rice-rasam-palya', label: 'Rice + rasam + palya', calories: 450 },
    { id: 'akki-rotti-chutney', label: 'Akki rotti + chutney', calories: 380 },
    { id: 'ragi-rotti-saaru', label: 'Ragi rotti + saaru', calories: 370 },
    { id: 'chapathi-palya', label: 'Chapathi + palya (2 pieces)', calories: 420 },
    { id: 'rice-saaru-dinner', label: 'Rice + saaru + gojju', calories: 480 },
    { id: 'vangi-bath-dinner', label: 'Vangi bath', calories: 440 },
    { id: 'puliyogare-dinner', label: 'Puliyogare', calories: 410 },
    { id: 'millet-bowl', label: 'Millet bowl + saaru', calories: 400 },
  ],
  snacks: [
    { id: 'masala-vada', label: 'Masala vada (2 pieces)', calories: 200 },
    { id: 'bajji', label: 'Bajji (onion/banana) - 2 pieces', calories: 180 },
    { id: 'churmuri', label: 'Churmuri', calories: 150 },
    { id: 'gobi-manchurian', label: 'Gobi manchurian', calories: 280 },
    { id: 'bonda', label: 'Bonda (2 pieces)', calories: 220 },
    { id: 'vada-pav', label: 'Vada pav', calories: 260 },
    { id: 'dahi-vada', label: 'Dahi vada (2 pieces)', calories: 240 },
    { id: 'rava-kesari-snack', label: 'Rava kesari', calories: 250 },
    { id: 'holige', label: 'Holige/Obbattu', calories: 320 },
    { id: 'tea-khara', label: 'Tea + khara mixture', calories: 180 },
    { id: 'fruit-bowl', label: 'Fruit bowl', calories: 150 },
    { id: 'buttermilk', label: 'Buttermilk (majjige)', calories: 80 },
  ],
};

const MEAL_PILLS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snacks: '🍿',
};

const EntryForm = ({ onSubmit, compact = true }: EntryFormProps) => {
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [dishId, setDishId] = useState(mealOptions.breakfast[0].id);
  const [mealTime, setMealTime] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomFood, setUseCustomFood] = useState(false);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const selectedDish = useMemo(
    () => mealOptions[mealType].find((d) => d.id === dishId) ?? mealOptions[mealType][0],
    [mealType, dishId],
  );

  const totalCal = useMemo(() => {
    if (useCustomFood) return (Number(customCalories) || 0) * quantity;
    return selectedDish.calories * quantity;
  }, [useCustomFood, customCalories, quantity, selectedDish]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    if (useCustomFood) {
      if (!customFoodName.trim()) {
        setError('Enter food name');
        setSubmitting(false);
        return;
      }
      if (!customCalories || Number(customCalories) <= 0) {
        setError('Enter valid calories');
        setSubmitting(false);
        return;
      }
    }
    try {
      await onSubmit({
        food: useCustomFood
          ? `${customFoodName} (${mealType})`
          : `${selectedDish.label} (${mealType})`,
        calories: useCustomFood ? Number(customCalories) * quantity : selectedDish.calories * quantity,
        mealTime: new Date(mealTime).toISOString(),
        notes,
      });
      setNotes('');
      setQuantity(1);
      if (useCustomFood) {
        setCustomFoodName('');
        setCustomCalories('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to save');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
  } as const;

  if (!compact) {
    return (
      <form className="card" onSubmit={handleSubmit} style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>Log meal</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          {(Object.keys(MEAL_PILLS) as MealType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setMealType(t); setDishId(mealOptions[t][0].id); }}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: mealType === t ? '2px solid var(--accent-strong)' : '1px solid var(--border)',
                background: mealType === t ? 'var(--bg-tertiary)' : 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {MEAL_PILLS[t]} {t}
            </button>
          ))}
        </div>
        {useCustomFood ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              value={customFoodName}
              onChange={(e) => setCustomFoodName(e.target.value)}
              placeholder="Food name"
              required
              style={{ ...inputStyle, width: '100%' }}
            />
            <input
              type="number"
              min={1}
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              placeholder="Cal"
              required
              style={{ ...inputStyle }}
            />
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <select
              value={dishId}
              onChange={(e) => setDishId(e.target.value)}
              style={{ ...inputStyle, width: '100%' }}
            >
              {mealOptions[mealType].map((d) => (
                <option key={d.id} value={d.id}>{d.label} — {d.calories} cal</option>
              ))}
            </select>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button type="button" onClick={() => setQuantity((q) => Math.max(0.25, q - 0.25))} style={{ ...inputStyle, width: 36, padding: '6px 0' }}>−</button>
            <input type="number" min={0.25} step={0.25} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 0.25)} style={{ ...inputStyle, width: 52, textAlign: 'center' }} />
            <button type="button" onClick={() => setQuantity((q) => q + 0.25)} style={{ ...inputStyle, width: 36, padding: '6px 0' }}>+</button>
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            {submitting ? '…' : 'Add'}
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{totalCal} cal</span>
        </div>
        <button type="button" onClick={() => setUseCustomFood(!useCustomFood)} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
          {useCustomFood ? '← Pick from list' : '+ Custom food'}
        </button>
        {showOptions && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'grid', gap: 8 }}>
            <input type="datetime-local" value={mealTime} onChange={(e) => setMealTime(e.target.value)} style={inputStyle} />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={2} style={inputStyle} />
            <button type="button" onClick={() => setShowOptions(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left' }}>Hide options</button>
          </div>
        )}
        {!showOptions && (
          <button type="button" onClick={() => setShowOptions(true)} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>+ Time & notes</button>
        )}
        {error && <p style={{ color: '#f87171', marginTop: 8, fontSize: '0.85rem' }}>{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(Object.keys(MEAL_PILLS) as MealType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setMealType(t); setDishId(mealOptions[t][0].id); }}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: mealType === t ? '2px solid var(--accent-strong)' : '1px solid var(--border)',
                background: mealType === t ? 'var(--bg-tertiary)' : 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {MEAL_PILLS[t]}
            </button>
          ))}
        </div>
        {useCustomFood ? (
          <>
            <input
              type="text"
              value={customFoodName}
              onChange={(e) => setCustomFoodName(e.target.value)}
              placeholder="Food"
              required
              style={{ ...inputStyle, width: 120 }}
            />
            <input
              type="number"
              min={1}
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              placeholder="Cal"
              required
              style={{ ...inputStyle, width: 64 }}
            />
          </>
        ) : (
          <select
            value={dishId}
            onChange={(e) => setDishId(e.target.value)}
            style={{ ...inputStyle, minWidth: 160, maxWidth: 220 }}
          >
            {mealOptions[mealType].map((d) => (
              <option key={d.id} value={d.id}>{d.label} — {d.calories} cal</option>
            ))}
          </select>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" onClick={() => setQuantity((q) => Math.max(0.25, q - 0.25))} style={{ ...inputStyle, width: 32, padding: '6px 0' }}>−</button>
          <input
            type="number"
            min={0.25}
            step={0.25}
            value={quantity}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') setQuantity(1);
              else setQuantity(Math.max(0.25, Number(v) || 1));
            }}
            placeholder="1"
            style={{ ...inputStyle, width: 56, textAlign: 'center', minWidth: 56 }}
          />
          <button type="button" onClick={() => setQuantity((q) => q + 0.25)} style={{ ...inputStyle, width: 32, padding: '6px 0' }}>+</button>
        </div>
        <strong style={{ fontSize: '0.9rem', color: 'var(--accent-strong)' }}>{Math.round(totalCal)} cal</strong>
        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
          {submitting ? '…' : 'Add'}
        </button>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setUseCustomFood(!useCustomFood)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          {useCustomFood ? '← List' : '+ Custom'}
        </button>
        {showOptions ? (
          <>
            <input type="datetime-local" value={mealTime} onChange={(e) => setMealTime(e.target.value)} style={{ ...inputStyle, width: 180 }} />
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" style={{ ...inputStyle, width: 120 }} />
            <button type="button" onClick={() => setShowOptions(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>Hide</button>
          </>
        ) : (
          <button type="button" onClick={() => setShowOptions(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>+ Time & notes</button>
        )}
      </div>
      {error && <p style={{ color: '#f87171', marginTop: 8, fontSize: '0.85rem' }}>{error}</p>}
    </form>
  );
};

export default EntryForm;
