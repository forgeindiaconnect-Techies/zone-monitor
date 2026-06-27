require('dotenv').config({ path: '../.env' }); // Load .env from root directory
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
const visitorsRouter = require('./routes/visitors');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const zonesRouter = require('./routes/zones');
const blacklistRouter = require('./routes/blacklist');
const alertsRouter = require('./routes/alerts');

app.use('/api/visitors', visitorsRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/zones', zonesRouter);
app.use('/api/blacklist', blacklistRouter);
app.use('/api/alerts', alertsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
