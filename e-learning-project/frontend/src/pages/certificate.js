import React, { useEffect, useState } from 'react';
import './certificate.css';

const CertificatePage = () => {
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);

  // Get employee data from localStorage or user session
  const getEmployeeData = () => {
    let employeeName = "Employee Name";
    let employeeId = "Unknown ID";
    
    // Try to get from user session first
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      try {
        const user = JSON.parse(userSession);
        employeeName = user.name || user.email?.split('@')[0] || "Employee Name";
        employeeId = user._id || user.id || "Unknown ID";
      } catch (e) {
        console.error('Error parsing user session:', e);
      }
    }
    
    // Fallback to individual localStorage items
    if (employeeName === "Employee Name") {
      employeeName = localStorage.getItem('employeeName') || "Employee Name";
    }
    if (employeeId === "Unknown ID") {
      employeeId = localStorage.getItem('employeeId') || "Unknown ID";
    }
    
    return { employeeName, employeeId };
  };

  const { employeeName, employeeId } = getEmployeeData();

  useEffect(() => {
    const initializeCertificate = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if this is a newly completed course or a selected certificate from dashboard
        const isCourseCompleted = localStorage.getItem('courseCompleted') === 'true';
        const completedCourseName = localStorage.getItem('completedCourseName');
        const lastGeneratedCertificate = localStorage.getItem('lastGeneratedCertificate');
        const selectedCertificate = localStorage.getItem('selectedCertificate');

        // Priority 1: Check for selected certificate from dashboard
        if (selectedCertificate) {
          const certificate = JSON.parse(selectedCertificate);
          setCertificateData(certificate);
          setCourseCompleted(true);
          setSuccess(true);
          setLoading(false);
          
          // Clear the temporary data
          localStorage.removeItem('selectedCertificate');
          localStorage.removeItem('courseCompleted');
          localStorage.removeItem('completedCourseName');
          localStorage.removeItem('lastGeneratedCertificate');
          
          console.log('🎉 Displaying selected certificate from dashboard:', certificate);
          return;
        }

        // Priority 2: Check if this is a newly completed course with generated certificate
        if (isCourseCompleted && lastGeneratedCertificate) {
          // Use the newly generated certificate data
          const certificate = JSON.parse(lastGeneratedCertificate);
          setCertificateData(certificate);
          setCourseCompleted(true);
          setSuccess(true);
          setLoading(false);
          
          // Clear the temporary data
          localStorage.removeItem('courseCompleted');
          localStorage.removeItem('completedCourseName');
          localStorage.removeItem('lastGeneratedCertificate');
          
          console.log('🎉 Displaying newly generated certificate:', certificate);
          return;
        }

        // Priority 3: Check if this is a newly completed course (from quiz completion)
        if (isCourseCompleted && completedCourseName) {
          // Get user email from token
          const token = localStorage.getItem('authToken') || localStorage.getItem('token');
          let userEmail = '';
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              userEmail = payload.email;
            } catch (e) {
              console.error('Error parsing token:', e);
            }
          }
          
          // Create a temporary certificate object for display
          const tempCertificate = {
            courseTitle: completedCourseName,
            employeeName: employeeName,
            employeeId: employeeId,
            employeeEmail: userEmail,
            date: new Date().toLocaleDateString(),
            certificateId: `CERT-${Date.now()}`,
            completionDate: new Date(),
            completedModules: ['All Modules'],
            totalModules: 1
          };
          
          setCertificateData(tempCertificate);
          setCourseCompleted(true);
          setSuccess(true);
          setLoading(false);
          
          // Clear the temporary data
          localStorage.removeItem('courseCompleted');
          localStorage.removeItem('completedCourseName');
          
          console.log('🎉 Displaying course completion certificate:', tempCertificate);
          return;
        }

        // Fallback to the original certificate logic
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token not found. Please login again.');
          setLoading(false);
          return;
        }

        // Use course-specific title if available
        const courseTitle = completedCourseName || "Information Security & Data Protection";
        
        // Get certificate from the new controller
        const response = await fetch(`http://localhost:5000/api/certificate/employee-certificates`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 403) {
            setError('Session expired. Please login again.');
            // Clear invalid token
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
          } else {
            setError(data.message || 'Failed to fetch certificate');
          }
        } else {
          if (data.success && data.certificates && data.certificates.length > 0) {
            // Use the most recent certificate
            setCertificateData(data.certificates[0]);
            setSuccess(true);
            console.log('Certificate fetched successfully:', data.certificates[0]);
          } else {
            setError('No certificates found');
          }
        }
      } catch (error) {
        console.error('Failed to initialize certificate:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeCertificate();
  }, []);

  if (loading) {
    return (
      <div className="certificate-container">
        <div className="certificate">
          <h2>Loading Certificate...</h2>
          <p>Please wait while we prepare your certificate.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificate-container">
        <div className="certificate">
          <h2>Error</h2>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  // Get certificate details
  const courseTitle = certificateData?.courseTitle || "Information Security & Data Protection";
  const date = certificateData?.date || new Date().toLocaleDateString();
  const certificateId = certificateData?.certificateId || "CERT-001";
  const completedModules = certificateData?.completedModules || [];
  const totalModules = certificateData?.totalModules || 0;

  return (
    <div className="certificate-container">
      <div className="certificate">
        {success && (
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px' 
          }}>
            {courseCompleted && (
              <p>🎉 Congratulations! You have successfully completed the {courseTitle} course!</p>
            )}
          </div>
        )}
        
        <h1 className="certificate-title">Certificate of Completion</h1>
        <p className="certificate-text">This is to certify that</p>
        <h2 className="employee-name">{employeeName}</h2>
        <p className="certificate-text">has successfully completed the course</p>
        <h3 className="course-title">{courseTitle}</h3>
        
        {/* Course completion details */}
        {totalModules > 0 && (
          <div className="course-details">
            <p className="completion-info">
              <strong>Modules Completed:</strong> {completedModules.length} of {totalModules}
            </p>
            {completedModules.length > 0 && (
              <div className="modules-list">
                <p><strong>Completed Modules:</strong></p>
                <ul>
                  {completedModules.map((moduleId, index) => (
                    <li key={index}>{moduleId}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <p className="date">Date: {date}</p>
        <p className="certificate-id">Certificate ID: {certificateId}</p>

        <div className="signature-section">
          <div className="signature">
            <p>Authorized Signature</p>
            <hr />
          </div>
        </div>

        <button className="print-button" onClick={() => window.print()}>Print Certificate</button>
      </div>
    </div>
  );
};

export default CertificatePage;
