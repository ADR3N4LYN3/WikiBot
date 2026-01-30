import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { analyticsRouter } from './routes/analytics';
import { articlesRouter } from './routes/articles';
import { auditLogsRouter } from './routes/auditLogs';
import { categoriesRouter } from './routes/categories';
import { contactRouter } from './routes/contact';
import { exportRouter } from './routes/export';
import { healthRouter } from './routes/health';
import { membersRouter } from './routes/members';
import { permissionsRouter } from './routes/permissions';
import { publicRouter } from './routes/public';
import { searchRouter } from './routes/search';
import { serversRouter } from './routes/servers';
import { settingsRouter } from './routes/settings';
import { statsRouter } from './routes/stats';
import { subscriptionsRouter } from './routes/subscriptions';
import { webhooksRouter } from './routes/webhooks';

const app = express();
const PORT = process.env.API_PORT || 4000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.NEXTAUTH_URL || 'http://localhost:3000',
  process.env.DASHBOARD_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Allow public endpoints from any origin (for landing page stats)
app.use('/api/public', cors());

// Webhooks must be registered BEFORE body parsing (needs raw body for signature verification)
app.use('/api/v1/webhooks', webhooksRouter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/health', healthRouter);
app.use('/api/public', publicRouter);
app.use('/api/v1/articles', articlesRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/subscriptions', subscriptionsRouter);
app.use('/api/v1/export', exportRouter);
app.use('/api/v1/servers', serversRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/members', membersRouter);
app.use('/api/v1/permissions', permissionsRouter);
app.use('/api/v1/audit-logs', auditLogsRouter);
app.use('/api/v1/contact', contactRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

export default app;
