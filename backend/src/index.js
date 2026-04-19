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
const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        message: err.message 
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
});

module.exports = app;
