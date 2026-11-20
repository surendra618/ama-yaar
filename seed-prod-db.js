/**
 * Seed & Clone Production Database (`ama-yaar-prod`) from Development (`ama-yaar`)
 * - Copies: products, categories, coupons, banners, cardsliders, editoriallooks, reels, reelsettings, blogs, settings
 * - Admin Users: Copies ONLY admins (role: 'admin' / 'superadmin'), skips all customer accounts
 * - Excludes: orders, carts, wishlists, payments, returnrequests, reviews, notifications, addresses, contacts, subscribers
 */

const mongoose = require('./backend/node_modules/mongoose');
const env = require('./backend/src/config/env');

const DEV_URI = env.mongoUri; // points to /ama-yaar
const PROD_DB_NAME = 'ama-yaar-prod';

// Replace database name in connection string
const PROD_URI = DEV_URI.replace(/\/ama-yaar(\?|$)/, `/${PROD_DB_NAME}$1`);

console.log('--- Database Migration / Seed Tool ---');
console.log('Source (Dev) DB:', DEV_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
console.log('Target (Prod) DB:', PROD_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

const CATALOG_COLLECTIONS = [
  'products',
  'categories',
  'coupons',
  'banners',
  'cardsliders',
  'editoriallooks',
  'reels',
  'reelsettings',
  'blogs',
  'settings',
];

async function run() {
  const devConn = await mongoose.createConnection(DEV_URI).asPromise();
  console.log('\n✓ Connected to Dev DB (`ama-yaar`)');

  const prodConn = await mongoose.createConnection(PROD_URI).asPromise();
  console.log(`✓ Connected to Prod DB (\`${PROD_DB_NAME}\`)`);

  // 1. Copy Catalog & Configuration Collections
  console.log('\n--- Copying Catalog & Content Collections ---');
  for (const collName of CATALOG_COLLECTIONS) {
    const devColl = devConn.collection(collName);
    const prodColl = prodConn.collection(collName);

    const docs = await devColl.find({}).toArray();
    console.log(`Found ${docs.length} documents in \`${collName}\` (Dev).`);

    if (docs.length > 0) {
      // Clear target collection first to avoid duplicates
      await prodColl.deleteMany({});
      await prodColl.insertMany(docs);
      console.log(`  -> Cloned ${docs.length} docs to \`${collName}\` (Prod)`);
    } else {
      console.log(`  -> Skipped (empty collection)`);
    }

    // Clone indexes
    try {
      const indexes = await devColl.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const keys = idx.key;
        delete idx.key;
        delete idx.ns;
        delete idx.v;
        await prodColl.createIndex(keys, idx).catch(() => {});
      }
    } catch (e) {
      // ignore index cloning error
    }
  }

  // 2. Copy ONLY Admins from `users` collection (exclude customers)
  console.log('\n--- Copying Admin Accounts (Excluding Customers) ---');
  const devUsers = devConn.collection('users');
  const prodUsers = prodConn.collection('users');

  const adminUsers = await devUsers.find({
    role: { $in: ['admin', 'superadmin'] }
  }).toArray();

  console.log(`Found ${adminUsers.length} Admin account(s) in Dev:`);
  adminUsers.forEach(a => console.log(`  - ${a.name} (${a.email}) [role: ${a.role}, isSuperAdmin: ${!!a.isSuperAdmin}]`));

  await prodUsers.deleteMany({});
  if (adminUsers.length > 0) {
    await prodUsers.insertMany(adminUsers);
    console.log(`  -> Seeded ${adminUsers.length} Admin account(s) into Prod \`users\`.`);
  }

  // Clone indexes on users
  try {
    const uIndexes = await devUsers.indexes();
    for (const idx of uIndexes) {
      if (idx.name === '_id_') continue;
      const keys = idx.key;
      delete idx.key;
      delete idx.ns;
      delete idx.v;
      await prodUsers.createIndex(keys, idx).catch(() => {});
    }
  } catch (e) {}

  // 3. Verification of Prod DB
  console.log('\n--- Verifying Production Database (`ama-yaar-prod`) ---');
  const prodCollections = await prodConn.db.listCollections().toArray();
  for (const c of prodCollections) {
    const count = await prodConn.collection(c.name).countDocuments();
    console.log(`  * ${c.name}: ${count} document(s)`);
  }

  console.log('\n✓ Migration & Seeding Completed Successfully without Customers or Orders!');
  await devConn.close();
  await prodConn.close();
  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

