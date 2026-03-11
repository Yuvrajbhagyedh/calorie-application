const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '7d' });

const buildUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  dailyCalorieGoal: user.dailyCalorieGoal,
  heightCm: null,
  weightKg: null,
});

// DEMO USER (no database)
const demoUser = {
  id: 1,
  name: "Demo User",
  email: "demo@demo.com",
  password: bcrypt.hashSync("123456", 10),
  role: "user",
  dailyCalorieGoal: 2000
};

router.post('/register', async (req, res) => {
  return res.json({
    message: "Demo mode: registration disabled",
    demoLogin: {
      email: "demo@demo.com",
      password: "123456"
    }
  });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== demoUser.email ||
      !bcrypt.compareSync(password, demoUser.password)
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(demoUser.id);

    return res.json({
      token,
      user: buildUserResponse(demoUser),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to log in" });
  }
});

module.exports = router;