require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

// Validate required environment variables in production
const requiredEnvVars = ['JWT_SECRET'];
if (process.env.NODE_ENV === 'production') {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  
  // Warn about JWT_SECRET strength in production
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('WARNING: JWT_SECRET should be at least 32 characters long in production');
  }
}

const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
    ? (() => { 
        console.error('JWT_SECRET is required in production');
        process.exit(1);
      })()
    : 'replace-this-with-a-secure-secret-dev-only'),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'calorie_app',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
    name: process.env.ADMIN_NAME || 'Administrator',
  },
  clientUrl: process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173'),
  openaiApiKey: (process.env.OPENAI_API_KEY || '').replace(/^["']|["']$/g, '').trim(),
  geminiApiKey: (process.env.GEMINI_API_KEY || '').replace(/^["']|["']$/g, '').trim(),
  groqApiKey: (process.env.GROQ_API_KEY || '').replace(/^["']|["']$/g, '').trim(),
};

module.exports = config;

