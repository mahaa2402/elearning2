import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import './employeetracking.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';   // ✅ Sidebar import

// Employee Card component
const EmployeeCard = ({ employee, onViewDetails }) => {
  return (
    <div className="employee-card">
      <div className="employee-card-header">
        <div className="employee-avatar">
          <User style={{ width: '24px', height: '24px', color: 'white' }} />
        </div>
        <div>
          <h3 className="employee-name">{employee.name}</h3>
          <span className="employee-department-badge">{employee.department}</span>
        </div>
      </div>

      <div className="employee-info-list">
        <div className="employee-info-item">
          <Mail className="employee-info-icon" />
          <span>{employee.email}</span>
        </div>
        <div className="employee-info-item">
          <Building className="employee-info-icon" />
          <span>{employee.department}</span>
        </div>
        <div className="employee-info-item">
          <Calendar className="employee-info-icon" />
          <span>
            Joined:{' '}
            {new Date(employee.createdAt || employee.joinDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <button className="button2" onClick={() => onViewDetails(employee)}>
        View Details
      </button>

      <div className="employee-card-footer">
        <span className="employee-footer-label">Employee ID</span>
        <span className="employee-footer-value">
          {employee._id?.slice(-8) || employee.id?.slice(-8) || 'N/A'}
        </span>
      </div>
    </div>
  );
};

// Main Directory
const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const navigate = useNavigate();

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
      document.cookie.split('; ').find((row) => row.startsWith('authToken='))?.split('=')[1] ||
      document.cookie.split('; ').find((row) => row.startsWith('accessToken='))?.split('=')[1] ||
      document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1]
    );
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch('http://localhost:5000/api/employee/employees', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Failed to fetch employees: ${err.message}`);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const onViewDetails = (employee) => {
    navigate(`/certificatedetail/${employee._id}`);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="flex h-screen w-screen absolute top-0 left-0">
      {/* ✅ Sidebar on the left */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 overflow-auto employee-directory-container">
        <div className="employee-directory-max-width">
          {/* Loading */}
          {loading && (
            <div className="employee-directory-loading-container">
              <div className="employee-directory-loading-content">
                <RefreshCw
                  className="employee-directory-spin"
                  style={{ width: '24px', height: '24px', color: '#3b82f6' }}
                />
                <span className="employee-directory-loading-text">
                  Loading employees...
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="employee-directory-error-container">
              <div className="employee-directory-error-header">
                <AlertCircle
                  style={{ width: '24px', height: '24px', color: '#dc2626' }}
                />
                <h2 className="employee-directory-error-title">
                  Error Loading Employees
                </h2>
              </div>
              <p className="employee-directory-error-text">{error}</p>
              {error.includes('Authentication') && (
                <div className="employee-directory-warning-box">
                  <p className="employee-directory-warning-text">
                    <strong>Troubleshooting:</strong> Make sure you're logged in.
                  </p>
                </div>
              )}
              <button
                className="employee-directory-error-button"
                onClick={fetchEmployees}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Header */}
          {!loading && !error && (
            <>
              <div className="employee-directory-header">
                <div>
                  <h1 className="employee-directory-title">Employee Directory</h1>
                  <p className="employee-directory-subtitle">
                    {employees.length > 0
                      ? `Total Employees: ${employees.length}`
                      : 'Connecting to database...'}
                  </p>
                </div>
                <div className="employee-directory-button-group">
                  <button
                    className="employee-directory-button"
                    onClick={fetchEmployees}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={loading ? 'employee-directory-spin' : ''}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>{loading ? 'Loading...' : 'Refresh'}</span>
                  </button>
                </div>
              </div>

              {/* Employee Grid */}
              {employees.length === 0 ? (
                <div className="employee-directory-empty-state">
                  <User
                    style={{
                      width: '48px',
                      height: '48px',
                      color: '#9ca3af',
                      margin: '0 auto 16px',
                    }}
                  />
                  <h3 className="employee-directory-empty-title">
                    No Employees Found
                  </h3>
                  <p className="employee-directory-empty-text">
                    No employee records found in the database.
                  </p>
                  <button
                    className="employee-directory-button"
                    onClick={fetchEmployees}
                  >
                    Try Loading Again
                  </button>
                </div>
              ) : (
                <div className="employee-directory-grid">
                  {employees.map((employee) => (
                    <EmployeeCard
                      key={employee._id || employee.id || employee.email}
                      employee={employee}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Certificate Viewer */}
          {selectedCertificate && (
            <div className="employee-certificate-modal">
              <h2>Certificate Details for {selectedEmployee?.name}</h2>
              <p>
                <strong>Course:</strong> {selectedCertificate.courseTitle}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(selectedCertificate.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Awarded By:</strong> {selectedCertificate.awarder}
              </p>
              <p>
                <strong>Description:</strong> {selectedCertificate.description}
              </p>
              <button
                className="employee-directory-button"
                onClick={() => {
                  setSelectedCertificate(null);
                  setSelectedEmployee(null);
                }}
              >
                Close
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="employee-directory-footer">
            <p>Employee Directory System - Using existing authentication</p>
            <p className="employee-directory-footer-line">
              Auth token detected: {getAuthToken() ? '✅ Found' : '❌ Not found'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDirectory;
