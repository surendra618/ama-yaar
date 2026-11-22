const app = require('../src/app');
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

let connectionPromise = null;

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

  if (mongoose.connection.readyState !== 1) {
    if (!connectionPromise) {
      connectionPromise = connectDB().finally(() => {
        connectionPromise = null;
      });
    }
    try {
      await connectionPromise;
    } catch (err) {
      console.error('[db] Serverless connection error:', err.message);
    }
  }

  return app(req, res);
};
