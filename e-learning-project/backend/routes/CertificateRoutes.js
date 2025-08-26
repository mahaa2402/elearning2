const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { 
  checkCourseCompletionAndGenerateCertificate,
  getCourseCompletionStatus,
  getEmployeeCertificatesAPI,
  Certificate
} = require('../controllers/CertificateController');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// 🔥 MAIN: Check course completion and generate certificate
router.post('/check-course-completion', authenticateToken, checkCourseCompletionAndGenerateCertificate);

// Get course completion status
router.get('/course-status/:courseName', authenticateToken, getCourseCompletionStatus);

// Get all certificates for the authenticated user
router.get('/employee-certificates', authenticateToken, getEmployeeCertificatesAPI);

// Test endpoint to get all certificates (for debugging)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const certificates = await Certificate.find({}).sort({ createdAt: -1 });
    console.log(`🔍 Found ${certificates.length} total certificates`);
    res.status(200).json({
      success: true,
      certificates: certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('❌ Error fetching all certificates:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    });
  }
});

// Get certificates by employee ID (for admin view)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching certificates for employee ID: ${id}`);

    // Try to find certificates by employeeId first
    let certificates = await Certificate.find({ employeeId: id });
    
    // If not found by employeeId, try by employeeEmail
    if (!certificates || certificates.length === 0) {
      certificates = await Certificate.find({ employeeEmail: id });
    }
    
    // If still not found, try by _id (MongoDB ObjectId)
    if (!certificates || certificates.length === 0) {
      try {
        const mongoose = require('mongoose');
        if (mongoose.Types.ObjectId.isValid(id)) {
          certificates = await Certificate.find({ _id: id });
        }
      } catch (err) {
        console.log('Invalid ObjectId format');
      }
    }

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No certificates found for this employee',
        employeeId: id
      });
    }

    console.log(`✅ Found ${certificates.length} certificates for employee ${id}`);
    res.status(200).json({
      success: true,
      certificates: certificates,
      count: certificates.length
    });

  } catch (error) {
    console.error('❌ Error fetching certificates by ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    });
  }
});

module.exports = router;