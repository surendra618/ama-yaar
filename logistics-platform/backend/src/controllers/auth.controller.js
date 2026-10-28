const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Merchant = require('../models/Merchant');

function signToken(merchant) {
  return jwt.sign(
    { id: merchant._id, email: merchant.email, role: merchant.role },
    process.env.JWT_SECRET || 'logixwave_super_secret_jwt_key_2026_enterprise_9988',
    { expiresIn: '30d' }
  );
}

exports.register = async (req, res) => {
  try {
    const { companyName, email, password, phone } = req.body;
    if (!companyName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await Merchant.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const merchant = await Merchant.create({
      companyName,
      email,
      password,
      phone,
      walletBalance: 500, // ₹500 welcome credit for instant shipping test
    });

    const token = signToken(merchant);
    res.status(201).json({
      success: true,
      message: 'Merchant registered successfully. Welcome bonus ₹500 credited!',
      token,
      merchant: {
        id: merchant._id,
        companyName: merchant.companyName,
        email: merchant.email,
        role: merchant.role,
        phone: merchant.phone,
        walletBalance: merchant.walletBalance,
        apiKeys: merchant.apiKeys,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const merchant = await Merchant.findOne({ email });
    if (!merchant || !(await merchant.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(merchant);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      merchant: {
        id: merchant._id,
        companyName: merchant.companyName,
        email: merchant.email,
        role: merchant.role,
        phone: merchant.phone,
        walletBalance: merchant.walletBalance,
        apiKeys: merchant.apiKeys,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.merchant._id).select('-password');
    res.json({ success: true, merchant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.regenerateApiKeys = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.merchant._id);
    merchant.apiKeys.clientId = 'lxw_' + crypto.randomBytes(8).toString('hex');
    merchant.apiKeys.apiKey = 'sec_' + crypto.randomBytes(24).toString('hex');
    await merchant.save();

    res.json({
      success: true,
      message: 'API Keys regenerated successfully',
      apiKeys: merchant.apiKeys,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateKyc = async (req, res) => {
  try {
    const { gstin, pan, bankAccount } = req.body;
    const merchant = await Merchant.findById(req.merchant._id);
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });

    merchant.kyc.gstin = gstin || merchant.kyc.gstin;
    merchant.kyc.pan = pan || merchant.kyc.pan;
    if (bankAccount) {
      merchant.kyc.bankAccount = {
        accountName: bankAccount.accountName || merchant.kyc.bankAccount?.accountName || '',
        accountNumber: bankAccount.accountNumber || merchant.kyc.bankAccount?.accountNumber || '',
        ifsc: bankAccount.ifsc || merchant.kyc.bankAccount?.ifsc || '',
        bankName: bankAccount.bankName || merchant.kyc.bankAccount?.bankName || '',
      };
    }
    merchant.kyc.status = 'VERIFIED';
    await merchant.save();

    res.json({
      success: true,
      message: 'KYC & Bank details updated and verified successfully!',
      kyc: merchant.kyc,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
