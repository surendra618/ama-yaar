const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

// Verifies the access token from the Authorization header (Bearer <token>)
// or an httpOnly cookie, and attaches { id, role } to req.user.
const authenticate = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  const token = bearer || req.cookies?.accessToken;

  if (!token) throw new ApiError(401, 'Authentication required');

  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret);
    req.user = decoded;
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

module.exports = authenticate;
