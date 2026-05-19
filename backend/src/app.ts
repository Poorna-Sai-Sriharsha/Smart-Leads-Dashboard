import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponse } from './utils/ApiResponse';
import authRoutes from './routes/auth.routes';
import leadRoutes from './routes/lead.routes';

const app = express();

// security headers
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message: { success: false, message: 'Too many requests, try again later.' },
});
app.use(limiter);

// body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// request logging in dev mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// root route for Render health checks
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Smart Leads Dashboard API',
    docs: '/api/health',
  });
});

// health check endpoint
app.get('/api/health', (_req, res) => {
  ApiResponse.success(res, 200, 'Smart Leads API is running', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// 404 fallback
app.use((_req, res) => {
  ApiResponse.error(res, 404, 'Route not found');
});

// global error handler
app.use(errorHandler);

export default app;
