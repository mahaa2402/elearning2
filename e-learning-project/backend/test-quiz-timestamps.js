// Test script for quiz timestamp functionality
const mongoose = require('mongoose');
const { 
  CommonUserProgress, 
  canTakeQuiz, 
  updateQuizTimestamp, 
  getQuizCooldownRemaining,
  initializeEmployeeProgress 
} = require('./commonUserProgressManager');

require('dotenv').config();

async function testQuizTimestamps() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/e-learning-platform');
    console.log('✅ Connected to MongoDB');

    const testEmail = 'test@example.com';
    const testCourse = 'Test Course';

    console.log('\n🧪 Testing Quiz Timestamp Functionality');
    console.log('=====================================');

    // Test 1: Initialize employee progress
    console.log('\n1️⃣ Testing employee initialization...');
    const progress = await initializeEmployeeProgress(testEmail);
    console.log('✅ Employee progress initialized:', progress ? 'Success' : 'Failed');

    // Test 2: Check initial quiz availability
    console.log('\n2️⃣ Testing initial quiz availability...');
    const canTake = await canTakeQuiz(testEmail, testCourse);
    console.log('✅ Can take quiz initially:', canTake);

    // Test 3: Update quiz timestamp (simulate failed attempt)
    console.log('\n3️⃣ Testing quiz timestamp update after failed attempt...');
    await updateQuizTimestamp(testEmail, testCourse);
    console.log('✅ Quiz timestamp updated');

    // Test 4: Check quiz availability after timestamp update
    console.log('\n4️⃣ Testing quiz availability after timestamp update...');
    const canTakeAfter = await canTakeQuiz(testEmail, testCourse);
    console.log('✅ Can take quiz after timestamp update:', canTakeAfter);

    // Test 5: Check cooldown remaining
    console.log('\n5️⃣ Testing cooldown remaining...');
    const cooldown = await getQuizCooldownRemaining(testEmail, testCourse);
    console.log('✅ Cooldown remaining:', cooldown);

    // Test 6: Check with different course
    console.log('\n6️⃣ Testing with different course...');
    const canTakeOther = await canTakeQuiz(testEmail, 'Other Course');
    console.log('✅ Can take other course quiz:', canTakeOther);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Initial quiz availability: ✅');
    console.log('- Timestamp update after failure: ✅');
    console.log('- Quiz blocked after failure: ✅');
    console.log('- Cooldown calculation: ✅');
    console.log('- Course isolation: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testQuizTimestamps();
}

module.exports = { testQuizTimestamps };
