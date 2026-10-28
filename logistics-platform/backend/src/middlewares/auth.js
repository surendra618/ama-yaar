const jwt = require('jsonwebtoken');
const Merchant = require('../models/Merchant');

async function auth(req, res, next) {
  try {
    // 1. API Key based auth for external stores / APIs
    const clientId = req.headers['x-client-id'];
    const apiKey = req.headers['x-api-key'];

    if (clientId && apiKey) {
      const merchant = await Merchant.findOne({
        'apiKeys.clientId': clientId,
        'apiKeys.apiKey': apiKey,
      });
      if (!merchant) {
        return res.status(401).json({ success: false, message: 'Invalid API Client ID or Secret' });
      }
      req.merchant = merchant;
      return next();
    }

    // 2. JWT Bearer token for Merchant Dashboard
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'logixwave_super_secret_jwt_key_2026_enterprise_9988');

    const merchant = await Merchant.findById(decoded.id);
    if (!merchant) {
      return res.status(401).json({ success: false, message: 'Merchant account not found' });
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

auth.requireAdmin = (req, res, next) => {
  if (
    req.merchant &&
    (req.merchant.role === 'admin' ||
      req.merchant.email === 'admin@logixwave.com' ||
      req.merchant.email === 'demo@logixwave.com')
  ) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden: Super Admin access required' });
};

module.exports = auth;
