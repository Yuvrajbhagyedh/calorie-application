const express = require('express');
const cors = require('cors');
const config = require('./config');
const { initDb } = require('./lib/db');

const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entries');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const chatRoutes = require('./routes/chat');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

const start = async () => {
  try {
    await initDb();
    app.listen(config.port, () => {
      console.log(`API server listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database', error);
    process.exit(1);
  }
};

start();

