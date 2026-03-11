const express = require('express');
const { getPool } = require('../lib/db');

const router = express.Router();

router.get('/', async (_req, res) => {
  const pool = getPool();
  const [products] = await pool.query(
    `SELECT 
      id, 
      name, 
      description, 
      price, 
      image, 
      category, 
      in_stock AS inStock,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM products 
    WHERE in_stock = TRUE
    ORDER BY created_at DESC`
  );

  res.json(products);
});

router.get('/:id', async (req, res) => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
      id, 
      name, 
      description, 
      price, 
      image, 
      category, 
      in_stock AS inStock,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM products 
    WHERE id = ? AND in_stock = TRUE`,
    [req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(rows[0]);
});

module.exports = router;
