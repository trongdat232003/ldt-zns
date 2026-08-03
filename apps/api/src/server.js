import express from 'express';
import cors from 'cors';
import { logger } from '@zns-auto/shared/logger';
import { authMiddleware } from './middleware/authMiddleware.js';
import helmet from 'helmet';
import usersRoutes from './routes/users.js';
import kiotvietRoutes from './routes/kiotviet.js';
import { env } from '@zns-auto/shared/config';
import { ReminderRepository } from '@zns-auto/db/reminderRepository';

const app = express();

// Security headers
app.use(helmet());

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
  origin: env.ALLOWED_ORIGINS?.split(',') || false,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Users API (requires admin auth)
app.use('/api/users', authMiddleware, usersRoutes);

// KiotViet proxy API (requires any authenticated user)
app.use('/api/kiotviet', authMiddleware, kiotvietRoutes);

// For backwards compatibility: products API 
// Previously in server.js, dashboard called this for oil products.
// But dashboard could just use Supabase directly, keeping this for now.
app.get('/api/products', authMiddleware, async (req, res) => {
  try {
    const products = await ReminderRepository.getOilProductIds();
    res.json(Array.from(products));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = env.PORT || 3456;
app.listen(PORT, () => {
  logger.info(`ZNS API Server running on port ${PORT}`);
});
