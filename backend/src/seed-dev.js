const mongoose = require('mongoose');
const { seedData } = require('./seed');
const env = require('./config/env');

const DEV_URI = process.env.DEV_MONGODB_URI || env.mongoUri || 'mongodb://localhost:27017/dev';

async function run() {
  console.log('[seed-dev] Connecting to DEV database...');
  await mongoose.connect(DEV_URI);
  console.log('[seed-dev] Connected. Seeding all data into "dev" database...');
  await seedData();

  console.log('\n[seed-dev] Verifying counts in "dev":');
  const collections = await mongoose.connection.db.listCollections().toArray();
  const summary = {};
  for (const col of collections) {
    summary[col.name] = await mongoose.connection.db.collection(col.name).countDocuments();
  }
  console.table(summary);

  await mongoose.disconnect();
  console.log('[seed-dev] Finished successfully.');
}

run().catch((err) => {
  console.error('[seed-dev] Failed:', err);
  process.exit(1);
});
