const express = require('express');
const router = express.Router();
const Common_Course = require('../models/common_courses');
const {getcourse}=require('../controllers/User')

 const Quiz=require('../models/Quiz');
// GET /api/courses - Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses', message: err.message });
  }
});

// POST /api/courses - Create a new course
router.post('/', async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create course', message: err.message });
  }
});

router.get('/getcourse', async (req, res) => {
  try {
    const courses = await Common_Course.find({});
    console.log("Fetched courses with modules:", courses.length);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/getcoursedetailpage',getcourse)

// POST endpoint for quiz questions
router.post('/questions', async (req, res) => {  // POST /api/quiz/questions
  const { courseId, moduleId, attemptNumber  } = req.body;
  console.log("start with sarvaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

  console.log('🔍 POST Quiz endpoint called with:', { courseId, moduleId, attemptNumber });

  // if (!courseId || !moduleId) {
  //   console.log('❌ Missing required fields');
  //   return res.status(400).json({ error: 'courseId and moduleId are required' });
  // }

  try {
    // First, let's check if there are any quizzes in the database
    const totalQuizzes = await Quiz.countDocuments();
    console.log('📊 Total quizzes in database:', totalQuizzes);
    
    // Check if there are quizzes for this specific course
    const courseQuizzes = await Quiz.find({ courseId });
    console.log('📚 Quizzes for this course:', courseQuizzes.length);
    console.log('📚 Course quiz details:', courseQuizzes.map(q => ({ courseId: q.courseId, mo_id: q.mo_id })));
    
    // Use the new batch method to get questions based on attempt number
    const quiz = await Quiz.getQuestionsByCourseAndModuleBatch(courseId, moduleId, attemptNumber);
    
    console.log("🎯 Quiz result:", quiz);
    if (!quiz) {
      console.log('❌ No quiz found for:', { courseId, moduleId, attemptNumber });
      return res.status(404).json({ error: 'Quiz not found' });
    }

    console.log('✅ Returning questions:', quiz.questions.length);
    res.json(quiz.questions); // returns the array of questions
  } catch (err) {
    console.error('💥 Error in quiz endpoint:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET endpoint for quiz questions (fallback)
router.get('/questions', async (req, res) => {
  const { courseId, moduleId, attemptNumber = 1 } = req.query;

  console.log('🔍 GET Quiz endpoint called with:', { courseId, moduleId, attemptNumber });

  if (!courseId || !moduleId) {
    console.log('❌ Missing required fields in query');
    return res.status(400).json({ error: 'courseId and moduleId are required as query parameters' });
  }

  try {
    // First, let's check if there are any quizzes in the database
    const totalQuizzes = await Quiz.countDocuments();
    console.log('📊 Total quizzes in database:', totalQuizzes);
    
    // Check if there are quizzes for this specific course
    const courseQuizzes = await Quiz.find({ courseId });
    console.log('📚 Quizzes for this course:', courseQuizzes.length);
    console.log('📚 Course quiz details:', courseQuizzes.map(q => ({ courseId: q.courseId, mo_id: q.mo_id })));
    
    // Use the new batch method to get questions based on attempt number
    const quiz = await Quiz.getQuestionsByCourseAndModuleBatch(courseId, moduleId, parseInt(attemptNumber));
    
    console.log("🎯 Quiz result:", quiz);
    if (!quiz) {
      console.log('❌ No quiz found for:', { courseId, moduleId, attemptNumber });
      return res.status(404).json({ error: 'Quiz not found' });
    }

    console.log('✅ Returning questions:', quiz.questions.length);
    res.json(quiz.questions); // returns the array of questions
  } catch (err) {
    console.error('💥 Error in quiz endpoint:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});




// Debug endpoint to check database contents
router.get('/debug-quizzes', async (req, res) => {
  try {
    console.log('🔍 Debug endpoint called');
    
    // Check total quizzes
    const totalQuizzes = await Quiz.countDocuments();
    console.log('📊 Total quizzes in database:', totalQuizzes);
    
    // Get all quizzes
    const allQuizzes = await Quiz.find({});
    console.log('📚 All quizzes:', allQuizzes.map(q => ({
      id: q._id,
      courseId: q.courseId,
      mo_id: q.mo_id,
      questionCount: q.questions.length
    })));
    
    // Get all courses
    const allCourses = await Course.find({});
    console.log('📖 All courses:', allCourses.map(c => ({
      id: c._id,
      title: c.title,
      modules: c.modules.map(m => ({ m_id: m.m_id, name: m.name }))
    })));
    
    res.json({
      totalQuizzes,
      quizzes: allQuizzes.map(q => ({
        id: q._id,
        courseId: q.courseId,
        mo_id: q.mo_id,
        questionCount: q.questions.length
      })),
      courses: allCourses.map(c => ({
        id: c._id,
        title: c.title,
        modules: c.modules.map(m => ({ m_id: m.m_id, name: m.name }))
      }))
    });
    
  } catch (err) {
    console.error('💥 Error in debug endpoint:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
