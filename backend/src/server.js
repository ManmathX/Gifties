import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import tentRoutes from './routes/tent.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5175',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
}));

// Special handling for Stripe webhooks (needs raw body)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tents', tentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Giftiy API is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🎁 Giftiy API server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
