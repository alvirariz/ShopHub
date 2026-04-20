const express = require('express');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());


// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);
const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);
const orderRoutes = require('./routes/orderRoutes')
app.use('/api/orders', orderRoutes)
const preferenceRoutes = require('./routes/preferenceRoutes');
app.use('/api/preferences', preferenceRoutes);
const adminRoutes = require('./routes/adminRoutes')
app.use('/api/admin', adminRoutes)
// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'ShopHub API is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log( `Server running on http://localhost:${PORT}`);
});
