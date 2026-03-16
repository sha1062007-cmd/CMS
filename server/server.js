require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const contactRoutes = require('./routes/contacts');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: MONGODB_URI is not defined in .env file!');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request Logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Backend API Routes
app.use('/api/contacts', contactRoutes);

// Serving Frontend (Static CSS, JS, etc.)
app.use(express.static(path.join(__dirname, '../client')));

// Basic Root route to serve client
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    status: 'error',
    error: err.message || 'An unexpected error occurred',
  });
});

// Start Server Immediately for better visibility
app.listen(PORT, () => {
    console.log(`\x1b[36m%s\x1b[0m`, `🚀 Server is running on http://localhost:${PORT}`);
    console.log(`\x1b[33m%s\x1b[0m`, `👉 Open this URL in your browser to avoid "Network Error" issues.`);
});

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '✅ Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('\x1b[31m%s\x1b[0m', '❌ CRITICAL: MongoDB Connection Error!');
    console.error(`Please ensure MongoDB is installed and running on: ${MONGODB_URI}`);
    console.error(`Error Details: ${err.message}`);
  });
