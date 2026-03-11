# TrainingSession Model Documentation

## Overview
The TrainingSession model represents scheduled training sessions with date, drill descriptions, duration, attendance tracking, and creator tracking for the Football Club Management System.

## Schema Definition

### Fields

#### date (Date, Required)
- **Type**: Date
- **Required**: Yes
- **Validation**: Must not be in the past (today or future dates only)
- **Error Message**: "Training date cannot be in the past"
- **Purpose**: Stores the scheduled date and time of the training session

#### drillDescription (String, Required)
- **Type**: String
- **Required**: Yes
- **Trim**: Yes (removes leading/trailing whitespace)
- **Min Length**: 10 characters
- **Max Length**: 500 characters
- **Error Messages**: 
  - "Drill description must be at least 10 characters"
  - "Drill description cannot exceed 500 characters"
- **Purpose**: Describes the training drills and exercises planned for the session

#### duration (Number, Required)
- **Type**: Number
- **Required**: Yes
- **Min Value**: 30 (minutes)
- **Max Value**: 300 (minutes)
- **Error Messages**:
  - "Duration must be at least 30 minutes"
  - "Duration cannot exceed 300 minutes"
- **Purpose**: Stores the planned duration of the training session in minutes

#### attendees (Array of Objects)
- **Type**: Array of embedded documents
- **Structure**:
  - **playerId** (ObjectId, Required)
    - Reference to Profile model
    - Required for each attendee
    - Error Message: "Player ID is required for attendee"
  - **status** (String, Enum)
    - Values: 'Present', 'Absent', 'Excused'
    - Default: 'Absent'
    - Error Message: "{VALUE} is not a valid attendance status. Must be one of: Present, Absent, Excused"
- **Purpose**: Tracks which players attended the training session and their attendance status

#### createdBy (ObjectId, Required)
- **Type**: ObjectId
- **Required**: Yes
- **Reference**: User model
- **Error Message**: "Creator user ID is required"
- **Purpose**: Tracks which user (typically a Coach) created the training session

#### createdAt (Date, Auto-generated)
- **Type**: Date
- **Default**: Current timestamp (Date.now)
- **Immutable**: Yes (cannot be changed after creation)
- **Purpose**: Records when the training session was created in the system

## Indexes

The model includes two indexes for performance optimization:

1. **date (ascending)**: Optimizes date-based queries and sorting
2. **createdBy (ascending)**: Optimizes queries filtering by creator

## Relationships

### References
- **createdBy**: Many-to-One relationship with User model
- **attendees.playerId**: Many-to-Many relationship with Profile model

### Referenced By
- None (TrainingSession is not referenced by other models)

## Validation Rules

### Business Rules
1. Training sessions cannot be scheduled in the past
2. Duration must be between 30 and 300 minutes (0.5 to 5 hours)
3. Drill descriptions must be descriptive (minimum 10 characters)
4. Attendance status must be one of three valid values: Present, Absent, or Excused
5. Default attendance status is 'Absent' if not specified

### Data Integrity
- All required fields must be provided
- ObjectId references must be valid MongoDB ObjectIds
- Enum values are strictly enforced
- Numeric ranges are validated

## Requirements Validation

This model validates the following requirements from the specification:

- **Requirement 11.1**: Stores date, time, drills, and duration for training sessions
- **Requirement 11.2**: Supports attendance marking for each player (Present, Absent, Excused)
- **Requirement 11.5**: Validates that training date is not in the past
- **Requirement 22.1**: Enforces schema validation using Mongoose

## Usage Examples

### Creating a Training Session
```javascript
const TrainingSession = require('./models/TrainingSession');

const session = new TrainingSession({
  date: new Date('2024-12-20T10:00:00'),
  drillDescription: 'Passing drills, tactical positioning, and set piece practice',
  duration: 90,
  attendees: [
    { playerId: player1Id, status: 'Present' },
    { playerId: player2Id, status: 'Absent' },
    { playerId: player3Id, status: 'Excused' }
  ],
  createdBy: coachUserId
});

await session.save();
```

### Updating Attendance
```javascript
const session = await TrainingSession.findById(sessionId);
const attendee = session.attendees.find(a => a.playerId.equals(playerId));
if (attendee) {
  attendee.status = 'Present';
  await session.save();
}
```

### Querying Training Sessions
```javascript
// Get all future training sessions
const upcomingSessions = await TrainingSession.find({
  date: { $gte: new Date() }
}).sort({ date: 1 });

// Get sessions created by a specific coach
const coachSessions = await TrainingSession.find({
  createdBy: coachId
}).populate('createdBy', 'email role');

// Get sessions with attendance populated
const sessionsWithPlayers = await TrainingSession.find()
  .populate('attendees.playerId', 'fullName position')
  .populate('createdBy', 'email');
```

## Testing

The model has been tested for:
- ✅ Valid training session creation
- ✅ Past date rejection
- ✅ Duration range validation (minimum 30 minutes)
- ✅ Duration range validation (maximum 300 minutes)
- ✅ Drill description length validation (minimum 10 characters)
- ✅ Drill description length validation (maximum 500 characters)
- ✅ Attendee status enum validation
- ✅ Required fields validation
- ✅ All valid attendee statuses (Present, Absent, Excused)
- ✅ Default attendee status (Absent)
- ✅ Index definitions (date, createdBy)

## Task Completion

This model completes **Task 3.4** from the implementation plan:

**Task 3.4: Create TrainingSession schema (date, drillDescription, duration, attendees, createdBy)**
- ✅ Add date validation to prevent past dates
- ✅ Add duration range validation (30-300 minutes)
- ✅ Add attendees array with playerId and status enum ['Present', 'Absent', 'Excused']
- ✅ Add createdBy reference to User
- ✅ Add indexes for date and createdBy

**Requirements Validated**: 11.1, 11.2, 11.5, 22.1

## Notes

- The model follows the same structure and conventions as other models in the system (User, Profile, Fixture)
- Validation messages are descriptive and user-friendly
- The model uses Mongoose's built-in validation features for data integrity
- Indexes are strategically placed on frequently queried fields
- The createdAt field is immutable to maintain audit trail integrity
- Default attendance status is 'Absent' to ensure explicit marking of present players
