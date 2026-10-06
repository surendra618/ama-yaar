const mongoose = require('mongoose');
const Contact = require('./contact.model');

const DEFAULT_MESSAGES = [
  {
    name: 'Rohan Malhotra',
    email: 'rohan.m@gmail.com',
    phone: '+91 98765 43210',
    subject: 'Order Query',
    message: 'Hey, I ordered the 240 GSM Oversized Acid Wash Tee 2 days ago (Order #AY-9042). When will it be dispatched to Delhi?',
    status: 'unread',
    adminNotes: '',
  },
  {
    name: 'Ananya Roy',
    email: 'ananya.roy@yahoo.com',
    phone: '+91 98112 33445',
    subject: 'Size & Fit Help',
    message: 'Hi AMA YAAR team! I am 5 ft 10 inches tall and weigh 72 kg. Should I order Size M or L for an oversized boxy fit?',
    status: 'read',
    adminNotes: 'Recommended Size L for boxy drop-shoulder fit.',
  },
  {
    name: 'Karan Mehra',
    email: 'karan.mehra@outlook.com',
    phone: '+91 88001 99887',
    subject: 'Return / Refund',
    message: 'Need help exchanging size S cargo pants to size M. The waist size S is slightly snug.',
    status: 'replied',
    adminNotes: 'Sent exchange shipping label via email.',
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@fashionhub.in',
    phone: '+91 99554 11223',
    subject: 'Business Partnership',
    message: 'We operate a streetwear pop-up studio in Mumbai and would love to feature AMA YAAR 3D looks in our upcoming fashion week showcase.',
    status: 'resolved',
    adminNotes: 'Connected with Marketing Lead.',
  },
];

class ContactService {
  async seedInitialMessages() {
    try {
      if (mongoose.connection.readyState !== 1) return;
      const count = await Contact.countDocuments();
      if (count === 0) {
        await Contact.insertMany(DEFAULT_MESSAGES);
        console.log('Seeded initial contact messages into database.');
      }
    } catch (err) {
      console.error('Error seeding contact messages:', err.message);
    }
  }

  async createMessage(data) {
    const message = await Contact.create(data);
    return message;
  }

  async getAllMessages(query = {}) {
    const { status, search, limit = 50, page = 1 } = query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const messages = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Contact.countDocuments(filter);

    return {
      messages,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMessageById(id) {
    const message = await Contact.findById(id);
    if (!message) {
      throw new Error('Message not found');
    }
    return message;
  }

  async updateMessageStatus(id, { status, adminNotes }) {
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const message = await Contact.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!message) {
      throw new Error('Message not found');
    }
    return message;
  }

  async deleteMessage(id) {
    const message = await Contact.findByIdAndDelete(id);
    if (!message) {
      throw new Error('Message not found');
    }
    return message;
  }
}

const contactService = new ContactService();
mongoose.connection.on('connected', () => {
  contactService.seedInitialMessages();
});

module.exports = contactService;
