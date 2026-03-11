const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool } = require('../lib/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { updateUserSchema, updatePasswordSchema, growthMetricSchema } = require('../lib/validators');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/users', async (_req, res) => {
  const pool = getPool();
  const [users] = await pool.query(
    `
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.daily_calorie_goal AS dailyCalorieGoal,
      u.height_cm AS heightCm,
      u.weight_kg AS weightKg,
      COUNT(e.id) AS entryCount,
      COALESCE(SUM(e.calories), 0) AS totalCalories,
      MAX(e.meal_time) AS lastMealTime,
      u.created_at AS createdAt
    FROM users u
    LEFT JOIN calorie_entries e ON e.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
    `,
  );

  res.json(users);
});

router.get('/users/:id', async (req, res) => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, name, email, role, daily_calorie_goal AS dailyCalorieGoal, 
     height_cm AS heightCm, weight_kg AS weightKg, created_at AS createdAt
     FROM users WHERE id = ?`,
    [req.params.id],
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(rows[0]);
});

router.put('/users/:id', async (req, res) => {
  try {
    const payload = updateUserSchema.parse(req.body);
    const pool = getPool();
    
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Whitelist of allowed column names for users table
    const allowedColumns = ['name', 'email', 'daily_calorie_goal', 'height_cm', 'weight_kg'];
    const updates = [];
    const values = [];

    if (payload.name !== undefined) {
      updates.push('name = ?');
      values.push(payload.name);
    }
    if (payload.email !== undefined) {
      // Check if email is already taken by another user
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [
        payload.email.toLowerCase(),
        req.params.id,
      ]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      updates.push('email = ?');
      values.push(payload.email.toLowerCase());
    }
    if (payload.dailyCalorieGoal !== undefined) {
      updates.push('daily_calorie_goal = ?');
      values.push(payload.dailyCalorieGoal);
    }
    if (payload.heightCm !== undefined) {
      updates.push('height_cm = ?');
      values.push(payload.heightCm);
    }
    if (payload.weightKg !== undefined) {
      updates.push('weight_kg = ?');
      values.push(payload.weightKg);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Validate that all update columns are in the whitelist
    const updateColumns = updates.map(u => u.split(' =')[0].trim());
    const invalidColumns = updateColumns.filter(col => !allowedColumns.includes(col));
    if (invalidColumns.length > 0) {
      return res.status(400).json({ message: 'Invalid column names' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query(
      `SELECT id, name, email, role, daily_calorie_goal AS dailyCalorieGoal, 
       height_cm AS heightCm, weight_kg AS weightKg, created_at AS createdAt
       FROM users WHERE id = ?`,
      [req.params.id],
    );

    res.json(updated[0]);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    }
    console.error('Update user error:', err.message);
    return res.status(500).json({ message: 'Unable to update user' });
  }
});

router.patch('/users/:id/password', async (req, res) => {
  try {
    const payload = updatePasswordSchema.parse(req.body);
    const pool = getPool();

    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use async bcrypt instead of sync
    const passwordHash = await bcrypt.hash(payload.password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, req.params.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    }
    console.error('Update password error:', err.message);
    return res.status(500).json({ message: 'Unable to update password' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const pool = getPool();
  
  const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (rows[0].role === 'admin') {
    return res.status(403).json({ message: 'Cannot delete admin users' });
  }

  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

router.get('/users/:id/entries', async (req, res) => {
  const pool = getPool();
  const [entries] = await pool.query(
    `
    SELECT id, food, calories, meal_time AS mealTime, notes
    FROM calorie_entries
    WHERE user_id = ?
    ORDER BY meal_time DESC
    `,
    [req.params.id],
  );

  res.json(entries);
});

router.get('/users/:id/growth', async (req, res) => {
  const pool = getPool();
  const [metrics] = await pool.query(
    `
    SELECT id, height_cm AS heightCm, weight_kg AS weightKg, bmi, 
           recorded_at AS recordedAt, notes, created_at AS createdAt
    FROM growth_metrics
    WHERE user_id = ?
    ORDER BY recorded_at DESC
    `,
    [req.params.id],
  );

  res.json(metrics);
});

router.post('/users/:id/growth', async (req, res) => {
  try {
    const payload = growthMetricSchema.parse(req.body);
    const pool = getPool();

    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate BMI if both height and weight are provided
    let bmi = null;
    if (payload.heightCm && payload.weightKg) {
      const heightM = payload.heightCm / 100;
      bmi = payload.weightKg / (heightM * heightM);
      bmi = Math.round(bmi * 100) / 100; // Round to 2 decimal places
    }

    const [result] = await pool.query(
      `INSERT INTO growth_metrics (user_id, height_cm, weight_kg, bmi, recorded_at, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.params.id,
        payload.heightCm ?? null,
        payload.weightKg ?? null,
        bmi,
        payload.recordedAt ? new Date(payload.recordedAt).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' '),
        payload.notes ?? null,
      ],
    );

    // Update user's current height/weight if provided
    if (payload.heightCm || payload.weightKg) {
      const allowedColumns = ['height_cm', 'weight_kg'];
      const updates = [];
      const values = [];
      if (payload.heightCm) {
        updates.push('height_cm = ?');
        values.push(payload.heightCm);
      }
      if (payload.weightKg) {
        updates.push('weight_kg = ?');
        values.push(payload.weightKg);
      }
      if (updates.length > 0) {
        // Validate columns are whitelisted
        const updateColumns = updates.map(u => u.split(' =')[0].trim());
        const invalidColumns = updateColumns.filter(col => !allowedColumns.includes(col));
        if (invalidColumns.length === 0) {
          values.push(req.params.id);
          await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        }
      }
    }

    const [newMetric] = await pool.query(
      `SELECT id, height_cm AS heightCm, weight_kg AS weightKg, bmi, 
       recorded_at AS recordedAt, notes, created_at AS createdAt
       FROM growth_metrics WHERE id = ?`,
      [result.insertId],
    );

    res.status(201).json(newMetric[0]);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    }
    console.error('Create growth metric error:', err.message);
    return res.status(500).json({ message: 'Unable to create growth metric' });
  }
});

// Product Management Routes
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, image, category, inStock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, image, category, in_stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, price, image || null, category || null, inStock !== false],
    );

    const [newProduct] = await pool.query(
      `SELECT id, name, description, price, image, category, in_stock AS inStock,
       created_at AS createdAt, updated_at AS updatedAt
       FROM products WHERE id = ?`,
      [result.insertId],
    );

    res.status(201).json(newProduct[0]);
  } catch (err) {
    console.error('Create product error:', err.message);
    return res.status(500).json({ message: 'Unable to create product' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { name, description, price, image, category, inStock } = req.body;
    const pool = getPool();

    const [rows] = await pool.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description || null);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (image !== undefined) {
      updates.push('image = ?');
      values.push(image || null);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category || null);
    }
    if (inStock !== undefined) {
      updates.push('in_stock = ?');
      values.push(inStock);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query(
      `SELECT id, name, description, price, image, category, in_stock AS inStock,
       created_at AS createdAt, updated_at AS updatedAt
       FROM products WHERE id = ?`,
      [req.params.id],
    );

    res.json(updated[0]);
  } catch (err) {
    console.error('Update product error:', err.message);
    return res.status(500).json({ message: 'Unable to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  const pool = getPool();

  const [rows] = await pool.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

module.exports = router;

