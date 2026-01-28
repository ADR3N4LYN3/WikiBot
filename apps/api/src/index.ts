import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Routes
import { healthRouter } from './routes/health';
import { articlesRouter } from './routes/articles';
import { searchRouter } from './routes/search';
import { categoriesRouter } from './routes/categories';
import { analyticsRouter } from './routes/analytics';
import { webhooksRouter } from './routes/webhooks';
import { subscriptionsRouter } from './routes/subscriptions';
import { exportRouter } from './routes/export';
import { settingsRouter } from './routes/settings';

const app = express();
const PORT = process.env.API_PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  credentials: true,
}));

// Webhooks must be registered BEFORE body parsing (needs raw body for signature verification)
app.use('/api/v1/webhooks', webhooksRouter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/articles', articlesRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/subscriptions', subscriptionsRouter);
app.use('/api/v1/export', exportRouter);
app.use('/api/v1/settings', settingsRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

export default app;
