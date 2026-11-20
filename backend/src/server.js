const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const { initSocket } = require('./config/socket');

async function start() {
  await connectDB();
  const host = '0.0.0.0';
  const server = http.createServer(app);

  // Attach WebSocket Server
  initSocket(server);

  server.listen(env.port, host, () => {
    console.log(`[server] AMA-YAAR API & Socket.IO listening on http://localhost:${env.port} and network (0.0.0.0) (${env.nodeEnv})`);
  });
}

start();
