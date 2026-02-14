require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const startDailySelectionCron = require('./cron/dailySelectionCron');
const { generateDailyFineForClass } = require('./services/fineService');
require('./cron/morningGreetCron');
require('./cron/bookingReminderCron');
require('./cron/broadcastResultsCron');


const app = express();

/* =========================
   MIDDLEWARES
========================= */
app.use(cors({
  origin: '*', // ✅ change to frontend domain in production
  credentials: true
}));
app.use(express.json());

/* =========================
   ROUTES
========================= */
app.use('/api/classes', require('./routes/classes'));
app.use('/api/students', require('./routes/students'));

app.use('/api/auth', require('./routes/auth'));               // student login
app.use('/api/bookings', require('./routes/bookings'));       // 🔥 REQUIRED (you missed this)

app.use('/api/student', require('./routes/studentDashboard'));

app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/admin', require('./routes/adminProfile'));
app.use('/api/admin/reports', require('./routes/adminReport'));

app.use('/api/holidays', require('./routes/holiday'));

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'COTD backend running'
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    startDailySelectionCron(); // ✅ cron starts only after DB is ready

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  });
  
app.get('/api/test-fine/:classId', async (req, res) => {
  await generateDailyFineForClass(req.params.classId);
  res.send('Fine generated');
});

// Add this near your other routes in app.js
const { initializePipelineForClass } = require('./services/selectionService');

app.get('/api/admin/init-pipeline/:classId', async (req, res) => {
  try {
    const result = await initializePipelineForClass(req.params.classId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});