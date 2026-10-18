const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
  await connectDB();
  const host = '127.0.0.1';
  app.listen(env.port, host, () => {
    console.log(`[server] AMA-YAAR API listening on http://${host}:${env.port} (${env.nodeEnv})`);
  });
}

start();
