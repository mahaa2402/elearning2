// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Admin = require('./models/Admin');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/Admin');
const courseRoutes = require('./routes/Course');
const employeeRoutes = require('./routes/Employee');
const assignedTaskRoutes = require('./routes/AssignedTask');
const progressRoutes = require('./routes/progressRoutes');
const assignedCourseProgressRoutes = require('./routes/AssignedCourseProgress');
const certificateRoutes = require('./routes/CertificateRoutes');
const videoUploadRoutes = require('./routes/VideoUpload');
const videoFetchRoutes = require('./routes/Videofetch');

const app = express();

console.log('🔧 Starting E-learning Server...');

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://localhost:3002'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log(`   Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  next();
});

// Create default admin if none exists
const createDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10);
      const defaultAdmin = new Admin({
        name: process.env.DEFAULT_ADMIN_NAME,
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: hashedPassword
      });
      await defaultAdmin.save();
      console.log(`✅ Default admin created - Email: ${process.env.DEFAULT_ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error('❌ Error creating default admin');
  }
};

// MongoDB connection
console.log('🔗 Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  createDefaultAdmin();
})
.catch(err => {
  console.error('❌ MongoDB connection failed');
  console.error(err.message);
});

// Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api', assignedTaskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assigned-course-progress', assignedCourseProgressRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/videos', videoUploadRoutes);
app.use('/api/video', videoFetchRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: '🌐 E-learning backend is running...',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    port: process.env.PORT || 5000
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 500 error handler
app.use((err, req, res, next) => {
  console.error('💥 Unexpected error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  server.close();
  await mongoose.connection.close();
  console.log('📴 Server and database connections closed');
  process.exit(0);
});
