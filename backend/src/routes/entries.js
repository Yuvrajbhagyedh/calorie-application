const express = require('express');
const { getPool } = require('../lib/db');
const { entrySchema } = require('../lib/validators');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const toMysqlDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const pool = getPool();
  const [entries] = await pool.query(
    `SELECT
        id,
        food,
        calories,
        meal_time AS mealTime,
        notes,
        created_at AS createdAt,
        updated_at AS updatedAt
     FROM calorie_entries
     WHERE user_id = ?
     ORDER BY meal_time DESC`,
    [req.user.id],
  );

  res.json(entries);
});

router.post('/', async (req, res) => {
  try {
    const payload = entrySchema.parse(req.body);
    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO calorie_entries (user_id, food, calories, meal_time, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        payload.food,
        payload.calories,
        toMysqlDateTime(payload.mealTime),
        payload.notes ?? null,
      ],
    );

    const [rows] = await pool.query(
      `SELECT id, food, calories, meal_time AS mealTime, notes
       FROM calorie_entries
       WHERE id = ?`,
      [result.insertId],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.name === 'ZodError') {
      const issues = err.errors || err.issues || [];
      const message =
        issues.length > 0
          ? issues.map((e) => e.message).join(', ')
          : 'Invalid entry data';
      return res.status(400).json({ message });
    }
    if (err.message === 'Invalid date') {
      return res.status(400).json({ message: 'Invalid meal time format' });
    }
    console.error('Create entry error:', err.message);
    return res.status(500).json({ message: 'Unable to create entry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payload = entrySchema.partial().parse(req.body);
    const pool = getPool();
    // Replace SELECT * with explicit columns
    const [rows] = await pool.query(
      'SELECT id, user_id, food, calories, meal_time, notes FROM calorie_entries WHERE id = ?',
      [req.params.id]
    );
    const entry = rows[0];

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot edit this entry' });
    }

    await pool.query(
      `UPDATE calorie_entries
       SET food = ?, calories = ?, meal_time = ?, notes = ?
       WHERE id = ?`,
      [
        payload.food ?? entry.food,
        payload.calories ?? entry.calories,
        payload.mealTime ? toMysqlDateTime(payload.mealTime) : entry.meal_time,
        payload.notes ?? entry.notes,
        entry.id,
      ],
    );

    const [updatedRows] = await pool.query(
      `SELECT id, food, calories, meal_time AS mealTime, notes, updated_at AS updatedAt
       FROM calorie_entries WHERE id = ?`,
      [entry.id],
    );

    res.json(updatedRows[0]);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    }
    if (err.message === 'Invalid date') {
      return res.status(400).json({ message: 'Invalid meal time format' });
    }
    console.error('Update entry error:', err.message);
    return res.status(500).json({ message: 'Unable to update entry' });
  }
});

router.delete('/:id', async (req, res) => {
  const pool = getPool();
  // Replace SELECT * with explicit columns
  const [rows] = await pool.query(
    'SELECT id, user_id FROM calorie_entries WHERE id = ?',
    [req.params.id]
  );
  const entry = rows[0];

  if (!entry) {
    return res.status(404).json({ message: 'Entry not found' });
  }

  if (entry.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Cannot delete this entry' });
  }

  await pool.query('DELETE FROM calorie_entries WHERE id = ?', [entry.id]);

  res.status(204).send();
});

module.exports = router;

