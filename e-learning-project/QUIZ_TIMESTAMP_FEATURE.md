# Quiz Timestamp Feature

## Overview
This feature implements a 24-hour cooldown system for quiz retakes. When an employee fails a quiz, they must wait 24 hours before they can attempt it again. This ensures proper learning and prevents rapid retakes.

## Features

### 1. Quiz Availability Check
- **Frontend**: Before allowing quiz access, the system checks if the employee can take the quiz
- **Backend**: Validates quiz availability based on timestamp and 24-hour rule
- **User Experience**: Shows clear message when quiz is blocked with countdown timer

### 2. Timestamp Management
- **Storage**: Quiz timestamps are stored in the `commonuserprogresses` collection
- **Structure**: Each course has its own timestamp field in the `quizTimestamp` Map
- **Isolation**: Timestamps are course-specific (failing one course doesn't block others)

### 3. Cooldown Calculation
- **Precise Timing**: Calculates remaining hours and minutes until quiz is available
- **Real-time Updates**: Shows countdown in user-friendly format
- **Automatic Reset**: Timestamps automatically expire after 24 hours

## Database Schema Changes

### CommonUserProgress Model
```javascript
const commonUserProgressSchema = new mongoose.Schema({
  // ... existing fields ...
  quizTimestamp: { type: Map, of: Date, default: {} }, // NEW FIELD
  // ... existing fields ...
});
```

### Field Description
- `quizTimestamp`: A Map where keys are course names and values are Date objects
- `null` or missing timestamp = quiz is available
- `Date` object = timestamp when quiz was last failed (blocks for 24 hours)

## API Endpoints

### 1. Check Quiz Availability
```
POST /api/courses/check-quiz-availability
```

**Request Body:**
```json
{
  "courseName": "Course Name"
}
```

**Response:**
```json
{
  "canTake": true/false,
  "cooldown": {
    "hours": 5,
    "minutes": 30,
    "available": false
  },
  "message": "Quiz is available" / "Quiz is not available yet"
}
```

### 2. Update Quiz Timestamp
```
POST /api/courses/update-quiz-timestamp
```

**Request Body:**
```json
{
  "courseName": "Course Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz timestamp updated",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

## Frontend Implementation

### 1. Quiz Availability Check
- **Location**: `assignedquizpage.js` - `useEffect` hook
- **Trigger**: When component mounts
- **Action**: Blocks quiz access if timestamp is active

### 2. Blocked Quiz UI
- **Component**: `quizBlocked` state
- **Features**: 
  - Countdown timer showing remaining time
  - Clear explanation of why quiz is blocked
  - Educational note about cooldown purpose

### 3. Timestamp Update
- **Trigger**: When quiz is submitted and failed
- **Action**: Updates timestamp to current time
- **Result**: Blocks quiz for next 24 hours

### 4. Navigation Protection
- **Location**: `taskmodulepage.js` - Quiz item click handler
- **Action**: Checks availability before allowing navigation
- **User Experience**: Shows popup with cooldown information

## User Experience Flow

### 1. First Quiz Attempt
1. Employee clicks on quiz
2. System checks availability (no timestamp = available)
3. Quiz loads normally
4. Employee completes quiz

### 2. Failed Quiz Attempt
1. Employee fails quiz
2. System automatically updates timestamp
3. Employee sees failure message
4. Retry button is available

### 3. Retry Attempt (Before 24 Hours)
1. Employee clicks "Retry Quiz"
2. System checks availability (timestamp active = blocked)
3. Employee sees blocked quiz page with countdown
4. Clear explanation of why quiz is blocked

### 4. Retry Attempt (After 24 Hours)
1. Employee clicks "Retry Quiz"
2. System checks availability (timestamp expired = available)
3. Quiz loads normally
4. Employee can retake quiz

## Error Handling

### 1. Network Errors
- **Frontend**: Graceful fallback to allow quiz access
- **Backend**: Proper error responses with status codes
- **Logging**: Comprehensive error logging for debugging

### 2. Authentication Errors
- **Token Validation**: JWT verification before timestamp operations
- **User Identification**: Employee email extraction from token
- **Security**: Prevents unauthorized timestamp manipulation

### 3. Database Errors
- **Connection Issues**: Graceful handling of MongoDB connection problems
- **Validation Errors**: Proper error messages for invalid data
- **Fallback**: Default to blocking quiz on critical errors

## Testing

### Test Script
Run the test script to verify functionality:
```bash
cd backend
node test-quiz-timestamps.js
```

### Test Coverage
- ✅ Employee initialization
- ✅ Initial quiz availability
- ✅ Timestamp update after failure
- ✅ Quiz blocking after timestamp update
- ✅ Cooldown calculation
- ✅ Course isolation

## Migration

### Existing Data
- **New Field**: `quizTimestamp` field is automatically added
- **Default Value**: `null` (quiz available) for all existing courses
- **Backward Compatibility**: Existing functionality remains unchanged

### Migration Functions
```javascript
// Migrate existing documents
await migrateExistingDocuments();

// Reset all progress (including timestamps)
await resetAllProgress();
```

## Configuration

### Environment Variables
- `JWT_SECRET`: Required for token verification
- `MONGODB_URI`: Database connection string

### Cooldown Duration
- **Current**: 24 hours (hardcoded)
- **Future**: Configurable via environment variable

## Security Considerations

### 1. Token Validation
- All timestamp operations require valid JWT
- Employee can only modify their own timestamps
- No cross-user timestamp manipulation

### 2. Rate Limiting
- Timestamp updates are limited to quiz submissions
- No direct API abuse possible
- Automatic cooldown prevents rapid retakes

### 3. Data Integrity
- Timestamps are stored as proper Date objects
- Validation ensures proper data types
- Database constraints prevent corruption

## Future Enhancements

### 1. Configurable Cooldowns
- Different cooldown periods for different courses
- Admin-configurable cooldown settings
- Course-specific retry policies

### 2. Advanced Analytics
- Track retry patterns
- Identify problematic quizzes
- Employee performance metrics

### 3. Notification System
- Email notifications when quiz becomes available
- Push notifications for mobile users
- Calendar integration for retry scheduling

## Troubleshooting

### Common Issues

#### 1. Quiz Always Blocked
- Check if timestamp was set incorrectly
- Verify database connection
- Check authentication token validity

#### 2. Timestamp Not Updating
- Verify API endpoint accessibility
- Check network connectivity
- Validate request payload format

#### 3. Cooldown Calculation Errors
- Verify system clock accuracy
- Check timezone settings
- Validate Date object handling

### Debug Commands
```javascript
// Check specific employee's quiz status
const progress = await CommonUserProgress.findOne({ employeeEmail: 'user@example.com' });
console.log('Quiz timestamps:', progress.quizTimestamp);

// Check specific course availability
const canTake = await canTakeQuiz('user@example.com', 'Course Name');
console.log('Can take quiz:', canTake);

// Get cooldown details
const cooldown = await getQuizCooldownRemaining('user@example.com', 'Course Name');
console.log('Cooldown remaining:', cooldown);
```

## Support

For technical support or questions about this feature:
1. Check the logs for error messages
2. Verify database connectivity
3. Test with the provided test script
4. Review this documentation for configuration details

