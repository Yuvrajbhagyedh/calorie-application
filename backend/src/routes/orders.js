const express = require('express');
const { getPool } = require('../lib/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const pool = getPool();
  const userId = req.user.id;
  const { items, total, paymentMode, paymentDetails } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items are required' });
  }

  if (!total || total <= 0) {
    return res.status(400).json({ message: 'Invalid total amount' });
  }

  if (!paymentMode) {
    return res.status(400).json({ message: 'Payment mode is required' });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total, payment_mode, status, message)
       VALUES (?, ?, ?, 'success', ?)`,
      [
        userId,
        total,
        paymentMode,
        paymentMode === 'cod' ? 'Order placed successfully. Payment on delivery.' : 'Payment successful! Your order has been placed.',
      ]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of items) {
      const [product] = await connection.query(
        'SELECT price FROM products WHERE id = ? AND in_stock = TRUE',
        [item.productId]
      );

      if (product.length === 0) {
        throw new Error(`Product ${item.productId} not found or out of stock`);
      }

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, product[0].price]
      );
    }

    await connection.commit();

    // Fetch complete order with items
    const [orders] = await connection.query(
      `SELECT 
        o.id,
        o.user_id AS userId,
        o.total,
        o.payment_mode AS paymentMode,
        o.status,
        o.message,
        o.created_at AS createdAt,
        u.name AS userName,
        u.email AS userEmail,
        COUNT(oi.id) AS itemCount
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ?
      GROUP BY o.id`,
      [orderId]
    );

    const [orderItems] = await connection.query(
      `SELECT 
        oi.id,
        oi.product_id AS productId,
        oi.quantity,
        oi.price,
        p.name AS productName,
        p.image,
        p.category
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?`,
      [orderId]
    );

    connection.release();

    const order = {
      ...orders[0],
      items: orderItems.map(item => ({
        product: {
          id: item.productId,
          name: item.productName,
          price: parseFloat(item.price),
          image: item.image,
          category: item.category,
        },
        quantity: item.quantity,
      })),
    };

    res.status(201).json(order);
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message || 'Failed to create order' });
  }
});

router.get('/admin', requireRole('admin'), async (req, res) => {
  const pool = getPool();
  
  const [orders] = await pool.query(
    `SELECT 
      o.id,
      o.user_id AS userId,
      o.total,
      o.payment_mode AS paymentMode,
      o.status,
      o.message,
      o.created_at AS createdAt,
      u.name AS userName,
      u.email AS userEmail,
      COUNT(oi.id) AS itemCount
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC`
  );

  res.json(orders);
});

module.exports = router;
