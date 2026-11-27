const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateAccessToken(payload) {
  const expiresIn = payload?.role === 'admin' ? '24h' : env.jwt.accessExpires;
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpires });
}

module.exports = { generateAccessToken, generateRefreshToken };
