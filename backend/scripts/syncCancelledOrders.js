const mongoose = require('mongoose');
const env = require('../src/config/env');
const Order = require('../src/modules/order/order.model');

async function main() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to DB!');

  const res = await Order.updateMany(
    { status: 'cancelled', 'paymentInfo.status': 'pending' },
    { $set: { 'paymentInfo.status': 'cancelled' } }
  );
  console.log('Updated cancelled orders in DB:', res.modifiedCount);

  const orders = await Order.find({ status: 'cancelled' }).lean();
  for (const o of orders) {
    console.log(o.orderNumber, '| status:', o.status, '| paymentInfo.status:', o.paymentInfo?.status);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
