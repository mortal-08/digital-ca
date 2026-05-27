const path = require('path');
const fs = require('fs');
const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
global.serverLog = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(msg);
  logStream.write(line);
};
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const documentRoutes = require('./routes/documentRoutes');
const newsRoutes = require('./routes/newsRoutes');
const requestRoutes = require('./routes/requestRoutes');
const caRoutes = require('./routes/caRoutes');

// Connect to database
connectDB();

const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for easier deployment of external assets initially, can be tightened later
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Large threshold for local development/testing to prevent lockouts
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(cors());
app.use('/api/', limiter); // Apply rate limiting to all API routes

app.use((req, res, next) => {
  global.serverLog(`[Request] ${req.method} ${req.url}`);
  next();
});

// Stripe Webhook needs raw body - MUST be before express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./routes/paymentRoutes'));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ca', caRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// All non-API routes → serve React index.html (SPA client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  global.serverLog(`Server running on port ${PORT}`);
});