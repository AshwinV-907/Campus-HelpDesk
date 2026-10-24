import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getStorageMode } from './config/db.js';
import ticketRoutes from './routes/ticketRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health & System Info Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Campus Helpdesk API',
    version: '1.0.0',
    storageMode: getStorageMode(),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/tickets', ticketRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: err.message
  });
});

// Initialize and start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🎓 Campus Helpdesk Server running on http://localhost:${PORT}`);
    console.log(`📊 Storage Mode: ${getStorageMode().toUpperCase()}`);
    console.log(`⚡ Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`🎫 Tickets Endpoint: http://localhost:${PORT}/api/tickets`);
    console.log(`=======================================================`);
  });
};

startServer();
