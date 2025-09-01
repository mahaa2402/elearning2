# Assigned Course Progress Timestamp System

## Overview
This system creates a parallel collection called `assignedcourseprogresstimestamp` that tracks when courses are assigned to employees, similar to how `assignedcourseprogress` tracks progress values.

## Database Collection
**Collection Name:** `assignedcourseprogresstimestamp`

### Schema Structure
```javascript
{
  employeeId: ObjectId,           // Reference to Employee
  employeeName: String,           // Employee's full name
  employeeEmail: String,          // Employee's email (unique identifier)
  employeeDepartment: String,     // Employee's department
  
  // Dynamic timestamp fields for each assigned course
  assignedCourseTimestamp: Map<String, Date>,
  
  // Detailed assignment tracking
  courseTimestampAssignments: [{
    courseName: String,           // Name of the assigned course
    assignedBy: {
      adminId: ObjectId,          // Admin who assigned the course
      adminName: String,          // Admin's name
      adminEmail: String          // Admin's email
    },
    assignedAt: Date,             // When the course was assigned
    deadline: Date,               // Course completion deadline
    status: String                // 'assigned', 'in-progress', 'completed', 'overdue'
  }],
  
  updatedAt: Date                 // Last update timestamp
}
```

## Key Features

### 1. **Automatic Timestamp Creation**
- When a manager assigns a task/course, a timestamp entry is automatically created
- Timestamp is set to the current date/time when assigned
- Course is initialized with status 'assigned'

### 2. **Progress Tracking**
- Timestamps are updated when modules are completed
- Status changes from 'assigned' → 'in-progress' → 'completed'
- Each status change updates the timestamp

### 3. **Admin Assignment Tracking**
- Records which admin assigned each course
- Tracks assignment date and deadlines
- Maintains assignment history

## API Endpoints

### Base URL: `/api/assigned-course-progress-timestamp`

#### **POST** `/initialize`
- **Purpose:** Initialize timestamp progress for a new employee
- **Access:** Employee only
- **Body:** None (uses authenticated user's email)

#### **POST** `/assign-course-timestamp`
- **Purpose:** Assign a course timestamp to an employee
- **Access:** Admin only
- **Body:** 
  ```json
  {
    "employeeEmail": "employee@company.com",
    "courseName": "Course Title",
    "deadline": "2024-12-31T23:59:59.000Z"
  }
  ```

#### **PATCH** `/update-timestamp`
- **Purpose:** Update timestamp when module is completed
- **Access:** Employee only
- **Body:**
  ```json
  {
    "courseName": "Course Title"
  }
  ```

#### **GET** `/employee/:employeeEmail`
- **Purpose:** Get employee's timestamp progress
- **Access:** Employee (own data) or Admin (any employee)
- **Params:** `employeeEmail` - Employee's email address

#### **GET** `/all-employees`
- **Purpose:** Get all employees' timestamp progress
- **Access:** Admin only

#### **GET** `/employee/:employeeEmail/courses`
- **Purpose:** Get employee's assigned courses with timestamps
- **Access:** Employee (own data) or Admin (any employee)

#### **PATCH** `/mark-completed`
- **Purpose:** Mark a course as completed
- **Access:** Employee only
- **Body:**
  ```json
  {
    "courseName": "Course Title"
  }
  ```

#### **DELETE** `/remove-course-timestamp`
- **Purpose:** Remove a course assignment
- **Access:** Admin only
- **Body:**
  ```json
  {
    "employeeEmail": "employee@company.com",
    "courseName": "Course Title"
  }
  ```

#### **GET** `/statistics`
- **Purpose:** Get overall statistics
- **Access:** Admin only

#### **GET** `/check-assignment/:employeeEmail/:courseName`
- **Purpose:** Check if a course is assigned to an employee
- **Access:** Employee (own data) or Admin (any employee)

## Integration Points

### 1. **Task Assignment (Admin Controller)**
When a task is assigned via `createAssignedTask` or `assignTaskByEmail`:
- Creates entry in `assignedcourseprogress` (progress = 0)
- Creates entry in `assignedcourseprogresstimestamp` (timestamp = current date)

### 2. **Progress Updates (Progress Controller)**
When quiz progress is saved:
- Updates progress in `assignedcourseprogress` (+1)
- Updates timestamp in `assignedcourseprogresstimestamp` (current date)

### 3. **Automatic Initialization**
- Called during employee registration
- Creates empty timestamp document for new employees

## Usage Examples

### Assigning a Course
```javascript
// Admin assigns a course
const result = await assignCourseTimestampToEmployee(
  'employee@company.com',
  'Information Security',
  adminId,
  deadlineDate
);
```

### Checking Assignment Status
```javascript
// Check if course is assigned
const isAssigned = await isCourseTimestampAssignedToEmployee(
  'employee@company.com',
  'Information Security'
);
```

### Getting Employee Progress
```javascript
// Get employee's timestamp progress
const progress = await getEmployeeAssignedCourseTimestampProgress(
  'employee@company.com'
);
```

## Benefits

1. **Time Tracking:** Know exactly when courses were assigned and completed
2. **Audit Trail:** Track which admin assigned what and when
3. **Performance Monitoring:** Measure time to completion for courses
4. **Compliance:** Maintain records for training compliance
5. **Analytics:** Generate reports on course assignment patterns

## Error Handling

- All functions include comprehensive error handling
- Failed timestamp operations don't break main task assignment
- Detailed logging for debugging and monitoring
- Graceful fallbacks when timestamp operations fail

## Testing

Run the test script to verify functionality:
```bash
node test-timestamp.js
```

## Future Enhancements

1. **Batch Operations:** Support for assigning multiple courses at once
2. **Notification System:** Alerts when deadlines approach
3. **Reporting Dashboard:** Visual representation of timestamp data
4. **Integration APIs:** Connect with external HR systems
5. **Mobile Support:** Timestamp updates via mobile app


