import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '@zns-auto/shared/logger';
import { authMiddleware } from './middleware/authMiddleware.js';
import helmet from 'helmet';
import usersRoutes from './routes/users.js';
import kiotvietRoutes from './routes/kiotviet.js';
import { env } from '@zns-auto/shared/config';
import { ReminderRepository } from '@zns-auto/db/reminderRepository';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers (disable CSP so embedded resources/fonts work smoothly with React SPA)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// CORS configuration
const corsOptions = {
  origin: env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve Dashboard frontend static files
const dashboardDist = path.resolve(__dirname, '../../dashboard/dist');
app.use(express.static(dashboardDist));

// Users API (requires admin auth)
app.use('/api/users', authMiddleware, usersRoutes);

// KiotViet proxy API (requires any authenticated user)
app.use('/api/kiotviet', authMiddleware, kiotvietRoutes);

// For backwards compatibility: products API 
app.get('/api/products', authMiddleware, async (req, res) => {
  try {
    const products = await ReminderRepository.getOilProductIds();
    res.json(Array.from(products));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SPA fallback to index.html for non-API dashboard routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(dashboardDist, 'index.html'));
  }
  next();
});

const PORT = env.PORT || 3456;
app.listen(PORT, () => {
  logger.info(`ZNS API Server running on port ${PORT}`);
});

