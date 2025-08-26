# Sequential Unlocking System

## Overview

The sequential unlocking system ensures that users must complete lessons and quizzes in order. Initially, only the first lesson and first quiz are unlocked. As users complete each lesson's quiz, only the next lesson and quiz become available.

## How It Works

### 1. Initial State
- Only Lesson 1 and Quiz 1 are unlocked
- All other lessons (2,3,4) and quizzes (2,3,4) are locked (🔒)
- Users cannot access locked content

### 2. Progress Tracking
- When a user completes a quiz, their progress is saved to the database
- The system tracks which modules/lessons have been completed
- Progress is stored per user and per course

### 3. Unlocking Logic
- **Lesson Unlocking**: A lesson is unlocked if the previous lesson's quiz has been completed
- **Quiz Unlocking**: A quiz is unlocked if the corresponding lesson is unlocked AND the quiz hasn't been completed yet
- **First Lesson/Quiz**: Always unlocked by default
- **Future Content**: All lessons and quizzes beyond the next available one remain locked

### 4. Visual Indicators
- **Locked**: 🔒 icon with grayed-out appearance
- **Unlocked**: Blue background, clickable
- **Completed**: ✓ icon with green styling
- **Current**: Yellow background, highlighted
- **Available**: Light blue background, ready to access

## Example Progression

### Step 1: Initial State
- ✅ Lesson 1: Unlocked
- ✅ Quiz 1: Available
- 🔒 Lesson 2: Locked
- 🔒 Quiz 2: Locked
- 🔒 Lesson 3: Locked
- 🔒 Quiz 3: Locked
- 🔒 Lesson 4: Locked
- 🔒 Quiz 4: Locked

### Step 2: After Completing Quiz 1
- ✅ Lesson 1: Completed
- ✅ Quiz 1: Completed
- ✅ Lesson 2: Unlocked
- ✅ Quiz 2: Available
- 🔒 Lesson 3: Locked
- 🔒 Quiz 3: Locked
- 🔒 Lesson 4: Locked
- 🔒 Quiz 4: Locked

### Step 3: After Completing Quiz 2
- ✅ Lesson 1: Completed
- ✅ Quiz 1: Completed
- ✅ Lesson 2: Completed
- ✅ Quiz 2: Completed
- ✅ Lesson 3: Unlocked
- ✅ Quiz 3: Available
- 🔒 Lesson 4: Locked
- 🔒 Quiz 4: Locked

## Implementation Details

### Backend Changes

1. **New API Endpoint**: `/api/progress/get-with-unlocking`
   - Returns user progress with lesson unlock status
   - Includes information about which lessons/quizzes are available

2. **Progress Controller**: Enhanced to calculate unlock status
   - Maps user progress to lesson availability
   - Determines which lessons and quizzes should be unlocked
   - Only unlocks the next lesson/quiz after completion

### Frontend Changes

1. **Lesson Page** (`lessonpage.js`):
   - Fetches user progress on load
   - Displays lessons and quizzes with appropriate lock states
   - Prevents navigation to locked content
   - Shows clear visual indicators for each state

2. **Quiz Page** (`quiz.js`):
   - Checks if user is allowed to take the quiz
   - Shows access denied message if quiz is locked
   - Redirects to lesson if quiz access is not allowed

3. **CSS Styling**:
   - Added styles for locked, unlocked, completed, and active states
   - Visual indicators for different states
   - Responsive design for all screen sizes

## Database Schema

The system uses the existing `UserProgress` model with the following structure:

```javascript
{
  userEmail: String,
  courseName: String,
  completedModules: [
    {
      m_id: String,        // Module ID (e.g., "ISP01")
      completedAt: Date
    }
  ],
  lastAccessedModule: String
}
```

## API Endpoints

### GET `/api/progress/get-with-unlocking`
**Query Parameters:**
- `userEmail`: User's email address
- `courseName`: Name of the course
- `courseId`: Course ID (optional)

**Response:**
```javascript
{
  success: true,
  progress: UserProgressObject,
  lessonUnlockStatus: [
    {
      lessonId: "ISP01",
      lessonTitle: "Information Security Fundamentals",
      isUnlocked: true,
      isCompleted: false,
      canTakeQuiz: true
    },
    {
      lessonId: "ISP02",
      lessonTitle: "Data Protection Principles",
      isUnlocked: false,
      isCompleted: false,
      canTakeQuiz: false
    }
  ],
  totalLessons: 4,
  completedLessons: 1
}
```

## Usage Examples

### Checking if a lesson is unlocked:
```javascript
const isUnlocked = lessonUnlockStatus.find(
  status => status.lessonId === "ISP02"
)?.isUnlocked || false;
```

### Checking if a quiz is available:
```javascript
const canTakeQuiz = lessonUnlockStatus.find(
  status => status.lessonId === "ISP02"
)?.canTakeQuiz || false;
```

## Error Handling

- If user is not authenticated, default unlock status is used (only first lesson unlocked)
- If progress fetch fails, fallback to default behavior
- Graceful degradation ensures the system continues to work even with API failures

## Testing

To test the sequential unlocking:

1. Start with a new user account
2. Verify only Lesson 1 and Quiz 1 are unlocked
3. Complete Quiz 1
4. Verify only Lesson 2 and Quiz 2 become unlocked (others remain locked)
5. Complete Quiz 2
6. Verify only Lesson 3 and Quiz 3 become unlocked
7. Continue through the course to verify proper progression

## Future Enhancements

- Add admin override to unlock specific lessons
- Implement time-based unlocking
- Add prerequisites system for more complex course structures
- Support for branching paths based on quiz performance 