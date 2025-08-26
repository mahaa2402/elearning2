import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './certificatedetail.css';

const CertificateDetails = () => {
  const { id } = useParams(); // employee ID passed from route
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressList, setProgressList] = useState([]); // List of user progress objects
  const [progressLoading, setProgressLoading] = useState(false);

  const getAuthToken = () => {
    return (
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('jwt') ||
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('accessToken') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('jwt') ||
      document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1] ||
      document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] ||
      document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    );
  };

  // Fetch available API endpoints first to understand what's available
  const discoverApiEndpoints = async () => {
    const token = getAuthToken();
    const commonPaths = [
      '/api/progress',
      '/api/user-progress', 
      '/api/users',
      '/api/courses',
      '/api/modules',
      '/api/learning'
    ];
    
    console.log('🔍 Discovering available API endpoints...');
    const availableEndpoints = [];
    
    for (const path of commonPaths) {
      try {
        const res = await fetch(`http://localhost:5000${path}`, {
          method: 'OPTIONS',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok || res.status === 405) { // 405 = Method Not Allowed but endpoint exists
          availableEndpoints.push(path);
          console.log(`✅ Found endpoint: ${path}`);
        }
      } catch (err) {
        // Endpoint doesn't exist, skip
      }
    }
    
    console.log('Available endpoints:', availableEndpoints);
    return availableEndpoints;
  };

  // Fetch user progress for a given email and course
  const fetchUserProgress = async (employeeEmail, courseName) => {
    if (!employeeEmail || !courseName) {
      console.warn('No employee email or course name provided for progress fetch');
      return [];
    }
    try {
      setProgressLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.warn('No auth token found for progress fetch');
        return [];
      }
      const url = `http://localhost:5000/api/progress/get?userEmail=${encodeURIComponent(employeeEmail)}&courseName=${encodeURIComponent(courseName)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        let progressArray = [];
        if (Array.isArray(data.progress)) {
          progressArray = data.progress;
        } else if (data.progress) {
          progressArray = [data.progress];
        }
        return progressArray;
      } else {
        console.warn(`Failed to fetch progress: ${res.status} ${res.statusText}`);
        return [];
      }
    } catch (err) {
      console.error('Error fetching user progress:', err);
      return [];
    } finally {
      setProgressLoading(false);
    }
  };

  // Calculate progress percentage for a course
  const calculateProgressPercentage = (progress) => {
    if (!progress) return 0;
    
    // Handle different possible progress data structures
    if (progress.completedModules && progress.totalModules) {
      const completed = Array.isArray(progress.completedModules) 
        ? progress.completedModules.length 
        : progress.completedModules;
      return Math.round((completed / progress.totalModules) * 100);
    }
    
    if (progress.completed && progress.total) {
      return Math.round((progress.completed / progress.total) * 100);
    }
    
    if (progress.progressPercentage !== undefined) {
      return Math.round(progress.progressPercentage);
    }
    
    return 0;
  };

  const fetchCertificateDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('No authentication token found. Please log in.');
      }

      if (!id) {
        throw new Error('No employee ID provided');
      }

      console.log(`🔍 Fetching certificates for employee ID: ${id}`);

      // First, try to get all certificates to see what's available
      const allCertificatesEndpoint = `http://localhost:5000/api/certificates/all`;
      console.log(`🔍 Checking all certificates from: ${allCertificatesEndpoint}`);
      
      const allRes = await fetch(allCertificatesEndpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include'
      });

      if (allRes.ok) {
        const allData = await allRes.json();
        console.log(`📊 Total certificates in database: ${allData.count}`);
        if (allData.certificates && allData.certificates.length > 0) {
          console.log('📋 Available certificates:', allData.certificates.map(cert => ({
            id: cert._id,
            employeeId: cert.employeeId,
            employeeEmail: cert.employeeEmail,
            employeeName: cert.employeeName,
            courseTitle: cert.courseTitle
          })));
        }
      }

      // Use the correct endpoint for fetching all certificates for an employee
      const endpoint = `http://localhost:5000/api/certificates/${id}`;
      console.log(`Fetching certificates from: ${endpoint}`);
      
      const res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include'
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`No certificates found for employee ID: ${id}. Please check if this employee has completed any courses.`);
        } else if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else {
          throw new Error(`Failed to fetch certificate details: ${res.status} ${res.statusText}`);
        }
      }

      const data = await res.json();
      console.log('Certificate data received:', data);
      
      const certificatesArray = Array.isArray(data.certificates) ? data.certificates : 
                               (Array.isArray(data) ? data : []);
      setCertificates(certificatesArray);

      // Fetch user progress for the employee (by email and courseName)
      const email = certificatesArray.find(cert => cert.employeeEmail)?.employeeEmail;
      const courseName = certificatesArray.find(cert => cert.courseTitle)?.courseTitle || certificatesArray.find(cert => cert.courseName)?.courseName;
      if (email && courseName) {
        console.log(`🔍 Found employee identifiers - Email: ${email}, Course: ${courseName}`);
        const progressArr = await fetchUserProgress(email, courseName);
        setProgressList(progressArr);
      } else {
        console.warn('❌ No employee email or course name found in certificates, cannot fetch progress');
      }
    } catch (err) {
      console.error('Error fetching certificate details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificateDetails();
    // eslint-disable-next-line
  }, [id]);

  if (loading) {
    return (
      <div className="certificate-page">
        <div className="loading-container">
          <p className="loading-msg">Loading certificate details...</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificate-page">
        <div className="error-container">
          <p className="error-msg">❌ {error}</p>
          <button className="back-button" onClick={() => navigate(-1)}>⬅ Go Back</button>
        </div>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="certificate-page">
        <div className="no-data-container">
          <p className="error-msg">📭 No certificates found for this employee</p>
          <div className="debug-info" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '14px' }}>
            <h4>🔧 Debug Information:</h4>
            <p><strong>Employee ID:</strong> {id}</p>
            <p><strong>Possible reasons:</strong></p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>This employee hasn't completed any courses yet</li>
              <li>Certificates haven't been generated for completed courses</li>
              <li>The employee ID doesn't match the certificate records</li>
              <li>Check the browser console for more detailed information</li>
            </ul>
            <p><strong>Next steps:</strong></p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Verify the employee has completed courses</li>
              <li>Check if certificates were generated for completed courses</li>
              <li>Ensure the employee ID matches the certificate database</li>
            </ul>
          </div>
          <button className="back-button" onClick={() => navigate(-1)}>⬅ Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <div className="page-header">
        <h1>🎓 Certificate Details</h1>
        <button className="back-button" onClick={() => navigate(-1)}>⬅ Go Back</button>
      </div>

      {/* Certificates Section */}
      <div className="certificates-container">
        <h2>🏅 Certificates ({certificates.length})</h2>
        {certificates.map((certificate, index) => (
          <div key={certificate._id || index} className="certificate-box">
            <div className="certificate-header">
              <h3>{certificate.courseTitle || 'Untitled Course'}</h3>
              {certificate._id && <span className="certificate-id">ID: {certificate._id}</span>}
            </div>
            
            <div className="certificate-details">
              <p><strong>🧑‍💼 Employee Name:</strong> {certificate.employeeName || 'N/A'}</p>
              <p><strong>📧 Employee Email:</strong> {certificate.employeeEmail || 'N/A'}</p>
              <p><strong>🆔 Employee ID:</strong> {certificate.employeeId || 'N/A'}</p>
              <p><strong>📅 Earned On:</strong> {
                certificate.date && !isNaN(Date.parse(certificate.date)) 
                  ? new Date(certificate.date).toLocaleDateString() 
                  : (certificate.createdAt && !isNaN(Date.parse(certificate.createdAt)) 
                      ? new Date(certificate.createdAt).toLocaleDateString() 
                      : 'N/A')
              }</p>
              
              {certificate.module && <p><strong>📚 Module:</strong> {certificate.module}</p>}
              {certificate.awarder && <p><strong>🎖️ Awarded By:</strong> {certificate.awarder}</p>}
              {certificate.description && <p><strong>📝 Description:</strong> {certificate.description}</p>}
              
              {certificate.createdAt && !isNaN(Date.parse(certificate.createdAt)) && (
                <p><strong>🕒 Created:</strong> {new Date(certificate.createdAt).toLocaleString()}</p>
              )}
              {certificate.updatedAt && !isNaN(Date.parse(certificate.updatedAt)) && (
                <p><strong>🔄 Updated:</strong> {new Date(certificate.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* User Progress Section */}
      <div className="progress-container">
        <h2>📊 Learning Progress</h2>
        
        {progressLoading ? (
          <div className="progress-loading">
            <p>Loading progress data...</p>
            <div className="spinner"></div>
          </div>
        ) : progressList && progressList.length > 0 ? (
          <div className="progress-grid">
            {progressList.map((progress, idx) => (
              <div key={progress.id || progress._id || idx} className="progress-box">
                <div className="progress-header">
                  <h3>{progress.courseName || progress.courseTitle || 'Unknown Course'}</h3>
                  <div className="progress-percentage">
                    {calculateProgressPercentage(progress)}%
                  </div>
                </div>
                
                <div className="progress-details">
                  <p><strong>📚 Last Accessed Module:</strong> {
                    progress.lastAccessedModule || 
                    progress.currentModule || 
                    'None'
                  }</p>
                  
                  {(progress.lastAccessedAt || progress.updatedAt) && (
                    <p><strong>🕒 Last Activity:</strong> {
                      new Date(progress.lastAccessedAt || progress.updatedAt).toLocaleDateString()
                    }</p>
                  )}
                  
                  <div className="modules-section">
                    <p><strong>✅ Completed Modules ({
                      Array.isArray(progress.completedModules) 
                        ? progress.completedModules.length 
                        : (progress.completedModules || 0)
                    }):</strong></p>
                    
                    {progress.completedModules && Array.isArray(progress.completedModules) && progress.completedModules.length > 0 ? (
                      <ul className="completed-modules-list">
                        {progress.completedModules.map((mod, i) => (
                          <li key={mod.id || mod._id || i} className="module-item">
                            <span className="module-id">
                              {mod.m_id || mod.moduleId || mod.name || mod.title || `Module ${i + 1}`}
                            </span>
                            <span className="completion-date">
                              {mod.completedAt ? new Date(mod.completedAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-modules">No modules completed yet</p>
                    )}
                  </div>

                  {progress.totalModules && (
                    <div className="progress-bar-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${calculateProgressPercentage(progress)}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {Array.isArray(progress.completedModules) 
                          ? progress.completedModules.length 
                          : (progress.completedModules || 0)
                        } of {progress.totalModules} modules completed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-progress">
            <p>📈 No learning progress data found for this employee</p>
            <div className="debug-info" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '14px' }}>
              <h4>🔧 Debug Information:</h4>
              <p><strong>Employee Email:</strong> {certificates[0]?.employeeEmail || 'Not found'}</p>
              <p><strong>Employee ID:</strong> {certificates[0]?.employeeId || 'Not found'}</p>
              <p><strong>Searched for progress using:</strong> {
                certificates[0]?.employeeEmail 
                  ? `Email: ${certificates[0].employeeEmail}${certificates[0]?.employeeId ? ` and ID: ${certificates[0].employeeId}` : ''}` 
                  : certificates[0]?.employeeId 
                    ? `ID: ${certificates[0].employeeId}` 
                    : 'No identifier available'
              }</p>
              <p><strong>Possible solutions:</strong></p>
              <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                <li>Check if your backend has a progress/learning API endpoint</li>
                <li>Verify the endpoint path matches your backend routes</li>
                <li>Ensure the employee email/ID in certificates matches the progress data</li>
                <li>Check browser Network tab for exact API responses</li>
                <li>Verify authentication token has required permissions</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );};

export default CertificateDetails;
