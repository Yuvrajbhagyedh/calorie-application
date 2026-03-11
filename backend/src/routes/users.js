const express = require('express');
const { getPool } = require('../lib/db');
const { authMiddleware } = require('../middleware/auth');
const { updateGoalSchema, updateProfileSchema } = require('../lib/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/me', (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    dailyCalorieGoal: req.user.daily_calorie_goal,
    heightCm: req.user.height_cm ?? null,
    weightKg: req.user.weight_kg ?? null,
  });
});

router.patch('/me/goal', async (req, res) => {
  try {
    const payload = updateGoalSchema.parse(req.body);
    const pool = getPool();
    await pool.query(
      `UPDATE users
       SET daily_calorie_goal = ?
       WHERE id = ?`,
      [payload.dailyCalorieGoal, req.user.id],
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, role, daily_calorie_goal, height_cm AS heightCm, weight_kg AS weightKg FROM users WHERE id = ?',
      [req.user.id],
    );
    const updated = rows[0];

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      dailyCalorieGoal: updated.daily_calorie_goal,
      heightCm: updated.heightCm ?? null,
      weightKg: updated.weightKg ?? null,
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    }
    console.error('Update goal error:', err.message);
    return res.status(500).json({ message: 'Unable to update goal' });
  }
});

router.patch('/me/profile', async (req, res) => {
  try {
    const payload = updateProfileSchema.parse(req.body);
    const pool = getPool();
    const updates = [];
    const values = [];
    if (payload.heightCm !== undefined) {
      updates.push('height_cm = ?');
      values.push(payload.heightCm);
    }
    if (payload.weightKg !== undefined) {
      updates.push('weight_kg = ?');
      values.push(payload.weightKg);
    }
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No profile fields to update' });
    }
    values.push(req.user.id);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values,
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, role, daily_calorie_goal, height_cm AS heightCm, weight_kg AS weightKg FROM users WHERE id = ?',
      [req.user.id],
    );
    const updated = rows[0];

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      dailyCalorieGoal: updated.daily_calorie_goal,
      heightCm: updated.heightCm ?? null,
      weightKg: updated.weightKg ?? null,
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    }
    console.error('Update profile error:', err.message);
    return res.status(500).json({ message: 'Unable to update profile' });
  }
});

module.exports = router;

