const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../config');

let pool;

const createDatabaseIfNeeded = async () => {
  const { host, port, user, password, database } = config.db;
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.end();
};

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      ...config.db,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  }
  return pool;
};

const createTables = async () => {
  const poolInstance = getPool();

  await poolInstance.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      daily_calorie_goal INT DEFAULT 2000,
      height_cm DECIMAL(5,2),
      weight_kg DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Add height/weight columns if they don't exist (for existing databases)
  try {
    await poolInstance.query('ALTER TABLE users ADD COLUMN height_cm DECIMAL(5,2)');
  } catch (err) {
    // Column already exists, ignore
  }
  try {
    await poolInstance.query('ALTER TABLE users ADD COLUMN weight_kg DECIMAL(5,2)');
  } catch (err) {
    // Column already exists, ignore
  }

  await poolInstance.query(`
    CREATE TABLE IF NOT EXISTS growth_metrics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      height_cm DECIMAL(5,2),
      weight_kg DECIMAL(5,2),
      bmi DECIMAL(4,2),
      recorded_at DATETIME NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_growth_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await poolInstance.query(`
    CREATE TABLE IF NOT EXISTS calorie_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      food VARCHAR(255) NOT NULL,
      calories INT NOT NULL,
      meal_time DATETIME NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_entries_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await poolInstance.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      image VARCHAR(500),
      category VARCHAR(100),
      in_stock BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await poolInstance.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      payment_mode VARCHAR(50) NOT NULL,
      status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await poolInstance.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const seedAdminUser = async () => {
  if (!config.admin.email || !config.admin.password) {
    return;
  }

  const poolInstance = getPool();
  const email = config.admin.email.toLowerCase();
  const [existing] = await poolInstance.query('SELECT id FROM users WHERE email = ?', [email]);

  if (existing.length > 0) {
    return;
  }

  // Use async bcrypt
  const passwordHash = await bcrypt.hash(config.admin.password, 10);

  await poolInstance.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')`,
    [config.admin.name, email, passwordHash],
  );

  console.log(`Seeded admin user ${email}`);
};

const seedProducts = async () => {
  const poolInstance = getPool();
  const [existing] = await poolInstance.query('SELECT id FROM products LIMIT 1');

  if (existing.length > 0) {
    return; // Products already seeded
  }

  const initialProducts = [
    { name: 'Protein Powder', description: 'High-quality whey protein for muscle recovery', price: 2499, image: 'https://images.pexels.com/photos/416471/pexels-photo-416471.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Supplements', inStock: true },
    { name: 'Multivitamin Tablets', description: 'Complete daily nutrition in one tablet', price: 599, image: 'https://images.pexels.com/photos/5944522/pexels-photo-5944522.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Supplements', inStock: true },
    { name: 'Fitness Tracker', description: 'Smart watch with heart rate monitor', price: 3999, image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Electronics', inStock: true },
    { name: 'Yoga Mat', description: 'Premium non-slip yoga mat', price: 1299, image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Fitness Equipment', inStock: true },
    { name: 'Resistance Bands Set', description: '5-piece resistance band set for home workouts', price: 899, image: 'https://images.pexels.com/photos/416471/pexels-photo-416471.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Fitness Equipment', inStock: true },
    { name: 'Meal Prep Containers', description: 'BPA-free meal prep containers set of 10', price: 799, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Accessories', inStock: true },
    { name: 'Water Bottle', description: 'Insulated stainless steel water bottle 1L', price: 999, image: 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Accessories', inStock: true },
    { name: 'Dumbbells Set', description: 'Adjustable dumbbells 2.5kg to 20kg', price: 4999, image: 'https://images.pexels.com/photos/221247/pexels-photo-221247.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Fitness Equipment', inStock: true },
    { name: 'BCAA Supplement', description: 'Branched-chain amino acids for recovery', price: 1799, image: 'https://images.pexels.com/photos/5944522/pexels-photo-5944522.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Supplements', inStock: true },
    { name: 'Jump Rope', description: 'Professional speed jump rope', price: 499, image: 'https://images.pexels.com/photos/416471/pexels-photo-416471.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Fitness Equipment', inStock: true },
    { name: 'Foam Roller', description: 'High-density foam roller for muscle recovery', price: 1299, image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Fitness Equipment', inStock: true },
    { name: 'Gym Bag', description: 'Large capacity gym bag with shoe compartment', price: 1999, image: 'https://images.pexels.com/photos/1153369/pexels-photo-1153369.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Accessories', inStock: true },
    { name: 'Creatine Monohydrate', description: 'Pure creatine monohydrate powder 500g', price: 1499, image: 'https://images.pexels.com/photos/5944522/pexels-photo-5944522.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Supplements', inStock: true },
    { name: 'Kettlebell', description: 'Cast iron kettlebell 12kg', price: 2499, image: 'https://images.pexels.com/photos/221247/pexels-photo-221247.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Fitness Equipment', inStock: true },
    { name: 'Mass Gainer', description: 'High-calorie mass gainer protein powder', price: 2999, image: 'https://images.pexels.com/photos/416471/pexels-photo-416471.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Supplements', inStock: true },
    { name: 'Pull-up Bar', description: 'Doorway pull-up bar for home workouts', price: 1799, image: 'https://images.pexels.com/photos/221247/pexels-photo-221247.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', category: 'Fitness Equipment', inStock: true },
  ];

  for (const product of initialProducts) {
    await poolInstance.query(
      `INSERT INTO products (name, description, price, image, category, in_stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [product.name, product.description, product.price, product.image, product.category, product.inStock]
    );
  }

  console.log(`Seeded ${initialProducts.length} products`);
};

const initDb = async () => {
  await createDatabaseIfNeeded();
  getPool();
  await createTables();
  await seedAdminUser();
  await seedProducts();
};

module.exports = {
  getPool,
  initDb,
};

