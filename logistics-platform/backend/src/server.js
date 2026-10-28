require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Process exception & signal safety
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL UncaughtException]', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL UnhandledRejection]', reason);
});
process.on('SIGINT', () => {
  console.log('[LogixWave Server] Keeping alive on SIGINT');
});
process.on('SIGBREAK', () => {
  console.log('[LogixWave Server] Keeping alive on SIGBREAK');
});

// Initialize Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'LogixWave Logistics OS',
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/wallet', require('./routes/wallet.routes'));
app.use('/api/v1/pickup-locations', require('./routes/pickup.routes'));
app.use('/api/v1/rates', require('./routes/rate.routes'));
app.use('/api/v1/shipments', require('./routes/shipment.routes'));
app.use('/api/v1/track', require('./routes/tracking.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[LogixWave Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 LogixWave Logistics Server running on http://localhost:${PORT}`);
});
