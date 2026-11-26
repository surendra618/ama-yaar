import { spawn } from 'node:child_process';
import net from 'node:net';
import ngrok from '@ngrok/ngrok';

const NGROK_AUTHTOKEN =
  process.env.NGROK_AUTHTOKEN || '3MdfZ3g1coePs47V00bVUNRfcKV_NcWZSL1TK8EyPWBkmUbG';

const FRONTEND_PORT = 5173;
const ADMIN_PORT = 5174;
const isWin = process.platform === 'win32';

function spawnService(label, command, extraEnv = {}) {
  const child = spawn(command, {
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
    }
  });
  return child;
}

function waitForPort(port, timeoutMs = 90000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const socket = net.createConnection({ port, host: '127.0.0.1' });
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for port ${port}`));
          return;
        }
        setTimeout(check, 500);
      });
    };
    check();
  });
}

const backend = spawnService('BACKEND', 'npm --prefix backend run dev');
const frontend = spawnService('FRONTEND', 'npm --prefix frontend run dev', {
  VITE_API_BASE_URL: '/api/v1',
});
const admin = spawnService('ADMIN', 'npm --prefix admin run dev', {
  VITE_API_BASE_URL: '/api/v1',
  VITE_ADMIN_BASE: '/admin/',
});

let listener = null;

async function shutdown() {
  console.log('\n[NGROK] Shutting down...');
  if (listener) {
    try {
      await listener.close();
    } catch (_) {}
  }
  if (isWin) {
    if (backend.pid) spawn(`taskkill /pid ${backend.pid} /T /F`, { shell: true, stdio: 'ignore' });
    if (frontend.pid) spawn(`taskkill /pid ${frontend.pid} /T /F`, { shell: true, stdio: 'ignore' });
    if (admin.pid) spawn(`taskkill /pid ${admin.pid} /T /F`, { shell: true, stdio: 'ignore' });
  } else {
    backend.kill();
    frontend.kill();
    admin.kill();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

try {
  await Promise.all([waitForPort(FRONTEND_PORT), waitForPort(ADMIN_PORT)]);
  listener = await ngrok.forward({
    addr: FRONTEND_PORT,
    authtoken: NGROK_AUTHTOKEN,
  });
  const url = listener.url();
  console.log('\n==========================================================');
  console.log(`  AMA YAAR Storefront (ngrok): ${url}`);
  console.log(`  AMA YAAR Admin (ngrok):      ${url}/admin`);
  console.log('  Proxying /api, /uploads & /socket.io -> localhost:5000');
  console.log('==========================================================\n');
} catch (err) {
  console.error('[NGROK] Failed to start tunnel:', err.message || err);
  await shutdown();
}
