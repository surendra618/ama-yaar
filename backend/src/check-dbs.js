const mongoose = require('mongoose');
const env = require('./config/env');

async function check(name) {
  const baseUri = env.mongoUri || 'mongodb://localhost:27017/dev';
  const uri = baseUri.replace(/\/[^/?]+(\?|$)/, `/${name}$1`);
  const conn = await mongoose.createConnection(uri).asPromise();
  const cols = await conn.db.listCollections().toArray();
  const res = {};
  for (const c of cols) {
    res[c.name] = await conn.db.collection(c.name).countDocuments();
  }
  await conn.close();
  return res;
}

async function run() {
  console.log('--- Checking DEV database ---');
  const devRes = await check('dev');
  console.table(devRes);

  console.log('\n--- Checking PRODV3 database ---');
  const prodRes = await check('prodv3');
  console.table(prodRes);
}

run().catch(console.error);
