const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
  await connectDB();
  const host = '0.0.0.0';
  app.listen(env.port, host, () => {
    console.log(`[server] AMA-YAAR API listening on http://localhost:${env.port} and network (0.0.0.0) (${env.nodeEnv})`);
  });
}

start();
