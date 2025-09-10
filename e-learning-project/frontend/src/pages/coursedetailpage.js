import React, { useEffect, useState } from 'react';
import { Clock, Users, Award, BookOpen, Play, ChevronRight, User, Star } from 'lucide-react';
import './coursedetailpage.css';
import { Link } from 'react-router-dom';

import { useNavigate, useParams } from 'react-router-dom';
import staticCourseData from './coursedata'; // Renamed to avoid confusion

const CourseDetailPage = () => {
  const [courseData, setCourseData] = useState(null);
  const { title } = useParams();
  
  const navigate = useNavigate();

  // Add the same imageMap as landing page
  const imageMap = {
    ISP: "isp.jpeg",
    GDPR: "isp.jpeg", 
    POSH: "posh.png",
    "Factory Act": "hsi.jpg",
    Welding: "course.jpg",
    CNC: "courseimg.jpeg"
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses/getcoursedetailpage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        });

        if (!response.ok) throw new Error('Failed to fetch course data');

        const data = await response.json();
        setCourseData(data);
      } catch (err) {
        console.error('Error loading course:', err);
      }
    };

    fetchCourse();
  }, [title]);

  const handleStartLesson = () => {
    console.log('Current courseData:', courseData);
    console.log('Looking for title:', title);
    
    // Find the course ID by matching the course name with static course data
    let foundCourseId = null;
    for (const [id, course] of Object.entries(staticCourseData)) {
      console.log(`Checking course ${id}: ${course.name} vs ${title}`);
      if (course.name === title) {
        foundCourseId = id;
        break;
      }
    }
    
    if (foundCourseId) {
      // Get the first lesson key from the course data
      const course = staticCourseData[foundCourseId];
      const firstLessonKey = Object.keys(course.lessons)[0];
      console.log("sab",foundCourseId, "First lesson key:", firstLessonKey);
      navigate(`/course/${foundCourseId}/lesson/${firstLessonKey}`);
    } else {
      console.error('Course not found in static data');
      alert('Course not found!');
    }
  };

  // Remove the alternative function since it's not needed
  // const handleStartLessonAlternative = () => { ... }

  if (!courseData) return <div className="loading">Loading course...</div>;

  return (
    <div className="course-detail-page">
      {/* Header */}
      <header className="course-detail-header">
        <div className="course-detail-header-container">
          <div className="course-detail-header-content">
            <div className="course-detail-logo-section">
              <div className="course-detail-logo">VISTA</div>
              <div className="course-detail-logo-subtitle">InnovativeLearning</div>
            </div>
            <nav className="course-detail-nav">
              <a href="/" className="course-detail-nav-link">Home</a>
              <a href="#courses" className="course-detail-nav-link active">Courses</a>
              <Link to="/userdashboard" className="course-detail-nav-link">Certifications</Link>
              <Link
                to="/#aboutus"
                className="course-detail-nav-link"
                onClick={e => {
                  if (window.location.pathname === "/" && window.location.hash === "#aboutus") {
                    const aboutSection = document.getElementById("aboutus");
                    if (aboutSection) {
                      aboutSection.scrollIntoView({ behavior: "smooth" });
                    }
                    e.preventDefault();
                  }
                }}
              >
                About
              </Link>
            </nav>
            <div className="course-detail-header-actions">
            
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="course-detail-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(250, 174, 56, 0.9) 0%, rgba(244, 140, 6, 0.9) 100%), url(${imageMap[courseData.title] 
            ? `${process.env.PUBLIC_URL}/${imageMap[courseData.title]}` 
            : `${process.env.PUBLIC_URL}/course.jpg`})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {console.log('Hero background - Title:', courseData.title, 'Background image:', imageMap[courseData.title] ? `${process.env.PUBLIC_URL}/${imageMap[courseData.title]}` : `${process.env.PUBLIC_URL}/course.jpg`)}
        <div className="course-detail-hero-container">
          <div className="course-detail-hero-content">
            <div className="course-detail-info">
              <h1 className="course-detail-title">{courseData.title}</h1>
              <p className="course-detail-description">{courseData.description}</p>

              <div className="course-detail-stats">
                <div className="course-detail-stat-item">
                  <BookOpen className="course-detail-stat-icon" />
                  <span>{courseData.moduleCount || courseData.modules?.length} Lessons</span>
                </div>
              </div>           
            </div>

            <div className="course-detail-thumbnail">
              {console.log('Course detail - Title:', courseData.title, 'Image path:', imageMap[courseData.title] ? `${process.env.PUBLIC_URL}/${imageMap[courseData.title]}` : `${process.env.PUBLIC_URL}/course.jpg`)}
              <img 
                src={imageMap[courseData.title] 
                  ? `${process.env.PUBLIC_URL}/${imageMap[courseData.title]}` 
                  : `${process.env.PUBLIC_URL}/course.jpg`} 
                alt={courseData.title} 
              />
              <div className="course-detail-play-overlay">
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Outline */}
      <section className="course-detail-outline-section">
        <div className="course-detail-outline-container">
          <h2 className="course-detail-section-title">Course Outline</h2>
          <div className="course-detail-outline-list">
            {courseData.modules && courseData.modules.map((mod, index) => (
              <div key={mod.m_id} className="course-detail-outline-item">
                <div className="course-detail-outline-header">
                  <div className="course-detail-outline-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="course-detail-outline-content">
                    <h3 className="course-detail-outline-title">{mod.name}</h3>
                    <p className="course-detail-outline-description">{mod.description}</p>
                    <div className="course-detail-outline-meta">
                      <span className="course-detail-outline-duration">
                        <Clock className="course-detail-meta-icon" />
                        {mod.duration} min
                      </span>
                    </div>
                  </div>
                  <div className="course-detail-outline-actions">
                    <button 
                      className="course-detail-btn course-detail-btn-start" 
                      onClick={() => {
                        // Find course ID from static data
                        let foundCourseId = null;
                        
                        for (const [id, course] of Object.entries(staticCourseData)) {
                          console.log(course.name)
                          if (course.name === title) {
                            foundCourseId = id;
                            break;
                          }
                        }
                        
                        if (foundCourseId) {
                          // Get the first lesson key from the course data
                          const course = staticCourseData[foundCourseId];
                          const firstLessonKey = Object.keys(course.lessons)[0];
                          navigate(`/course/${foundCourseId}/lesson/${firstLessonKey}`);
                        } else {
                          alert('Course not found!');
                        }
                      }}
                    >
                      Start Module
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="course-detail-actions-section">
        <div className="course-detail-actions-container">
          <div className="course-detail-actions-content">
            <div className="course-detail-actions-info">
              <h3>Ready to start your learning journey?</h3>
              <p>Join thousands of professionals who have already mastered these essential compliance skills.</p>
            </div>
            <div className="course-detail-actions-buttons">
              <button 
                className="course-detail-btn course-detail-btn-primary course-detail-btn-large"
                onClick={handleStartLesson}
              >
                <Play className="course-detail-btn-icon" />
                Start Course
              </button>
              <button className="course-detail-btn course-detail-btn-outline course-detail-btn-large">
                <BookOpen className="course-detail-btn-icon" />
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailPage;