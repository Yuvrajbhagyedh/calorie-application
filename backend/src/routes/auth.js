const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../lib/db');
const config = require('../config');
const { registerSchema, loginSchema } = require('../lib/validators');

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '7d' });

const buildUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  dailyCalorieGoal: user.daily_calorie_goal,
  heightCm: user.height_cm ?? null,
  weightKg: user.weight_kg ?? null,
});

router.post('/register', async (req, res) => {
  try {
    const payload = registerSchema.parse(req.body);
    const pool = getPool();
    const email = payload.email.toLowerCase();

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = bcrypt.hashSync(payload.password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, daily_calorie_goal)
       VALUES (?, ?, ?, ?)`,
      [payload.name, email, passwordHash, payload.dailyCalorieGoal ?? 2000],
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = rows[0];
    const token = generateToken(user.id);

    return res.status(201).json({
      token,
      user: buildUserResponse(user),
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    }
    console.error(err);
    return res.status(500).json({ message: 'Unable to register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const payload = loginSchema.parse(req.body);
    const pool = getPool();
    const email = payload.email.toLowerCase();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !bcrypt.compareSync(payload.password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    return res.json({
      token,
      user: buildUserResponse(user),
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
    }
    console.error(err);
    return res.status(500).json({ message: 'Unable to log in' });
  }
});

module.exports = router;

