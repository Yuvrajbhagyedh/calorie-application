const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

const generateToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      // Embed minimal user info so the app can run without a DB.
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        dailyCalorieGoal: user.dailyCalorieGoal ?? 2000,
        heightCm: user.heightCm ?? null,
        weightKg: user.weightKg ?? null,
      },
    },
    config.jwtSecret,
    { expiresIn: '7d' },
  );

const buildUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  dailyCalorieGoal: user.dailyCalorieGoal,
  heightCm: null,
  weightKg: null,
});

// In-memory users (no database)
const usersByEmail = new Map();
let nextUserId = 2;

const demoUser = {
  id: 1,
  name: "Demo User",
  email: "demo@demo.com",
  password: bcrypt.hashSync("123456", 10),
  role: "user",
  dailyCalorieGoal: 2000
};

usersByEmail.set(demoUser.email, demoUser);

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, dailyCalorieGoal } = req.body || {};
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const displayName = String(name || '').trim();
    const rawPassword = String(password || '');

    if (!displayName || !normalizedEmail || rawPassword.length < 4) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (usersByEmail.has(normalizedEmail)) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const newUser = {
      id: nextUserId++,
      name: displayName,
      email: normalizedEmail,
      password: bcrypt.hashSync(rawPassword, 10),
      role: 'user',
      dailyCalorieGoal: Number(dailyCalorieGoal) || 2000,
    };
    usersByEmail.set(normalizedEmail, newUser);

    const token = generateToken(newUser);
    return res.json({
      token,
      user: buildUserResponse(newUser),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unable to register' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const user = usersByEmail.get(normalizedEmail);

    if (!user || !bcrypt.compareSync(String(password || ''), user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to log in" });
  }
});

module.exports = router;