const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const Subscriber = require('./subscriber.model');
const Contact = require('../contact/contact.model');

const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Save or update subscriber in Subscriber model
  let subscriber = await Subscriber.findOne({ email: cleanEmail });
  let isNew = false;

  if (!subscriber) {
    subscriber = await Subscriber.create({ email: cleanEmail });
    isNew = true;
  } else if (subscriber.status === 'unsubscribed') {
    subscriber.status = 'active';
    await subscriber.save();
  }

  // 2. Also register a Contact Message so it appears in Admin Contact Messages table
  try {
    await Contact.create({
      name: 'Newsletter Subscriber',
      email: cleanEmail,
      subject: 'Other',
      message: `User subscribed to newsletter for latest offers on ${new Date().toLocaleString()}`,
      status: 'unread',
      adminNotes: 'Subscribed via Homepage Newsletter Banner',
    });
  } catch (err) {
    // Non-blocking if duplicate or error
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { email: subscriber.email, isNew },
      isNew
        ? 'Thank you for subscribing to AMA YAAR newsletter!'
        : 'You are already subscribed to AMA YAAR newsletter!'
    )
  );
});

module.exports = {
  subscribe,
};

