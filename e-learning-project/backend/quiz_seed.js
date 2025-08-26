const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/common_courses');
const Quiz = require('./models/Quiz');

async function createQuizzes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing quizzes
    await Quiz.deleteMany({});
    console.log('🗑️ Cleared existing quizzes');

    // Get all courses
    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} courses to create quizzes for`);

    for (const course of courses) {
      console.log(`🎯 Creating quizzes for course: ${course.title}`);
      console.log(`   📋 Course modules:`, course.modules.map(m => m.m_id));
      
      const quizzes = course.modules.map(module => {
        console.log(`   📝 Creating quiz for module: ${module.m_id}`);
        
        const questions = Array.from({ length: 10 }, (_, index) => ({
          question: `Question ${index + 1} for ${module.name} in ${course.title}`,
          type: 'multiple-choice',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          points: 1
        }));

        return {
          courseId: course._id,
          mo_id: module.m_id, // Use the exact module ID from the course
          questions,
          passingScore: 70
        };
      });

      const createdQuizzes = await Quiz.insertMany(quizzes);
      console.log(`✅ Created ${createdQuizzes.length} quizzes for ${course.title}`);
      
      // Log the module IDs that were created
      createdQuizzes.forEach(quiz => {
        console.log(`   📋 Quiz created for module: ${quiz.mo_id}`);
      });
    }

    console.log('🎉 All quizzes created successfully!');
    
    // Verify what was created
    const totalQuizzes = await Quiz.countDocuments();
    console.log(`📊 Total quizzes in database: ${totalQuizzes}`);
    
    // Show sample of what was created
    const sampleQuizzes = await Quiz.find({}).limit(5);
    console.log('📋 Sample quizzes created:');
    sampleQuizzes.forEach(quiz => {
      console.log(`   - Course: ${quiz.courseId}, Module: ${quiz.mo_id}, Questions: ${quiz.questions.length}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding quizzes:', error.message);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
}

createQuizzes();
