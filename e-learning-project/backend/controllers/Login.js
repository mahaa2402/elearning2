const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { initializeEmployeeProgress } = require('../commonUserProgressManager');
const { initializeAssignedCourseProgress } = require('../assignedCourseUserProgressManager');

// Employee/Admin Login
const login = async (req, res) => {
  try {
    console.log('🔐 POST /api/auth/login - Login attempt');
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        details: 'Email, password, and role are required'
      });
    }

    let user;
    let userRole;

    if (role === 'admin') {
      user = await Admin.findOne({ email });
      userRole = 'admin';
    } else if (role === 'employee') {
      user = await Employee.findOne({ email });
      userRole = 'employee';
    } else {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'User not found'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Incorrect password'
      });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: userRole,
        name: user.name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', user.email, 'Role:', userRole);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        department: user.department || undefined
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ 
      error: 'Login failed', 
      message: err.message 
    });
  }
};

// Employee Registration
const register = async (req, res) => {
  try {
    console.log('👤 POST /api/auth/register - Employee registration');
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Name, email, password, and department are required'
      });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({ 
        error: 'Employee already exists',
        details: 'An employee with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = new Employee({
      name,
      email,
      password: hashedPassword,
      department
    });

    const savedEmployee = await employee.save();
    console.log('✅ Employee registered:', savedEmployee.email);

    // Initialize common user progress for the newly registered employee
    try {
      await initializeEmployeeProgress(savedEmployee.email);
      console.log('✅ Initialized common progress for newly registered employee:', savedEmployee.email);
    } catch (error) {
      console.log('⚠️ Could not initialize common employee progress:', error.message);
    }

    // Initialize assigned course user progress for the newly registered employee
    try {
      await initializeAssignedCourseProgress(savedEmployee.email);
      console.log('✅ Initialized assigned course progress for newly registered employee:', savedEmployee.email);
    } catch (error) {
      console.log('⚠️ Could not initialize assigned course progress:', error.message);
    }

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      employee: {
        id: savedEmployee._id,
        name: savedEmployee.name,
        email: savedEmployee.email,
        department: savedEmployee.department
      }
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ 
      error: 'Registration failed', 
      message: err.message 
    });
  }
};


module.exports = { login, register };
