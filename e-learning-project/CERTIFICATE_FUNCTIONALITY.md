# Certificate Functionality Documentation

## Overview

This document describes the certificate functionality that automatically generates certificates when users complete all modules in any common course (ISP, GDPR, POSH, Factory Act, Welding, CNC, etc.).

## How It Works

### 1. Course Completion Detection

When a user completes a quiz successfully, the system:

1. **Saves Quiz Progress**: Updates the user's progress in the database
2. **Checks Course Completion**: Verifies if all modules in the course are completed
3. **Generates Certificate**: Automatically creates a certificate if the course is fully completed
4. **Navigates to Certificate**: Redirects the user to view their certificate

### 2. Database Changes

#### Certificate Model Updates
- Added `courseId` field for better tracking
- Added `completedModules` array to store completed module IDs
- Added `totalModules` field to track total modules in the course
- Added `completionDate` timestamp
- Added `certificateId` for unique certificate identification

#### New API Endpoints
- `POST /api/certificate/check-course-completion` - Checks if course is completed and generates certificate
- `GET /api/certificate/course-status/:courseName` - Gets detailed course completion status

### 3. Frontend Changes

#### Quiz Component Updates
- Added course completion check after successful quiz submission
- Added certificate button when course is completed
- Enhanced results display with course completion status

#### Certificate Page Updates
- Displays course-specific certificate information
- Shows completed modules and total modules
- Includes unique certificate ID
- Enhanced styling for better presentation

## Supported Courses

The system supports certificates for the following common courses:

1. **ISP** (Information Security Policy) - 4 modules
2. **GDPR** (General Data Protection Regulation) - 3 modules
3. **POSH** (Prevention of Sexual Harassment) - 4 modules
4. **Factory Act** - 3 modules
5. **Welding** - 3 modules
6. **CNC** - 3 modules

## User Flow

1. **User takes a quiz** for any module in a course
2. **Quiz is completed successfully** (passing score achieved)
3. **Progress is saved** to the database
4. **System checks** if all modules in the course are completed
5. **If course is completed**:
   - Certificate is automatically generated
   - User sees "View Certificate" button
   - User can click to view their certificate
6. **If course is not completed**:
   - User sees "Start Next Course" button
   - User continues to next module

## Certificate Features

### Certificate Information
- Employee name and ID
- Course title
- Completion date
- Unique certificate ID
- List of completed modules
- Total modules in the course

### Certificate Styling
- Professional certificate design
- Print-friendly layout
- Course-specific branding
- Module completion details

## Technical Implementation

### Backend Functions

#### `isCourseCompleted(employeeEmail, courseName)`
- Checks if all modules in a course are completed
- Returns completion status with details

#### `getCourseCompletionStatus(employeeEmail, courseName)`
- Gets detailed course completion information
- Returns progress statistics and module details

### Frontend Components

#### Quiz Results Enhancement
- Detects course completion
- Shows appropriate buttons (certificate or next course)
- Handles navigation to certificate page

#### Certificate Display
- Shows course-specific information
- Displays completion details
- Provides print functionality

## Database Schema

### Certificate Collection
```javascript
{
  employeeName: String,
  employeeId: String,
  employeeEmail: String,
  courseTitle: String,
  courseId: String,
  completedModules: [String], // Array of module IDs
  totalModules: Number,
  completionDate: Date,
  certificateId: String, // Unique identifier
  date: String, // For backward compatibility
  module: String, // For backward compatibility
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Check Course Completion
```
POST /api/certificate/check-course-completion
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseName": "ISP",
  "courseId": "isp_course"
}
```

### Get Course Status
```
GET /api/certificate/course-status/:courseName
Authorization: Bearer <token>
```

## Testing

To test the certificate functionality:

1. **Seed the database** with course data:
   ```bash
   node course_seed.js
   ```

2. **Complete all modules** in a course by taking quizzes

3. **Verify certificate generation** when the last module is completed

4. **Check certificate display** on the certificate page

## Future Enhancements

- Certificate templates for different courses
- Certificate validation and verification
- Certificate sharing functionality
- Certificate expiration dates
- Bulk certificate generation for admins 