const app = require('../src/app');
const connectDB = require('../src/config/db');

let dbPromise = null;

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.url === '/health' || req.url === '/api/v1/health') {
    return app(req, res);
  }
  if (!dbPromise) {
    dbPromise = connectDB().catch(err => {
      console.warn('[db] Database connection deferred:', err.message);
    });
  }
  try {
    await dbPromise;
  } catch (err) {
    console.warn('[db] DB connection error ignored in serverless:', err.message);
  }
  return app(req, res);
};
