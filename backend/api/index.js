const app = require('../src/app');
const connectDB = require('../src/config/db');

let dbPromise = null;

module.exports = async (req, res) => {
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
