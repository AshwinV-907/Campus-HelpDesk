import express from 'express';
import cors from 'cors';
import { connectDB, getStorageMode } from '../server/config/db.js';
import ticketRoutes from '../server/routes/ticketRoutes.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let isInitialized = false;
app.use(async (req, res, next) => {
  if (!isInitialized) {
    try {
      await connectDB();
    } catch (e) {
      console.warn('DB connect error in serverless:', e.message);
    }
    isInitialized = true;
  }
  next();
});

// Health & Info Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Campus Helpdesk API (Vercel Serverless)',
    version: '1.0.0',
    storageMode: getStorageMode(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Campus Helpdesk API (Vercel Serverless)',
    version: '1.0.0',
    storageMode: getStorageMode(),
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/tickets', ticketRoutes);
app.use('/tickets', ticketRoutes);

export default app;
