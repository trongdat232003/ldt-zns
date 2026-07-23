import express from 'express';
import cors from 'cors';
import { logger } from '@zns-auto/shared/logger';
import { authMiddleware } from './middleware/authMiddleware.js';
import usersRoutes from './routes/users.js';
import { env } from '@zns-auto/shared/config';
import { ReminderRepository } from '@zns-auto/db/reminderRepository';

const app = express();
app.use(cors());
app.use(express.json());

// Users API (requires admin auth)
app.use('/api/users', authMiddleware, usersRoutes);

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
