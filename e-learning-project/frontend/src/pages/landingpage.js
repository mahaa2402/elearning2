
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './landingpage.css';

function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showScrollPopup, setShowScrollPopup] = useState(false);
  const [scrollAttempted, setScrollAttempted] = useState(false);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(null); // Add error state

  // Fetch courses when user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError(null);

    fetch('http://localhost:5000/api/courses/getcourse', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch courses');
        return response.json();
      })
      .then(data => {
        console.log('Fetched courses:', data);
        
        // Handle different response structures
        if (data && Array.isArray(data)) {
          setCourses(data);
        } else if (data && data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          console.warn('Unexpected data structure:', data);
          setCourses([]); // Fallback to empty array
        }
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
        setError(error.message);
        setCourses([]); // Ensure courses is always an array
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isLoggedIn]); // Add isLoggedIn as dependency

  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('authToken');
      const userSession = localStorage.getItem('userSession');
      
      console.log('Checking auth status:', { authToken, userSession });
      
      if (authToken || userSession) {
        setIsLoggedIn(true);
        console.log('User is logged in');
      } else {
        setIsLoggedIn(false);
        console.log('User is not logged in');
      }
    };

    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('loginSuccess', checkAuthStatus);
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('loginSuccess', checkAuthStatus);
      clearInterval(interval);
    };
  }, []);

 const imageMap = {
  ISP: "isp.jpeg",
  GDPR: "gdpr.jpg", 
  POSH: "posh.png",
  "Factory Act": "hsi.jpg",
  Welding: "course.jpg",
  CNC: "courseimg.jpeg"
};


  // Handle scroll detection for non-logged-in users
  useEffect(() => {
    if (isLoggedIn) {
      document.body.style.overflow = 'auto';
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      if (scrollPosition > 50 && !scrollAttempted) {
        setShowScrollPopup(true);
        setScrollAttempted(true);
        document.body.style.overflow = 'hidden';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: false });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoggedIn, scrollAttempted]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userSession');
    setIsLoggedIn(false);
    setShowScrollPopup(false);
    setScrollAttempted(false);
    setCourses([]); // Clear courses on logout
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <span className="vista-blue">VISTA</span>
          <span className="vista-pink"> Innovation@work</span>
        </div>
        <nav>
          <Link to="/userdashboard">Home</Link>
          {isLoggedIn && <Link to="/coursemodules">Courses</Link>}
          {isLoggedIn && <Link to="/userdashboard">Dashboard</Link>}
          <a href="#aboutus">About</a>
        </nav>
        <div className="nav-buttons">
          {isLoggedIn && (
            <Link to="/userdashboard" className="profile-icon" aria-label="User Profile">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </Link>
          )}
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn login-btn">Login</Link>
              <Link to="/register" className="btn signup-btn">Sign Up</Link>
            </>
          ) : (
            <button className="btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div
        className="hero-section hero-bg"
        style={{
          backgroundImage: `url('/bg.jpg')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
        }}
      >
        <div className="hero-content">
          <h1>
            <span className="highlight">Empowering</span> Workforce <br />
            Through Smart Learning
          </h1>
          <div className="hero-buttons">
            {isLoggedIn ? (
              <>
                <Link to="/user/courses" className="btn explore-btn">Explore Courses</Link>
                <Link to="/user/certificates" className="btn get-cert-btn">Get Certified</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn explore-btn">Login to Explore Courses</Link>
                <Link to="/register" className="btn get-cert-btn">Sign Up to Get Certified</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-bg-overlay" />
      </div>

      {/* Our Courses Section - Always visible when logged in */}
      {isLoggedIn && (
        <section className="courses-section">
          <div className="container">
            <h2 style={{ textAlign: "center" }} className="section-title2">Our Courses</h2>
            
            {loading && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Loading courses...</p>
              </div>
            )}
            
            {error && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                <p>Error loading courses: {error}</p>
              </div>
            )}
            
            {!loading && !error && (
              <div className="courses-grid">
                {courses && courses.length > 0 ? (
                  courses.map((course, index) => (
                    <div key={course.id || course._id || index} className="course-card">
                 <div 
  className="course-image" 
  style={{
    backgroundImage: imageMap[course.title] 
      ? `url(${process.env.PUBLIC_URL}/${imageMap[course.title]})` 
      : `url(${process.env.PUBLIC_URL}/course.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}
>
                  {console.log('Course title:', course.title, 'Image path:', imageMap[course.title] ? `${process.env.PUBLIC_URL}/${imageMap[course.title]}` : `${process.env.PUBLIC_URL}/course.jpg`)}


                      
                        <div className="course-badges">
                          <span className="course-modules-badge">{course.modules ? course.modules.length : 0} Modules</span>
                          <span className={`course-level-badge ${(course.level || 'beginner').toLowerCase()}`}>{course.level || 'Beginner'}</span>
                        </div>
                      </div>
                      <div className="course-content">
                        <h3 className="course-title">{course.title || 'Untitled Course'}</h3>
                        <p className="course-description">
                          {course.description || 
                           (course.title === 'ISP' ? 'Information Security Policy training covering data protection and security best practices.' :
                            course.title === 'GDPR' ? 'General Data Protection Regulation compliance training for data privacy.' :
                            course.title === 'POSH' ? 'Prevention of Sexual Harassment training for workplace safety.' :
                            course.title === 'Factory Act' ? 'Factory Act compliance and safety regulations training.' :
                            course.title === 'Welding' ? 'Welding techniques and safety training for industrial applications.' :
                            course.title === 'CNC' ? 'Computer Numerical Control machine operation and programming training.' :
                            'Professional training course designed to enhance workplace skills and compliance.')}
                        </p>
                        <Link to={`/coursedetailpage/${course.title || 'untitled'}`} className="btn course-btn">Get Started</Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>No courses available at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* About Us Section - Always visible when logged in */}
      {isLoggedIn && (
        <section className="about-section" id="aboutus">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2 className="section-title">About VISTA </h2>
                <div className="about-description">
                  <p>
                    At VISTA Innovation@work, we believe that continuous learning is the foundation of professional growth and organizational success. Our platform is designed to bridge the gap between traditional training methods and modern workforce requirements, delivering comprehensive learning solutions that empower individuals and transform businesses.
                  </p>
                  <p>
                    Founded with the vision of making quality professional education accessible to everyone, we specialize in compliance training, technical skills development, and workplace safety education. Our courses are meticulously crafted by industry experts and are designed to meet the evolving needs of today's dynamic workplace environment.
                  </p>
                </div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">100+</div>
                    <div className="stat-label">Learners Trained</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">5+</div>
                    <div className="stat-label">Courses</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">98%</div>
                    <div className="stat-label">Completion Rate</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">10+</div>
                    <div className="stat-label">Quizes</div>
                  </div>
                </div>
              </div>
              <div className="about-features">
                <h3>Why Choose VISTA?</h3>
                <div className="features-list">
                  <div className="feature-item">
                    <div className="feature-icon">🎯</div>
                    <div className="feature-content">
                      <h4>Industry-Relevant Content</h4>
                      <p>Our courses are designed by industry professionals and updated regularly to reflect current best practices and regulatory requirements.</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">📱</div>
                    <div className="feature-content">
                      <h4>Flexible Learning</h4>
                      <p>Learn at your own pace with our mobile-friendly platform that allows you to access content anytime, anywhere.</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🏆</div>
                    <div className="feature-content">
                      <h4>Recognized Certifications</h4>
                      <p>Earn certificates that are recognized by industry leaders and add real value to your professional profile.</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🤝</div>
                    <div className="feature-content">
                      <h4>Personalized Support</h4>
                      <p>Get dedicated support from our learning specialists who are committed to your success throughout your learning journey.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-section">
                <div className="footer-logo">
                  <span className="vista-blue">VISTA</span>
                  <span className="vista-pink"> Innovation@work</span>
                </div>
                <p className="footer-description">
                  Empowering professionals with industry-leading training and certification programs. 
                  Building tomorrow's workforce today.
                </p>
                <div className="social-links">
                  <a href="https://www.linkedin.com" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="https://www.twitter.com" className="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="https://www.facebook.com" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="footer-section">
                <h4 className="footer-title">Quick Links</h4>
                <ul className="footer-links">
                  <li><Link to="/">Home</Link></li>
                  {isLoggedIn && <li><Link to="/coursemodules">Courses</Link></li>}
                  {isLoggedIn && <li><Link to="/customize">Customize Course</Link></li>}
                  {isLoggedIn && <li><Link to="/user/certificates">Certificates</Link></li>}
                  <li><Link to="/admindashboard">About Us</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4 className="footer-title">Course Categories</h4>
                <ul className="footer-links">
                  <li><Link to="/courses/compliance">Compliance Training</Link></li>
                  <li><Link to="/courses/safety">Workplace Safety</Link></li>
                  <li><Link to="/courses/technical">Technical Skills</Link></li>
                  <li><Link to="/courses/office">Office Tools</Link></li>
                  <li><Link to="/courses/regulations">Regulations</Link></li>
                  <li><Link to="/courses/professional">Professional Development</Link></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4 className="footer-title">Contact Info</h4>
                <div className="contact-info">
                  <div className="contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>Coimbatore, Tamil Nadu, India</span>
                  </div>
                  <div className="contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    <span>+91 9876543210</span>
                  </div>
                  <div className="contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span>info@vistainnovation.com</span>
                  </div>
                  <div className="contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;