const mongoose = require('mongoose');

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[LogixWave DB] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[LogixWave DB] Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
