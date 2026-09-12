const mongoose = require('mongoose');
const env = require('./env');

let mongod = null;

// Never print a URI as-is — it may embed a username:password.
function redactUri(uri) {
  return uri.replace(/\/\/([^:/@]+):([^@/]+)@/, '//$1:****@');
}

async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    // Attempt connecting to the configured MongoDB URI with a short timeout
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 2500 });
    console.log('[db] MongoDB connected to:', redactUri(env.mongoUri));
  } catch (err) {
    console.log('[db] Local MongoDB not reachable (' + err.message + '). Starting in-memory MongoDB server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('[db] In-Memory MongoDB server started & connected at:', uri);

      // Auto-seed in-memory database
      const { seedData } = require('../seed');
      await seedData();
      console.log('[db] In-Memory database populated with seed data.');
    } catch (memErr) {
      console.error('[db] Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
}

module.exports = connectDB;
