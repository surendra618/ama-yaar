const Merchant = require('../models/Merchant');
const WalletTransaction = require('../models/WalletTransaction');

exports.getBalance = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.merchant._id).select('walletBalance companyName');
    res.json({ success: true, balance: merchant.walletBalance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recharge = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const rechargeAmt = Number(amount);
    if (!rechargeAmt || rechargeAmt <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid positive amount' });
    }

    const merchant = await Merchant.findById(req.merchant._id);
    const prevBalance = merchant.walletBalance;
    const newBalance = prevBalance + rechargeAmt;

    merchant.walletBalance = newBalance;
    await merchant.save();

    const tx = await WalletTransaction.create({
      merchant: merchant._id,
      type: 'CREDIT_RECHARGE',
      amount: rechargeAmt,
      balanceBefore: prevBalance,
      balanceAfter: newBalance,
      description: `Wallet recharge via ${paymentMethod || 'UPI / NetBanking'}`,
      referenceId: 'PAY-' + Date.now(),
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      message: `₹${rechargeAmt} credited to your wallet successfully!`,
      walletBalance: newBalance,
      transaction: tx,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ merchant: req.merchant._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
