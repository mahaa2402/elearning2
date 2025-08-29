import React, { useState, useEffect } from 'react';
import './quiz.css';
import { useParams, useNavigate } from 'react-router-dom';

const email = localStorage.getItem("employeeEmail"); // stored at login
const currentLevel = parseInt(localStorage.getItem("levelCleared")) || 0;
const thisLesson = 4; // Set this based on current lesson

// Update level in localStorage and backend if eligible
if (thisLesson === currentLevel + 1) {
  const updatedLevel = thisLesson;
  localStorage.setItem("levelCleared", updatedLevel);

  fetch("http://localhost:5000/api/update-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, levelCount: updatedLevel }),
  });
}

const Quiz = () => {
  const { courseId, mo_id } = useParams();
  const navigate = useNavigate();

  // Function to determine course name based on module ID or course ID
  const getCourseName = () => {
    // First try to determine from module ID
    if (mo_id) {
      const moduleIdUpper = mo_id.toUpperCase();
      
      if (moduleIdUpper.startsWith('ISP')) {
        return 'ISP';
      } else if (moduleIdUpper.startsWith('GDPR')) {
        return 'GDPR';
      } else if (moduleIdUpper.startsWith('POSH')) {
        return 'POSH';
      } else if (moduleIdUpper.startsWith('FACT')) {
        return 'Factory Act';
      } else if (moduleIdUpper.startsWith('WELD')) {
        return 'Welding';
      } else if (moduleIdUpper.startsWith('CNC')) {
        return 'CNC';
      }else if (moduleIdUpper.startsWith('VRU')) {
        return 'VRU';
      }
    }
    
    // If module ID doesn't help, try course ID
    if (courseId) {
      const courseIdUpper = courseId.toUpperCase();
      
      if (courseIdUpper.includes('ISP')) {
        return 'ISP';
      } else if (courseIdUpper.includes('GDPR')) {
        return 'GDPR';
      } else if (courseIdUpper.includes('POSH')) {
        return 'POSH';
      } else if (courseIdUpper.includes('FACT') || courseIdUpper.includes('FACTORY')) {
        return 'Factory Act';
      } else if (courseIdUpper.includes('WELD')) {
        return 'Welding';
      } else if (courseIdUpper.includes('CNC')) {
        return 'CNC';
      }
    }
    
    // Default fallback
    return 'ISP';
  };

  // Check if current module is the final module for the course
  const isFinalModule = (mo_id, courseName) => {
    if (!mo_id || !courseName) return false;
    
    console.log('Checking if final module:', { mo_id, courseName });
    
    const moduleNumber = parseInt(mo_id.match(/\d+/)?.[0] || '0');
    console.log('Extracted module number:', moduleNumber);
    
    // Define final module numbers for each course
    const finalModules = {
      'ISP': 4,        // ISP04 is final
      'POSH': 4,       // POSH04 is final
      'GDPR': 4,       // GDPR04 is final
      'Factory Act': 4, // FACTORY04 is final
      'Welding': 4,    // WELDING04 is final
      'CNC': 4         // CNC04 is final
    };
    
    const isFinal = moduleNumber === finalModules[courseName];
    console.log('Is final module?', isFinal, 'Expected:', finalModules[courseName]);
    
    return isFinal;
  };

  // State management
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false); // New state for course completion
  const [quizAccessAllowed, setQuizAccessAllowed] = useState(false);
  const [accessChecking, setAccessChecking] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false); // New state to track if quiz is completed
  const [quizBlocked, setQuizBlocked] = useState(false);
  const [cooldownTime, setCooldownTime] = useState({ hours: 0, minutes: 0 });

  // Check quiz availability when component mounts
  useEffect(() => {
    const checkQuizAvailability = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          setAccessChecking(false);
          return;
        }

        const courseName = getCourseName();
        console.log('🔍 Checking quiz availability for course:', courseName);

        const response = await fetch('http://localhost:5000/api/courses/check-quiz-availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ courseName })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📊 Quiz availability result:', result);

          if (!result.canTake) {
            setQuizBlocked(true);
            setCooldownTime(result.cooldown);
            setError(`Quiz is not available yet. You can retry in ${result.cooldown.hours}h ${result.cooldown.minutes}m`);
            setAccessChecking(false);
            return;
          }
        } else {
          console.log('⚠️ Quiz availability check failed, proceeding with normal access check');
        }

        // Continue with normal access checking
        checkQuizAccess();
      } catch (error) {
        console.error('❌ Error checking quiz availability:', error);
        // Continue with normal access checking even if timestamp check fails
        checkQuizAccess();
      }
    };

    checkQuizAvailability();
  }, [courseId, mo_id]);

  // Check if user is allowed to take this quiz
  const checkQuizAccess = async () => {
    try {
      setAccessChecking(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userEmail = localStorage.getItem('employeeEmail');
      
      if (!token || !userEmail) {
        console.log('No token or email found, allowing access');
        setQuizAccessAllowed(true);
        setAccessChecking(false);
        return;
      }

      const courseName = getCourseName();
      
      // Map lesson keys to module IDs for backend compatibility
      const getModuleIdFromLessonKey = (lessonKey) => {
        const moduleMapping = {
          'ISP01': 'ISP01',
          'ISP02': 'ISP02', 
          'ISP03': 'ISP03',
          'ISP04': 'ISP04',
          'POSH01': 'POSH01',
          'POSH02': 'POSH02',
          'POSH03': 'POSH03', 
          'POSH04': 'POSH04',
          'GDPR01': 'GDPR01',
          'GDPR02': 'GDPR02',
          'GDPR03': 'GDPR03',
          'GDPR04': 'GDPR04',
          'FACT01': 'FACT01',
          'FACT02': 'FACT02',
          'FACT03': 'FACT03',
          'FACT04': 'FACT04',
          'WELD01': 'WELD01',
          'WELD02': 'WELD02',
          'WELD03': 'WELDING03',
          'WELD04': 'WELDING04',
          'CNC01': 'CNC01',
          'CNC02': 'CNC02',
          'CNC03': 'CNC03',
          'CNC04': 'CNC04',
          'VRU01': 'VRU01',
          'VRU02':'VRU02',
          'VRU03':'VRU03',
          'VRU04':'VRU04'
        };
        return moduleMapping[lessonKey] || lessonKey;
      };

      const moduleId = getModuleIdFromLessonKey(mo_id);
      
      const response = await fetch(`http://localhost:5000/api/progress/get-with-unlocking?userEmail=${userEmail}&courseName=${courseName}&courseId=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Quiz access check - unlock status:', data.lessonUnlockStatus);
        const lessonStatus = data.lessonUnlockStatus.find(lesson => lesson.lessonId === moduleId);
        console.log('Quiz access check - lesson status for', moduleId, ':', lessonStatus);
        
        if (lessonStatus) {
          // Check if quiz is already completed - if so, lock it
          if (lessonStatus.isCompleted) {
            console.log('Quiz access check - quiz already completed, locking access');
            setQuizAccessAllowed(false);
            setQuizCompleted(true);
          } else {
            console.log('Quiz access check - canTakeQuiz:', lessonStatus.canTakeQuiz);
            setQuizAccessAllowed(lessonStatus.canTakeQuiz);
            setQuizCompleted(false);
          }
        } else {
          // If lesson not found in progress, allow access (fallback)
          console.log('Quiz access check - lesson not found, allowing access');
          setQuizAccessAllowed(true);
        }
      } else {
        console.log('Failed to check quiz access, allowing access');
        setQuizAccessAllowed(true);
      }
    } catch (error) {
      console.error('Error checking quiz access:', error);
      setQuizAccessAllowed(true); // Allow access on error
    } finally {
      setAccessChecking(false);
    }
  };

  // Fetch questions from backend
  const fetchQuestions = async (attempt) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching questions for attempt:", attempt);
      console.log("Fetching questions...");
      console.log("Request details:", {
        method: "POST",
        url: "http://localhost:5000/api/courses/questions",
        courseId: courseId,
        moduleId: mo_id,
        attemptNumber: attempt
      });

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const requestBody = {
        courseId: courseId,
        moduleId: mo_id,      
        attemptNumber: attempt
      };
      
      console.log("Request body:", JSON.stringify(requestBody, null, 2));
      
      const response = await fetch("http://localhost:5000/api/courses/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched questions for attempt", attempt, ":", data);

      // Transform backend data to match our component structure
      const transformedQuestions = data.map((question, index) => {
        // Find the index of the correct answer in the options array
        let correctAnswerId = null;
        if (typeof question.correctAnswer === 'string' && Array.isArray(question.options)) {
          const idx = question.options.findIndex(opt => opt === question.correctAnswer);
          if (idx !== -1) {
            correctAnswerId = String.fromCharCode(97 + idx); // 'a', 'b', ...
          }
        }

        // Handle image URL logic - IMPROVED VERSION
        let imageUrl = null;
        
        console.log('==========================================');
        console.log('Processing question:', question.question);
        console.log('Raw imageUrl from backend:', question.imageUrl);
        console.log('Type of imageUrl:', typeof question.imageUrl);
        console.log('imageUrl === null:', question.imageUrl === null);
        console.log('imageUrl === "null":', question.imageUrl === 'null');
        console.log('imageUrl field exists?', question.hasOwnProperty('imageUrl'));
        
        if (question.hasOwnProperty('imageUrl')) {
          // imageUrl field exists in the question
          if (question.imageUrl === null || question.imageUrl === 'null') {
            // Explicitly null - no image
            imageUrl = null;
            console.log('ImageUrl is null - NO IMAGE will be shown');
          } else if (typeof question.imageUrl === 'string' && question.imageUrl.trim().length > 0) {
            // Valid string URL
            imageUrl = question.imageUrl.trim();
            console.log('Using provided imageUrl:', imageUrl);
          } else {
            // Empty string or other falsy value - use default
            imageUrl = "https://northfleet.in/wp-content/uploads/2024/10/Types-of-Cars-in-India.webp";
            console.log('Using default imageUrl (empty/invalid value)');
          }
        } else {
          // No imageUrl field - use default
          imageUrl = "https://northfleet.in/wp-content/uploads/2024/10/Types-of-Cars-in-India.webp";
          console.log('Using default imageUrl (field not found)');
        }
        
        console.log('Final imageUrl decision:', imageUrl);
        console.log('==========================================');

        return {
          id: question._id || question.id || index + 1,
          question: question.question,
          imageUrl: imageUrl, // Add image URL to question object
          options: question.options.map((option, optIndex) => ({
            id: String.fromCharCode(97 + optIndex),
            text: option
          })),
          correctAnswer: correctAnswerId // always 'a', 'b', etc.
        };
      });

      console.log("Transformed questions:", transformedQuestions);
      setQuestions(transformedQuestions);
      setLoading(false);

    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch questions on component mount
  useEffect(() => {
    console.log("sarvaaaaaaaaaaaaaaaaaaaaaaa",mo_id, courseId)
    if (courseId && mo_id && quizAccessAllowed) {
      fetchQuestions(attemptNumber);
    }
  }, [courseId, mo_id, quizAccessAllowed]);

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = async () => {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 50;

    // Always show results first
    setShowResults(true);

    // If first attempt and didn't pass, prepare for retake
    if (!passed && attemptNumber === 1 && !hasFailedOnce) {
      setHasFailedOnce(true);
    }

    // Handle quiz result
    if (passed) {
      // User passed the quiz - submit progress
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userEmail = email;
      const courseName = getCourseName();
      const m_id = mo_id;
      const completedAt = new Date().toISOString();

      try {
        console.log('User passed quiz, submitting progress...');
        console.log('Progress data:', { userEmail, courseName, m_id, passed });
        
        // Submit quiz progress to backend
        const response = await fetch("http://localhost:5000/api/progress/submit-quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            userEmail,
            courseName,
            completedModules: [{ m_id, completedAt }],
            lastAccessedModule: m_id
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Quiz progress saved successfully:', result);
          
          // Update local storage for backward compatibility
          let currentLevel = parseInt(localStorage.getItem("levelCleared")) || 0;
          const updatedLevel = currentLevel + 1;
          localStorage.setItem("levelCleared", updatedLevel);
          
          console.log('Updated level cleared to:', updatedLevel);

          // Check if course is completed - ALWAYS check, not just for final module
          const currentCourseName = getCourseName();
          
          try {
            console.log('Checking if course is completed after this module...');
            const certificateResponse = await fetch("http://localhost:5000/api/certificate/check-course-completion", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                courseName: currentCourseName,
                courseId: courseId
              }),
            });

            if (certificateResponse.ok) {
              const certificateResult = await certificateResponse.json();
              console.log('Course completion check result:', certificateResult);

              if (certificateResult.success && certificateResult.isCompleted) {
                console.log('Course completed! Certificate generated:', certificateResult.certificate);
                // Set course completion state
                setIsCourseCompleted(true);
                // Store certificate info in localStorage for the certificate page
                localStorage.setItem('lastGeneratedCertificate', JSON.stringify(certificateResult.certificate));
                localStorage.setItem('courseCompleted', 'true');
                localStorage.setItem('completedCourseName', currentCourseName);
              } else {
                console.log('Course still in progress:', certificateResult.message);
                setIsCourseCompleted(false);
                localStorage.setItem('courseCompleted', 'false');
              }
            } else {
              console.error('Failed to check course completion:', await certificateResponse.json());
              setIsCourseCompleted(false);
            }
          } catch (certError) {
            console.error('Error checking course completion:', certError);
            setIsCourseCompleted(false);
          }
        } else {
          const errorData = await response.json();
          console.error('Failed to save quiz progress:', errorData);
        }
      } catch (error) {
        console.error('Error saving quiz progress:', error);
      }
    } else {
      // User failed the quiz - update timestamp to block retake for 24 hours
      console.log('User did not pass quiz, updating timestamp to block retake');
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (token) {
          const courseName = getCourseName();
          console.log('⏰ Quiz failed, updating timestamp for course:', courseName);
          
          const response = await fetch('http://localhost:5000/api/courses/update-quiz-timestamp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ courseName })
          });
          
          if (response.ok) {
            console.log('✅ Quiz timestamp updated after failed attempt');
          } else {
            console.error('❌ Failed to update quiz timestamp');
          }
        }
      } catch (error) {
        console.error('❌ Error updating quiz timestamp:', error);
      }
    }
  };

  const getNextMoId = (mo_id) => {
    const match = mo_id.match(/^(\D+)(\d+)$/);
    if (!match) return null;

    const [, prefix, numberPart] = match;
    const next = (parseInt(numberPart) + 1).toString().padStart(numberPart.length, '0');
    return `${prefix}${next}`;
  };

  // Handle retake quiz button click
  const handleRetakeQuiz = async () => {
    try {
      // Reset quiz state
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setShowResults(false);
      
      // Increment attempt number for next set of questions
      const nextAttempt = attemptNumber + 1;
      setAttemptNumber(nextAttempt);
      
      // Fetch new questions for the next attempt
      await fetchQuestions(nextAttempt);
      
    } catch (error) {
      console.error('Error during retake:', error);
      setError('Failed to load retake questions. Please try again.');
    }
  };

  // Access denied state
  if (accessChecking) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-header">
            <h2>Checking Quiz Access...</h2>
            <p>Please wait while we verify your progress.</p>
          </div>
        </div>
      </div>
    );
  }

  // Quiz blocked by timestamp state
  if (quizBlocked) {
    return (
      <div className="quiz-container">
        <div className="quiz-title-left">
          <h2>{getCourseName()} QUIZ</h2>
        </div>
        
        <div className="quiz-card">
          <div className="quiz-blocked-state">
            <div className="blocked-icon">
              <span>⏰</span>
            </div>
            <h2>Quiz Not Available</h2>
            <p>You cannot take this quiz right now because you already failed it recently.</p>
            <p>Please wait for the cooldown period to expire before retrying.</p>
            
            <div className="cooldown-info">
              <h3>Time Remaining:</h3>
              <div className="cooldown-timer">
                <span className="time-unit">
                  <span className="time-value">{cooldownTime.hours}</span>
                  <span className="time-label">Hours</span>
                </span>
                <span className="time-separator">:</span>
                <span className="time-unit">
                  <span className="time-value">{cooldownTime.minutes.toString().padStart(2, '0')}</span>
                  <span className="time-label">Minutes</span>
                </span>
              </div>
            </div>
            
            <div className="blocked-note">
              <p><strong>Note:</strong> This 24-hour cooldown is designed to ensure proper learning and prevent rapid retakes.</p>
            </div>
            
            <button 
              onClick={() => navigate(`/course/${courseId}/lesson/${mo_id}`)}
              className="nav-button primary"
            >
              Back to Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Access denied state
  if (!quizAccessAllowed) {
    return (
      <div className="quiz-container">
        {/* Show course title even when quiz is locked */}
        <div className="quiz-title-left">
          <h2>{getCourseName()} QUIZ</h2>
        </div>
        
        <div className="quiz-card">
          <div className={`quiz-access-denied ${quizCompleted ? 'completed' : ''}`}>
            {quizCompleted ? (
              <div className="completion-icon">
                <span>✅</span>
              </div>
            ) : (
              <div className="lock-icon">
                <span>🔒</span>
              </div>
            )}
            <h2>{quizCompleted ? 'Quiz Already Completed' : 'Quiz Locked'}</h2>
            <p>
              {quizCompleted 
                ? 'You have already completed this quiz successfully. You can only view the lesson content.'
                : 'You need to complete the previous lesson before taking this quiz.'
              }
            </p>
            <button 
              onClick={() => navigate(`/course/${courseId}/lesson/${mo_id}`)}
              className="nav-button primary"
            >
              {quizCompleted ? 'View Lesson' : 'Go to Lesson'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-header">
            <h2>Loading Quiz...</h2>
            <p>Please wait while we fetch your questions.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-header">
            <h2>Error Loading Quiz</h2>
            <p>Failed to load questions: {error}</p>
            <button onClick={() => fetchQuestions(attemptNumber)} className="nav-button primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No questions available
  if (!questions.length) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-header">
            <h2>No Questions Available</h2>
            <p>No questions found for this course and module.</p>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults) {
    const score = calculateScore();
    const totalQuestions = questions.length;
    const isPassed = score >= 3; // 3/5 or more is pass

    return (
      <div className="results-container">
        <div className="results-card">
          <h1 className="results-title">{getCourseName()} Quiz Results</h1>
          <div className="score-display">
            <div className="score-number">{score}/{totalQuestions}</div>
            <div className="score-message">
              {isPassed
                ? "Congratulations! You passed the quiz."
                : "You did not pass. You can retake with new questions."}
            </div>
          </div>
          
          <div className="questions-review">
            {questions.map((question, index) => (
              <div key={question.id} className="question-review">
                <div className="question-review-title">
                  Question {index + 1}: {question.question}
                </div>
                {/* Show image in results if it exists */}
                {question.imageUrl && (
                  <div className="question-review-image">
                    <img 
                      src={question.imageUrl} 
                      alt={`Question ${index + 1} visual`}
                      style={{
                        maxWidth: '300px',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        margin: '10px 0'
                      }}
                    />
                  </div>
                )}
                <div className="question-review-content">
                  <div className="question-review-answer">
                    Your answer: {selectedAnswers[question.id]
                      ? question.options.find(opt => opt.id === selectedAnswers[question.id])?.text
                      : "Not answered"}
                  </div>
                  <div className={`answer-status ${
                    selectedAnswers[question.id] === question.correctAnswer
                      ? 'correct'
                      : 'incorrect'
                  }`}>
                    {selectedAnswers[question.id] === question.correctAnswer ? 'correct' : 'incorrect'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show Retake button only if failed and haven't exceeded attempts */}
          {!isPassed && hasFailedOnce && attemptNumber < 2 && (
            <button onClick={handleRetakeQuiz} className="retake-button">
              Retake Quiz
            </button>
          )}
          
          {/* Show message if exceeded attempts */}
          {!isPassed && attemptNumber >= 2 && (
            <div className="attempt-limit-message">
              You need to try after 1 day as your attempts are over.
            </div>
          )}
          
          {/* If passed - show appropriate button */}
          {isPassed && (
            <>
              {/* Check if course is completed and show certificate button */}
              {(isCourseCompleted || localStorage.getItem('courseCompleted') === 'true') ? (
                <div className="certificate-section">
                  <div className="completion-message">
                    Congratulations! You have completed the entire {getCourseName()} course!
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = '/certificate';
                    }}
                    className="certificate-button"
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    View Your Certificate
                  </button>
                </div>
              ) : (
                // Still has more modules to complete
                (() => {
                  const nextMoId = getNextMoId(mo_id);
                  return nextMoId ? (
                    <button
                      onClick={() => {
                        window.location.href = `/course/${courseId}/lesson/${nextMoId}`;
                      }}
                      className="next-course-button"
                    >
                      Continue to Next Module
                    </button>
                  ) : (
                    <div className="completion-message">
                      Module completed! Check your dashboard for next steps.
                    </div>
                  );
                })()
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Quiz view
  const currentQuestionData = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="quiz-container">
      {/* ✅ Title moved outside quiz-card */}
      <div className="quiz-title-left">
        <h2>{getCourseName()} QUIZ</h2>
      </div>

      <div className="quiz-card">
        <div className="quiz-header">
          <h1 className="question-text">
            {currentQuestion + 1} {currentQuestionData.question}
          </h1>
          {attemptNumber > 1 && (
            <div className="attempt-indicator">
              Retake Attempt {attemptNumber} - Different Questions
            </div>
          )}
        </div>

        {/* Question image */}
        {currentQuestionData.imageUrl && (
          <div className="question-image-container">
            <img
              src={currentQuestionData.imageUrl}
              alt={`Question ${currentQuestion + 1} visual`}
              className="question-image"
            />
          </div>
        )}

        {/* Options */}
        <div className="options-container">
          {currentQuestionData.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswerSelect(currentQuestionData.id, option.id)}
              className={`option-button ${
                selectedAnswers[currentQuestionData.id] === option.id ? 'selected' : ''
              }`}
            >
              {option.id}) {option.text}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="navigation-container">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`nav-button${currentQuestion === 0 ? '' : ' primary'}`}
          >
            Previous
          </button>

          <div className="progress-indicators">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${
                  index === currentQuestion
                    ? 'current'
                    : index < currentQuestion
                    ? 'completed'
                    : 'upcoming'
                }`}
              />
            ))}
          </div>

          {isLastQuestion ? (
            <button onClick={handleSubmit} className="nav-button submit">SUBMIT</button>
          ) : (
            <button onClick={handleNext} className="nav-button primary">Next</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;