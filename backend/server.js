require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// ================= CONNECT DATABASE =================
connectDB();

mongoose.connection.once('open', () => {
  console.log('🔥 Connected DB:', mongoose.connection.name);
});

// ================= MIDDLEWARE =================

// ✅ FIXED CORS (added 5175)
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5175', // ✅ IMPORTANT
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'JobFlow API is running 🚀',
  });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= SERVER START =================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
});
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});