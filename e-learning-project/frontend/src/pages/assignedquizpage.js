// frontend/src/pages/assignedquizpage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, CheckCircle, Circle, FileText } from 'lucide-react';
import './assignedquizpage.css';

const AssignedQuizPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState(state?.courseDetails || null);
  const [selectedModule, setSelectedModule] = useState(state?.selectedModule || null);
  const [taskDetails, setTaskDetails] = useState(state?.taskDetails || null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  useEffect(() => {
    if (courseDetails && selectedModule && selectedModule.quiz) {
      setLoading(false);
      setCurrentQuiz(selectedModule.quiz);
    } else {
      setError('No quiz data available for this module.');
      setLoading(false);
    }
  }, [courseDetails, selectedModule]);

  const handleAnswerSelect = (answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setQuizSubmitted(true);
    
    // If all answers are correct, update the assigned course progress
    if (isAllAnswersCorrect()) {
      setUpdatingProgress(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const courseName = courseDetails?.name || courseDetails?.title;
        console.log('📝 Updating progress for course:', courseName);
        console.log('📋 Course details:', {
          name: courseDetails?.name,
          title: courseDetails?.title,
          modules: courseDetails?.modules?.map(m => m.title)
        });

        // First check if the course is assigned to this employee
        const checkResponse = await fetch(`http://localhost:5000/api/assigned-course-progress/check-assignment/${encodeURIComponent(courseName)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (checkResponse.ok) {
          const checkResult = await checkResponse.json();
          if (!checkResult.isAssigned) {
            console.log('⚠ Course is not assigned to this employee');
            alert('⚠ This course is not assigned to you. Progress will not be updated.');
            setUpdatingProgress(false);
            return;
          }
        }

        // Update the progress
        const response = await fetch('http://localhost:5000/api/assigned-course-progress/update-progress', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            courseName: courseName
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Module progress updated successfully:', result);
          
          // Check if this was the final module (course completed)
          const courseName = courseDetails?.name || courseDetails?.title;
          const totalModules = courseDetails?.modules?.length || 0;
          const currentModuleIndex = courseDetails?.modules?.findIndex(
            module => module.title === selectedModule.title
          );
          
          // If this was the last module, show certificate message
          if (currentModuleIndex === totalModules - 1) {
            alert('🎉🎓 Congratulations! You have completed the entire course! A certificate has been generated for you.');
          } else {
            alert('🎉 Module completed successfully! Progress has been updated.');
          }
        } else {
          const errorData = await response.json();
          console.error('❌ Failed to update module progress:', errorData);
          
          // Show error message to user
          if (errorData.error === 'Course not assigned to this employee') {
            alert('⚠ This course is not assigned to you. Progress will not be updated.');
          } else {
            alert('⚠ Failed to update progress. Please try again.');
          }
        }
      } catch (error) {
        console.error('❌ Error updating module progress:', error);
        alert('⚠ Network error. Progress may not have been updated.');
      } finally {
        setUpdatingProgress(false);
      }
    }
    
    console.log('Quiz submitted with answers:', quizAnswers);
  };

  const getQuizScore = () => {
    if (!currentQuiz || !currentQuiz.questions) return 0;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    
    currentQuiz.questions.forEach((question, index) => {
      const questionPoints = question.points || 1; // Default to 1 point if not specified
      totalPoints += questionPoints;
      
      // Get the user's selected answer
      const userAnswer = quizAnswers[index];
      
      // Get the correct answer text based on the correctAnswer index
      const correctAnswerText = question.options[question.correctAnswer];
      
      // Compare user's answer with the correct answer text
      if (userAnswer === correctAnswerText) {
        earnedPoints += questionPoints;
      }
    });
    
    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const getQuizPoints = () => {
    if (!currentQuiz || !currentQuiz.questions) return { earned: 0, total: 0 };
    
    let totalPoints = 0;
    let earnedPoints = 0;
    
    currentQuiz.questions.forEach((question, index) => {
      const questionPoints = question.points || 1; // Default to 1 point if not specified
      totalPoints += questionPoints;
      
      // Get the user's selected answer
      const userAnswer = quizAnswers[index];
      
      // Get the correct answer text based on the correctAnswer index
      const correctAnswerText = question.options[question.correctAnswer];
      
      // Compare user's answer with the correct answer text
      if (userAnswer === correctAnswerText) {
        earnedPoints += questionPoints;
      }
    });
    
    return { earned: earnedPoints, total: totalPoints };
  };

  const getCurrentQuestion = () => {
    if (!currentQuiz || !currentQuiz.questions) return null;
    return currentQuiz.questions[currentQuestionIndex];
  };

  const isQuestionAnswered = (questionIndex) => {
    return quizAnswers.hasOwnProperty(questionIndex);
  };

  const isLastQuestion = () => {
    return currentQuestionIndex === currentQuiz?.questions?.length - 1;
  };

  const isFirstQuestion = () => {
    return currentQuestionIndex === 0;
  };

  const getProgressPercentage = () => {
    if (!currentQuiz || !currentQuiz.questions) return 0;
    return ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  };

  const isAllAnswersCorrect = () => {
    if (!currentQuiz || !currentQuiz.questions) return false;
    
    return currentQuiz.questions.every((question, index) => {
      const userAnswer = quizAnswers[index];
      const correctAnswerText = question.options[question.correctAnswer];
      return userAnswer === correctAnswerText;
    });
  };

  const getNextModule = () => {
    if (!courseDetails || !courseDetails.modules) return null;
    
    const currentModuleIndex = courseDetails.modules.findIndex(
      module => module.title === selectedModule.title
    );
    
    if (currentModuleIndex === -1 || currentModuleIndex === courseDetails.modules.length - 1) {
      return null; // No next module available
    }
    
    return courseDetails.modules[currentModuleIndex + 1];
  };

  const handleBackToModule = () => {
    // If no task details available, navigate to user dashboard
    if (!taskDetails) {
      navigate('/userdashboard');
      return;
    }

    if (isAllAnswersCorrect()) {
      // All answers correct - navigate to next module
      const nextModule = getNextModule();
      if (nextModule) {
        navigate('/taskmodulepage', {
          state: {
            courseDetails: courseDetails,
            selectedModule: nextModule,
            taskDetails: taskDetails
          }
        });
      } else {
        // No next module - navigate to task detail page
        navigate('/taskdetailpage', {
          state: {
            task: taskDetails
          }
        });
      }
    } else {
      // Not all answers correct - navigate to task detail page
      navigate('/taskdetailpage', {
        state: {
          task: taskDetails
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="aqp-assigned-quiz-page">
        <div className="aqp-loading-container">
          <div className="aqp-loading-spinner"></div>
          <p className="aqp-loading-text">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aqp-assigned-quiz-page">
        <div className="aqp-error-state">
          <AlertCircle className="aqp-error-icon" />
          <p className="aqp-error-text">Error: {error}</p>
          <button className="aqp-btn aqp-btn-back" onClick={() => navigate(-1)}>Back to Module</button>
        </div>
      </div>
    );
  }

  if (quizSubmitted) {
    return (
      <div className="aqp-assigned-quiz-page">
        <header className="aqp-quiz-header">
          <button className="aqp-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft className="aqp-back-icon" />
            Back to Module
          </button>
          <div className="aqp-quiz-title-section">
            <h1 className="aqp-quiz-title">{selectedModule?.title || 'Module'} - Quiz Results</h1>
          </div>
        </header>

        <main className="aqp-quiz-content">
          <div className="aqp-quiz-results-container">
            <div className="aqp-results-card">
              <div className="aqp-results-header">
                <FileText className="aqp-results-icon" />
                <h2 className="aqp-results-title">Quiz Completed!</h2>
              </div>
              
              <div className="aqp-score-section">
                <div className="aqp-score-circle">
                  <span className="aqp-score-number">{getQuizScore()}%</span>
                </div>
                <p className="aqp-score-label">Your Score</p>
              </div>

              <div className="aqp-stats-section">
                <div className="aqp-stat-item">
                  <span className="aqp-stat-label">Total Questions:</span>
                  <span className="aqp-stat-value">{currentQuiz?.questions?.length || 0}</span>
                </div>
                <div className="aqp-stat-item">
                  <span className="aqp-stat-label">Correct Answers:</span>
                  <span className="aqp-stat-value">
                    {currentQuiz?.questions?.filter((_, index) => {
                      const question = currentQuiz.questions[index];
                      const userAnswer = quizAnswers[index];
                      const correctAnswerText = question.options[question.correctAnswer];
                      return userAnswer === correctAnswerText;
                    }).length || 0}
                  </span>
                </div>
                <div className="aqp-stat-item">
                  <span className="aqp-stat-label">Points Earned:</span>
                  <span className="aqp-stat-value">{getQuizPoints().earned} / {getQuizPoints().total}</span>
                </div>
                <div className="aqp-stat-item">
                  <span className="aqp-stat-label">Passing Score:</span>
                  <span className="aqp-stat-value">{currentQuiz?.passingScore || 70}%</span>
                </div>
              </div>

              <div className={`aqp-pass-status ${isAllAnswersCorrect() ? 'aqp-passed' : 'aqp-failed'}`}>
                {isAllAnswersCorrect() ? (
                  <>
                    <CheckCircle className="aqp-status-icon" />
                    {(() => {
                      const totalModules = courseDetails?.modules?.length || 0;
                      const currentModuleIndex = courseDetails?.modules?.findIndex(
                        module => module.title === selectedModule.title
                      );
                      
                      if (currentModuleIndex === totalModules - 1) {
                        return (
                          <>
                            <span>🎓 Congratulations! You have completed the entire course! A certificate has been generated for you.</span>
                            {updatingProgress && (
                              <div className="aqp-progress-update">
                                <span>🔄 Generating your certificate...</span>
                              </div>
                            )}
                          </>
                        );
                      } else {
                        return (
                          <>
                            <span>Perfect! All answers are correct! You can proceed to the next module.</span>
                            {updatingProgress && (
                              <div className="aqp-progress-update">
                                <span>🔄 Updating your progress...</span>
                              </div>
                            )}
                          </>
                        );
                      }
                    })()}
                  </>
                ) : (
                  <>
                    <Circle className="aqp-status-icon" />
                    <span>Some answers are incorrect. You can only retry after 24 hours.</span>
                  </>
                )}
              </div>

              <div className="aqp-action-buttons">
                {!isAllAnswersCorrect() && (
                  <button 
                    className="aqp-btn aqp-btn-retry"
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                      setCurrentQuestionIndex(0);
                    }}
                    disabled={true}
                    title="You can only retry after 24 hours"
                  >
                    Retry Quiz (24h cooldown)
                  </button>
                )}
                <button 
                  className="aqp-btn aqp-btn-back-to-module"
                  onClick={handleBackToModule}
                >
                  {isAllAnswersCorrect() ? 
                    (getNextModule() ? 'Continue to Next Module' : 'Back to Task') : 
                    'Back to Task'
                  }
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="aqp-assigned-quiz-page">
      <header className="aqp-quiz-header">
        <button className="aqp-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft className="aqp-back-icon" />
          Back to Module
        </button>
        <div className="aqp-quiz-title-section">
          <h1 className="aqp-quiz-title">{selectedModule?.title || 'Module'} - Quiz</h1>
          <p className="aqp-quiz-subtitle">Question {currentQuestionIndex + 1} of {currentQuiz?.questions?.length || 0}</p>
        </div>
      </header>

      <main className="aqp-quiz-content">
        {/* Progress Bar */}
        <div className="aqp-progress-section">
          <div className="aqp-progress-bar">
            <div 
              className="aqp-progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <span className="aqp-progress-text">
            {currentQuestionIndex + 1} / {currentQuiz?.questions?.length || 0}
          </span>
        </div>

        {/* Question Card */}
        <div className="aqp-question-container">
          <div className="aqp-question-card">
            <div className="aqp-question-header">
              <h2 className="aqp-question-title">
                {currentQuestion?.question || 'Question not available'}
              </h2>
            </div>

            <div className="aqp-options-container">
              {currentQuestion?.options?.map((option, optionIndex) => (
                <label 
                  key={optionIndex} 
                  className={`aqp-option-label ${
                    quizAnswers[currentQuestionIndex] === option ? 'aqp-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={quizAnswers[currentQuestionIndex] === option}
                    onChange={() => handleAnswerSelect(option)}
                    className="aqp-option-input"
                  />
                  <span className="aqp-option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="aqp-navigation-section">
          <button 
            className="aqp-btn aqp-btn-previous"
            onClick={handlePreviousQuestion}
            disabled={isFirstQuestion()}
          >
            <ChevronLeft className="aqp-nav-icon" />
            Previous
          </button>

          <div className="aqp-question-indicators">
            {currentQuiz?.questions?.map((_, index) => (
              <button
                key={index}
                className={`aqp-indicator ${isQuestionAnswered(index) ? 'aqp-answered' : ''} ${
                  index === currentQuestionIndex ? 'aqp-current' : ''
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {isLastQuestion() ? (
            <button 
              className="aqp-btn aqp-btn-submit"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(quizAnswers).length < currentQuiz?.questions?.length || updatingProgress}
            >
              {updatingProgress ? 'Updating Progress...' : 'Submit Quiz'}
            </button>
          ) : (
            <button 
              className="aqp-btn aqp-btn-next"
              onClick={handleNextQuestion}
              disabled={!quizAnswers[currentQuestionIndex]}
            >
              Next
              <ChevronRight className="aqp-nav-icon" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssignedQuizPage;