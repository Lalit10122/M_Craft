import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Scheduled Jobs Imports
import { startAbandonedCartJob } from './jobs/abandonedCartJob.js';
import { startLowStockDigestJob } from './jobs/lowStockDigestJob.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes, { webhookRouter } from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import boxBuilderRoutes from './routes/boxBuilderRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import recentlyViewedRoutes from './routes/recentlyViewedRoutes.js';

// Middleware imports
import errorHandler from './middleware/errorHandler.js';

// Database import
import { prisma } from './config/db.js';

const app = express();

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

// Helmet for HTTP header security (CSP will be tightened once frontend domain is finalized)
app.use(helmet());

// CORS — allow frontend origins safely
const allowedOrigins = [
  'http://localhost:5173',
  'https://malkincraft-frontend.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // needed for httpOnly refresh-token cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ---------------------------------------------------------------------------
// Razorpay Webhook — needs raw body for signature verification
// Must be registered BEFORE express.json() to preserve the raw body
// ---------------------------------------------------------------------------
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);

// ---------------------------------------------------------------------------
// Body Parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Global Rate Limiter (generous — route-specific limiters are stricter)
// ---------------------------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2000 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

// ---------------------------------------------------------------------------
// Health Check & Root
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.send('<h1>Malkincraft Backend is Live 🚀</h1><p>All API endpoints are available under <code>/api</code></p>');
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Malkincraft API is running', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

// Auth (login, register, Google, 2FA, password reset, OTP)
app.use('/api/auth', authRoutes);

// Public Store Settings
app.get('/api/store/settings', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error('Settings endpoint error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Public product & catalog routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);

// Delivery check (public)
app.use('/api/delivery', deliveryRoutes);

// Coupons (public apply endpoint)
app.use('/api/coupons', couponRoutes);

// Promotions (public active list)
app.use('/api/promotions', promotionRoutes);

// Box Builder (public)
app.use('/api/box-builder', boxBuilderRoutes);

// Static Pages and FAQs
app.use('/api/pages', pageRoutes);

// Reviews — the router has /products/:productId/reviews (public GET) and / (protected POST)
app.use('/api/reviews', reviewRoutes);

// Protected customer routes
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);

// Admin routes (all protected by auth + admin middleware internally)
app.use('/api/admin', adminRoutes);

// ---------------------------------------------------------------------------
// Scheduled Jobs
// ---------------------------------------------------------------------------
startAbandonedCartJob();
startLowStockDigestJob();

// ---------------------------------------------------------------------------
// 404 Handler
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------------------------------------------------------------------------
// Centralized Error Handler
// ---------------------------------------------------------------------------
app.use(errorHandler);

export default app;
