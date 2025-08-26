const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  initializeAssignedCourseProgress,
  assignCourseToEmployee,
  updateAssignedCourseProgress,
  getEmployeeAssignedCourseProgress,
  getAllEmployeesAssignedCourseProgress,
  getEmployeeAssignedCourses,
  markAssignedCourseCompleted,
  removeAssignedCourse,
  getAssignedCourseStatistics,
  isCourseAssignedToEmployee
} = require('../assignedCourseUserProgressManager');

// Initialize assigned course progress for employee (called during registration)
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Employee access required' });
    }

    const progress = await initializeAssignedCourseProgress(req.user.email);
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error initializing assigned course progress:', error);
    res.status(500).json({ error: 'Failed to initialize progress', message: error.message });
  }
});

// Assign course to employee (admin only)
router.post('/assign-course', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { employeeEmail, courseName, deadline } = req.body;

    if (!employeeEmail || !courseName) {
      return res.status(400).json({ error: 'Employee email and course name are required' });
    }

    const progress = await assignCourseToEmployee(employeeEmail, courseName, req.user.id, deadline);
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error assigning course:', error);
    res.status(500).json({ error: 'Failed to assign course', message: error.message });
  }
});

// Update assigned course progress (when module is completed)
router.patch('/update-progress', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Employee access required' });
    }

    const { courseName } = req.body;

    if (!courseName) {
      return res.status(400).json({ error: 'Course name is required' });
    }

    const progress = await updateAssignedCourseProgress(req.user.email, courseName);
    if (!progress) {
      return res.status(404).json({ error: 'Course not assigned to this employee' });
    }

    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error updating assigned course progress:', error);
    res.status(500).json({ error: 'Failed to update progress', message: error.message });
  }
});

// Get employee's assigned course progress
router.get('/employee-progress', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Employee access required' });
    }

    const progress = await getEmployeeAssignedCourseProgress(req.user.email);
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error getting employee assigned course progress:', error);
    res.status(500).json({ error: 'Failed to get progress', message: error.message });
  }
});

// Get all employees' assigned course progress (admin only)
router.get('/all-employees-progress', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const allProgress = await getAllEmployeesAssignedCourseProgress();
    res.json({ success: true, progress: allProgress });
  } catch (error) {
    console.error('Error getting all employees assigned course progress:', error);
    res.status(500).json({ error: 'Failed to get all progress', message: error.message });
  }
});

// Get employee's assigned courses
router.get('/assigned-courses', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Employee access required' });
    }

    const assignedCourses = await getEmployeeAssignedCourses(req.user.email);
    res.json({ success: true, assignedCourses });
  } catch (error) {
    console.error('Error getting assigned courses:', error);
    res.status(500).json({ error: 'Failed to get assigned courses', message: error.message });
  }
});

// Mark assigned course as completed
router.patch('/mark-completed', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Employee access required' });
    }

    const { courseName } = req.body;

    if (!courseName) {
      return res.status(400).json({ error: 'Course name is required' });
    }

    const progress = await markAssignedCourseCompleted(req.user.email, courseName);
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error marking course as completed:', error);
    res.status(500).json({ error: 'Failed to mark course as completed', message: error.message });
  }
});

// Remove assigned course from employee (admin only)
router.delete('/remove-course', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { employeeEmail, courseName } = req.body;

    if (!employeeEmail || !courseName) {
      return res.status(400).json({ error: 'Employee email and course name are required' });
    }

    const progress = await removeAssignedCourse(employeeEmail, courseName);
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error removing assigned course:', error);
    res.status(500).json({ error: 'Failed to remove course', message: error.message });
  }
});

// Get assigned course statistics (admin only)
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const statistics = await getAssignedCourseStatistics();
    res.json({ success: true, statistics });
  } catch (error) {
    console.error('Error getting assigned course statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics', message: error.message });
  }
});

// Check if course is assigned to employee
router.get('/check-assignment/:courseName', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ error: 'Employee access required' });
    }

    const { courseName } = req.params;
    console.log(`🔍 Checking assignment for course: "${courseName}" and employee: ${req.user.email}`);
    
    const isAssigned = await isCourseAssignedToEmployee(req.user.email, courseName);
    console.log(`📊 Assignment result: ${isAssigned}`);
    
    res.json({ success: true, isAssigned });
  } catch (error) {
    console.error('Error checking course assignment:', error);
    res.status(500).json({ error: 'Failed to check assignment', message: error.message });
  }
});

module.exports = router; 