// frontend/src/pages/taskmodulepage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, ChevronLeft, Play, FileText, CheckCircle, Circle, Check } from 'lucide-react';
import './taskmodulepage.css';

const TaskModulePage = () => {
  const { state } = useLocation();
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const [courseDetails, setCourseDetails] = useState(state?.courseDetails || null);
  const [selectedModule, setSelectedModule] = useState(state?.selectedModule || null);
  const [taskDetails, setTaskDetails] = useState(state?.taskDetails || null);

  const [videoUrl, setVideoUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [completedModules, setCompletedModules] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchingCourse, setFetchingCourse] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // 🔍 Fetch course details from backend if not available in state
  const fetchCourseDetails = async () => {
    try {
      setFetchingCourse(true);
      console.log('Fetching course details for courseId:', courseId);

      const response = await fetch(`http://localhost:5000/api/courses/getcourse`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Courses API Response:', result);
      
      let courseData;
      if (result && Array.isArray(result)) {
        courseData = result;
      } else if (result && result.courses && Array.isArray(result.courses)) {
        courseData = result.courses;
      } else {
        throw new Error('Unexpected response format from courses server');
      }
      
      console.log('Available courses in database:', courseData.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description,
        category: c.category,
        modulesCount: c.modules?.length || 0
      })));

      // Find the course by name (courseId) - try exact match first, then partial match
      let course = courseData.find(c => c.name === courseId);
      
      // If exact match not found, try partial match
      if (!course) {
        course = courseData.find(c => c.name.toLowerCase().includes(courseId.toLowerCase()) || 
                                    courseId.toLowerCase().includes(c.name.toLowerCase()));
      }
      
      // If still not found, try to find by any field that might contain the courseId
      if (!course) {
        course = courseData.find(c => 
          c._id?.toString() === courseId || 
          c.description?.toLowerCase().includes(courseId.toLowerCase()) ||
          c.category?.toLowerCase().includes(courseId.toLowerCase())
        );
      }
      
      if (!course) {
        console.error('Course search failed. Available courses:', courseData.map(c => c.name));
        throw new Error(`Course "${courseId}" not found. Available courses: ${courseData.map(c => c.name).join(', ')}`);
      }
      
      if (course) {
        console.log('Found course:', course);
        
        // Validate course structure
        if (!course.modules || !Array.isArray(course.modules)) {
          console.error('Course structure validation failed:', {
            courseName: course.name,
            hasModules: !!course.modules,
            modulesType: typeof course.modules,
            modulesValue: course.modules
          });
          throw new Error(`Course "${course.name}" has invalid structure. Missing or invalid modules array.`);
        }
        
        if (course.modules.length === 0) {
          console.error('Course has no modules:', course);
          throw new Error(`Course "${course.name}" has no modules.`);
        }
        
        console.log('Course validation passed:', {
          name: course.name,
          modulesCount: course.modules.length,
          moduleTitles: course.modules.map(m => m.title),
          firstModule: course.modules[0]
        });
        
        setCourseDetails(course);
        setSuccessMessage(`✅ Successfully loaded course: ${course.name} with ${course.modules.length} modules`);
        setError(null); // Clear any existing errors
        
        // Set selected module if moduleId is provided
        if (moduleId && course.modules && course.modules.length > parseInt(moduleId)) {
          const module = course.modules[parseInt(moduleId)];
          setSelectedModule(module);
        } else if (course.modules && course.modules.length > 0) {
          setSelectedModule(course.modules[0]);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(`Course "${courseId}" not found`);
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError(`Failed to load course details: ${err.message}`);
    } finally {
      setFetchingCourse(false);
    }
  };

  // 📹 Fetch video from AWS/backend
  const fetchVideo = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/video/get", {
        params: {
          courseName: courseId, 
          moduleIndex: parseInt(moduleId, 10),
        },
      });

      if (res.data && res.data.success && res.data.url) {
        setVideoUrl(res.data.url);
      } else {
        console.log("No video found for this module.");
      }
    } catch (err) {
      console.error("Video load error:", err);
      // Don't set error for video, just log it
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug logging - let's see what data we have
        console.log("=== DETAILED DEBUG INFO ===");
        console.log("courseId:", courseId);
        console.log("moduleId:", moduleId);
        console.log("Full state object:", state);
        console.log("All state properties:", state ? Object.keys(state) : 'no state');
        console.log("state.courseDetails:", state?.courseDetails);
        console.log("state.selectedModule:", state?.selectedModule);
        console.log("state.taskDetails:", state?.taskDetails);
        
        // Check if courseDetails is passed under a different name
        console.log("Checking for course data under different names:");
        console.log("state.course:", state?.course);
        console.log("state.courseData:", state?.courseData);
        console.log("state.taskDetails?.course:", state?.taskDetails?.course);
        console.log("state.taskDetails?.courseDetails:", state?.taskDetails?.courseDetails);
        
        console.log("current courseDetails:", courseDetails);
        console.log("current selectedModule:", selectedModule);
        console.log("========================");

        // Try to extract course details from different possible locations
        let extractedCourseDetails = courseDetails;
        if (!extractedCourseDetails) {
          extractedCourseDetails = state?.courseDetails || 
                                  state?.course || 
                                  state?.courseData || 
                                  state?.taskDetails?.course ||
                                  state?.taskDetails?.courseDetails;
          
          if (extractedCourseDetails) {
            console.log("Found course details in alternate location:", extractedCourseDetails);
            setCourseDetails(extractedCourseDetails);
          }
        }

        // If we still don't have course details, fetch them from backend
        if (!extractedCourseDetails && courseId) {
          console.log('No course details found in state, fetching from backend...');
          await fetchCourseDetails();
        } else if (extractedCourseDetails && !extractedCourseDetails.modules) {
          console.log('Course details found but no modules, this might be an incomplete course object');
          setError('Course details are incomplete. Missing modules information.');
        }

        // If we have courseId and moduleId, fetch video
        if (courseId && moduleId) {
          await fetchVideo();
        }

      } catch (err) {
        console.error('Error initializing page:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [courseId, moduleId, state]);

  const isModuleCompleted = (module) => {
    if (!module) return false;
    return completedModules.has(module.title) || module.completed;
  };

  if (loading) {
    return (
      <div className="task-module-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading module...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-module-page">
        <div className="error-state">
          <AlertCircle className="error-icon" />
          <p className="error-text">Error: {error}</p>
          <button className="btn btn-back" onClick={() => navigate(-1)}>Back to Task Details</button>
        </div>
      </div>
    );
  }

  const handleVideoProgress = (e) => {
    const video = e.target;
    if (video.duration) {
      const progressPercent = (video.currentTime / video.duration) * 100;
      setProgress(progressPercent);
      
      if (progressPercent >= 90 && !videoCompleted) {
        setVideoCompleted(true);
        if (selectedModule?.title) {
          setCompletedModules(prev => new Set([...prev, selectedModule.title]));
        }
      }
    }
  };

  const handleModuleSelect = (module) => {
    if (!module) return;
    setSelectedModule(module);
    
    // Find the module index for navigation
    const moduleIndex = courseDetails?.modules?.findIndex(m => m._id === module._id || m.title === module.title) || 0;
    
    navigate(`/course/${courseId}/module/${moduleIndex}`, {
      state: { courseDetails, selectedModule: module, taskDetails },
    });
  };

  const getModuleProgress = (module) => {
    if (!module) return 0;
    if (selectedModule?.title === module.title) {
      return progress;
    }
    return isModuleCompleted(module) ? 100 : 0;
  };

  return (
    <div className="task-module-page">
      <header className="module-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft className="back-icon" />
            Back to Task Details
          </button>
          <div className="module-title-section">
            <h1 className="module-title">
              Learn about {courseDetails?.name || 'Course'}
            </h1>
            <p className="module-description">
              {courseDetails?.description || 'Introduction to Course Content'}
            </p>
          </div>
        </div>
        <div className="header-right">
          <button className="refresh-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Refresh
          </button>
          <div className="time-info">1 hour</div>
        </div>
      </header>

      <main className="module-content">
        {/* Left Side - Video Content */}
        <div className="content-area">
          <section className="video-section">
            <div className="section-header">
              <h2 className="section-title">Video Content</h2>
              {videoCompleted && (
                <div className="completion-badge">
                  <Check className="completion-tick" />
                  <span>Completed</span>
                </div>
              )}
            </div>
            <div className="video-container">
              {videoUrl ? (
                <div className="video-wrapper">
                  <video 
                    controls 
                    className="video-player"
                    onTimeUpdate={handleVideoProgress}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {videoCompleted && (
                    <div className="video-completed-overlay">
                      <div className="completion-checkmark">
                        <Check size={48} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="video-placeholder">
                  <Play className="play-icon-large" />
                  <p>No video available for this module</p>
                </div>
              )}
              <div className="video-info">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="video-duration">
                    {Math.round(progress)}% completed
                    {videoCompleted && <Check className="inline-tick" />}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side - Course Modules Sidebar */}
        <aside className="modules-sidebar">
          {/* Success Message */}
          {successMessage && (
            <div style={{ 
              padding: '10px', 
              margin: '10px 0', 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              border: '1px solid #c3e6cb', 
              borderRadius: '4px', 
              fontSize: '14px' 
            }}>
              {successMessage}
            </div>
          )}
          
          {/* Courses Section */}
          <div className="sidebar-section">
            <h2 className="sidebar-title">Courses</h2>
            <div className="modules-list">
              {!courseDetails ? (
                <div style={{ padding: '10px', color: '#666', fontSize: '14px' }}>
                  <div>❌ No course details available</div>
                  <div>Make sure to pass courseDetails in navigation state</div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                    Current courseId: <strong>{courseId || 'None'}</strong>
                  </div>
                  {courseId && (
                    <button 
                      onClick={fetchCourseDetails}
                      disabled={fetchingCourse}
                      style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px', 
                        backgroundColor: fetchingCourse ? '#ccc' : '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: fetchingCourse ? 'not-allowed' : 'pointer' 
                      }}
                    >
                      {fetchingCourse ? '⏳ Fetching...' : '🔄 Fetch Course Details'}
                    </button>
                  )}
                </div>
              ) : !courseDetails.modules ? (
                <div style={{ padding: '10px', color: '#666', fontSize: '14px' }}>
                  <div>⚠️ Course details found but no modules property</div>
                  <div>Available properties: {Object.keys(courseDetails).join(', ')}</div>
                </div>
              ) : courseDetails.modules.length === 0 ? (
                <div style={{ padding: '10px', color: '#666', fontSize: '14px' }}>
                  📭 No modules in the course
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                    Course: <strong>{courseDetails.name}</strong> | 
                    Modules: <strong>{courseDetails.modules?.length || 0}</strong>
                  </div>
                </div>
              ) : (
                // Render course modules
                courseDetails.modules.map((module, index) => {
                  console.log(`Rendering module ${index}:`, module);
                  return (
                    <div 
                      key={module._id || index} 
                      className={`module-item course-item ${selectedModule?.title === module.title ? 'active' : ''}`}
                      onClick={() => handleModuleSelect(module)}
                    >
                      <div className="module-item-header">
                        <div className="module-info">
                          <h3 className="module-item-title">
                            Lesson {String(index + 1).padStart(2, '0')}: {module.title || `Module ${index + 1}`}
                          </h3>
                          <div className="module-duration">30 mins</div>
                        </div>
                        <div className="module-status">
                          {isModuleCompleted(module) ? (
                            <CheckCircle className="status-icon completed" />
                          ) : selectedModule?.title === module.title ? (
                            <Circle className="status-icon active" />
                          ) : (
                            <div className="status-icon locked">🔒</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Practice Quiz Section */}
          <div className="sidebar-section">
            <h2 className="sidebar-title">Practice Quiz</h2>
            <div className="modules-list">
              {!courseDetails ? (
                <div style={{ padding: '10px', color: '#666', fontSize: '14px' }}>
                  <div>❌ No course details available</div>
                </div>
              ) : !courseDetails.modules ? (
                <div style={{ padding: '10px', color: '#666', fontSize: '14px' }}>
                  <div>⚠️ No modules available</div>
                </div>
              ) : courseDetails.modules.length === 0 ? (
                <div style={{ padding: '10px', color: '#666', fontSize: '14px' }}>
                  📭 No quizzes available
                </div>
              ) : (
                // Render quiz modules
                courseDetails.modules.map((module, index) => {
                  console.log(`Rendering quiz ${index}:`, module);
                  return (
                    <div 
                      key={`quiz-${module._id || index}`} 
                      className={`module-item quiz-item ${selectedModule?.title === module.title ? 'active' : ''}`}
                      onClick={() => {
                        // Navigate to quiz page
                        navigate('/assignedquizpage', {
                          state: {
                            courseDetails: courseDetails,
                            selectedModule: module,
                            taskDetails: taskDetails,
                            courseId: courseId,
                            moduleId: courseDetails?.modules?.findIndex(m => m._id === module._id || m.title === module.title) || 0
                          }
                        });
                      }}
                    >
                      <div className="module-item-header">
                        <div className="module-info">
                          <h3 className="module-item-title">
                            Quiz {String(index + 1).padStart(2, '0')}: {module.title || `Module ${index + 1}`}
                          </h3>
                          <div className="module-duration">30 mins</div>
                        </div>
                        <div className="module-status">
                          {isModuleCompleted(module) ? (
                            <CheckCircle className="status-icon completed" />
                          ) : selectedModule?.title === module.title ? (
                            <Circle className="status-icon active" />
                          ) : (
                            <div className="status-icon locked">🔒</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Debug info section - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ padding: '10px', borderTop: '1px solid #eee', marginTop: '10px', fontSize: '12px', color: '#999' }}>
              <details>
                <summary>Debug Info</summary>
                <div style={{ marginTop: '5px' }}>
                  <div><strong>Course Name:</strong> {courseDetails?.name || 'N/A'}</div>
                  <div><strong>Modules Count:</strong> {courseDetails?.modules?.length || 0}</div>
                  <div><strong>Selected Module:</strong> {selectedModule?.title || 'None'}</div>
                </div>
                <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px', background: '#f8f8f8', padding: '5px', borderRadius: '3px', marginTop: '5px' }}>
                  {JSON.stringify({
                    courseId,
                    moduleId,
                    courseName: courseDetails?.name,
                    modulesTitles: courseDetails?.modules?.map(m => m.title) || [],
                    hasVideo: courseDetails?.modules?.map(m => !!m.video) || [],
                    hasQuiz: courseDetails?.modules?.map(m => !!(m.quiz && m.quiz.questions)) || [],
                    modulesCount: courseDetails?.modules?.length || 0,
                    selectedModuleTitle: selectedModule?.title || 'None',
                    stateAvailable: !!state,
                    courseDetailsAvailable: !!courseDetails
                  }, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default TaskModulePage;