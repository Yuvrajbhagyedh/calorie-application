const jwt = require('jsonwebtoken');
const config = require('../config');
const { getPool } = require('../lib/db');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    try {
      // Normal mode: load user from DB.
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT id, name, email, role, daily_calorie_goal, height_cm, weight_kg FROM users WHERE id = ?',
        [payload.sub],
      );
      const user = rows[0];

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      return next();
    } catch (dbErr) {
      // Demo/offline mode: if DB is unavailable, fall back to the embedded user in the JWT.
      const u = payload.user;
      if (!u || !u.id) {
        console.error('Auth middleware DB error (no embedded user):', dbErr.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      // Provide both camelCase and snake_case fields because some routes expect DB column names.
      req.user = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'user',
        daily_calorie_goal: u.dailyCalorieGoal ?? 2000,
        height_cm: u.heightCm ?? null,
        weight_kg: u.weightKg ?? null,
      };
      return next();
    }
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireRole,
};

