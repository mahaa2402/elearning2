// Test script for assigned course timestamp functionality
const mongoose = require('mongoose');
const { assignCourseTimestampToEmployee } = require('./assignedCourseProgressTimestampManager');
require('dotenv').config();

async function testTimestampFunctionality() {
  try {
    console.log('🔧 Testing Assigned Course Timestamp Functionality...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/e-learning');
    console.log('✅ Connected to MongoDB');
    
    // Test data
    const testEmployeeEmail = 'test@example.com';
    const testCourseName = 'Test Course';
    const testAdminId = '507f1f77bcf86cd799439011'; // Mock ObjectId
    
    console.log('📝 Testing course timestamp assignment...');
    console.log('Employee Email:', testEmployeeEmail);
    console.log('Course Name:', testCourseName);
    console.log('Admin ID:', testAdminId);
    
    // Test the timestamp assignment function
    const result = await assignCourseTimestampToEmployee(
      testEmployeeEmail,
      testCourseName,
      testAdminId,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    );
    
    console.log('✅ Timestamp assignment test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    // Test timestamp retrieval
    console.log('\n🔍 Testing timestamp retrieval...');
    const { getEmployeeAssignedCourseTimestampProgress } = require('./assignedCourseProgressTimestampManager');
    const progress = await getEmployeeAssignedCourseTimestampProgress(testEmployeeEmail);
    console.log('📊 Retrieved progress:', JSON.stringify(progress, null, 2));
    
    console.log('\n🎉 All timestamp tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTimestampFunctionality();
}

module.exports = { testTimestampFunctionality };


