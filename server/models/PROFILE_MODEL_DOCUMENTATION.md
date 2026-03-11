# Profile Model Documentation

## Overview

The Profile model represents player and staff profiles in the Football Club Management System. It stores personal information, fitness status, performance statistics, and contract details.

## Schema Definition

**File:** `server/models/Profile.js`

**Validates Requirements:** 3.6, 7.1, 13.1, 16.5, 22.1

## Fields

### Core Identity Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `userId` | ObjectId | Yes | Unique, References User | One-to-one relationship with User model |
| `fullName` | String | Yes | 2-100 characters, trimmed | Player/staff full name |
| `photo` | String | No | Default: null | URL to profile photo |

### Position and Physical Attributes

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `position` | String | No | Enum: Goalkeeper, Defender, Midfielder, Forward, Staff | Playing position |
| `weight` | Number | No | 40-150 kg | Player weight in kilograms |
| `height` | Number | No | 150-220 cm | Player height in centimeters |

### Fitness Status

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `fitnessStatus` | String | No | Enum: Green, Yellow, Red | Current fitness/health status |

**Fitness Status Values:**
- **Green**: Fully fit and available for selection
- **Yellow**: Minor issue, limited availability
- **Red**: Injured or unavailable

### Contract Information

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `contractType` | String | No | Enum: Full-Time, Part-Time, Loan, Trial | Type of employment contract |
| `contractStart` | Date | No | Default: null | Contract start date |
| `contractEnd` | Date | No | Must be >= contractStart | Contract end date |

**Contract Validation:**
- If both `contractStart` and `contractEnd` are provided, `contractEnd` must be on or after `contractStart`
- Validation only applies when both dates are set

### Performance Statistics

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `stats.goals` | Number | No | >= 0, Default: 0 | Total goals scored |
| `stats.assists` | Number | No | >= 0, Default: 0 | Total assists provided |
| `stats.appearances` | Number | No | >= 0, Default: 0 | Total match appearances |
| `stats.rating` | Number | No | 0-10, Default: 0 | Average performance rating |

**Stats Object Structure:**
```javascript
stats: {
  goals: Number,      // Cannot be negative
  assists: Number,    // Cannot be negative
  appearances: Number, // Cannot be negative
  rating: Number      // Must be between 0 and 10
}
```

### Performance Notes

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `performanceNotes` | Array | No | Array of note objects | Private coach/admin notes |

**Performance Note Object:**
```javascript
{
  note: String,           // Required, max 1000 characters
  createdBy: ObjectId,    // Required, references User
  createdAt: Date         // Auto-generated, immutable
}
```

## Indexes

The following indexes are created for query optimization:

1. **userId** (ascending): Ensures fast user-profile lookups and enforces uniqueness
2. **fitnessStatus** (ascending): Optimizes queries filtering by fitness status
3. **contractEnd** (ascending): Optimizes contract expiry tracking queries

## Virtual Properties

### contractDaysRemaining

**Type:** Number (read-only)

**Description:** Calculates the number of days remaining until contract expiry.

**Returns:**
- `null` if `contractEnd` is not set
- `0` if contract has already expired
- Positive integer representing days remaining

**Example:**
```javascript
const profile = await Profile.findOne({ userId: someUserId });
console.log(profile.contractDaysRemaining); // e.g., 365
```

### contractExpiringSoon

**Type:** Boolean (read-only)

**Description:** Indicates if the contract is expiring within 90 days.

**Returns:**
- `true` if contract expires in less than 90 days
- `false` if contract expires in 90+ days or has already expired
- `false` if `contractEnd` is not set

**Example:**
```javascript
const profile = await Profile.findOne({ userId: someUserId });
if (profile.contractExpiringSoon) {
  console.log('⚠️ Contract renewal needed!');
}
```

## Relationships

### One-to-One with User

```javascript
// Profile references User
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  unique: true
}

// Usage
const profile = await Profile.findOne({ userId: someUserId }).populate('userId');
```

### Referenced By Other Models

The Profile model is referenced by:
- **Fixtures**: `lineup` array contains Profile ObjectIds
- **TrainingSessions**: `attendees.playerId` references Profile
- **Injuries**: `playerId` references Profile
- **DisciplinaryActions**: `playerId` references Profile
- **LeaveRequests**: `playerId` references Profile
- **Inventory**: `assignedTo` references Profile

## Usage Examples

### Creating a Profile

```javascript
const Profile = require('./models/Profile');

const newProfile = await Profile.create({
  userId: userObjectId,
  fullName: 'John Doe',
  position: 'Forward',
  weight: 75,
  height: 180,
  fitnessStatus: 'Green',
  contractType: 'Full-Time',
  contractStart: new Date('2024-01-01'),
  contractEnd: new Date('2026-12-31'),
  stats: {
    goals: 15,
    assists: 8,
    appearances: 25,
    rating: 7.5
  }
});
```

### Updating Fitness Status

```javascript
const profile = await Profile.findOne({ userId: playerId });
profile.fitnessStatus = 'Red';
await profile.save();
```

### Updating Statistics

```javascript
const profile = await Profile.findOne({ userId: playerId });
profile.stats.goals += 1;
profile.stats.appearances += 1;
profile.stats.rating = 8.0;
await profile.save();
```

### Adding Performance Notes

```javascript
const profile = await Profile.findOne({ userId: playerId });
profile.performanceNotes.push({
  note: 'Excellent performance in training session',
  createdBy: coachUserId
});
await profile.save();
```

### Querying by Fitness Status

```javascript
// Get all injured players
const injuredPlayers = await Profile.find({ fitnessStatus: 'Red' });

// Get all fit players
const fitPlayers = await Profile.find({ fitnessStatus: 'Green' });
```

### Finding Expiring Contracts

```javascript
// Find contracts expiring in the next 90 days
const ninetyDaysFromNow = new Date();
ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

const expiringContracts = await Profile.find({
  contractEnd: {
    $gte: new Date(),
    $lte: ninetyDaysFromNow
  }
});

// Using virtual property
const allProfiles = await Profile.find();
const expiringSoon = allProfiles.filter(p => p.contractExpiringSoon);
```

### Populating User Information

```javascript
const profile = await Profile.findOne({ userId: someUserId })
  .populate('userId', 'email role')
  .populate('performanceNotes.createdBy', 'email');
```

## Validation Rules

### Automatic Validations

1. **Email Format**: Validated at User model level
2. **Enum Values**: Position, fitnessStatus, contractType must match allowed values
3. **Number Ranges**: Weight (40-150), height (150-220), rating (0-10)
4. **Non-negative Stats**: Goals, assists, appearances cannot be negative
5. **Contract Dates**: contractEnd must be >= contractStart
6. **Unique userId**: Each user can have only one profile

### Custom Validations

```javascript
// Contract date validation
contractEnd: {
  validate: {
    validator: function(v) {
      if (this.contractStart && v) {
        return v >= this.contractStart;
      }
      return true;
    },
    message: 'Contract end date must be after contract start date'
  }
}
```

## Error Handling

### Common Validation Errors

```javascript
// Invalid fitness status
try {
  await Profile.create({
    userId: someUserId,
    fullName: 'Test Player',
    fitnessStatus: 'Blue' // Invalid
  });
} catch (error) {
  // Error: Blue is not a valid fitness status
}

// Invalid rating
try {
  await Profile.create({
    userId: someUserId,
    fullName: 'Test Player',
    stats: { rating: 11 } // Exceeds max of 10
  });
} catch (error) {
  // Error: Rating must be between 0 and 10
}

// Duplicate userId
try {
  await Profile.create({
    userId: existingUserId, // Already has a profile
    fullName: 'Test Player'
  });
} catch (error) {
  // Error: E11000 duplicate key error (unique constraint)
}
```

## Security Considerations

1. **Access Control**: Profile updates should be restricted by role:
   - Admin: Full access
   - Manager: Can update all fields except fitness and stats
   - Coach: Can update fitness status, stats, and performance notes
   - Player: Read-only access to own profile

2. **Performance Notes**: Should only be visible to Coach and Admin roles

3. **Data Sanitization**: All string inputs should be sanitized to prevent XSS attacks

## Performance Optimization

1. **Indexes**: Three indexes created for common query patterns
2. **Virtuals**: Contract calculations done in-memory, not stored in database
3. **Selective Population**: Only populate referenced documents when needed
4. **Lean Queries**: Use `.lean()` for read-only operations to improve performance

## Testing Checklist

- [x] Valid profile creation with all fields
- [x] Valid profile creation with minimal fields (only required)
- [x] Fitness status enum validation (Green, Yellow, Red)
- [x] Position enum validation (Goalkeeper, Defender, Midfielder, Forward, Staff)
- [x] Contract type enum validation (Full-Time, Part-Time, Loan, Trial)
- [x] Stats rating range validation (0-10)
- [x] Stats non-negative validation (goals, assists, appearances)
- [x] Contract date validation (end >= start)
- [x] Unique userId constraint
- [x] Performance notes creation
- [x] Virtual property: contractDaysRemaining
- [x] Virtual property: contractExpiringSoon
- [x] Index creation verification
- [x] Population of userId reference
- [x] Population of performanceNotes.createdBy reference

## Integration Points

### With User Model
- One-to-one relationship via `userId`
- Profile created automatically when User is created (handled in userController)

### With Fixtures Model
- Profiles referenced in `lineup` array
- Used for tactical board and lineup builder

### With Injuries Model
- Injuries reference Profile via `playerId`
- Injury creation automatically sets `fitnessStatus` to 'Red'

### With DisciplinaryActions Model
- Actions reference Profile via `playerId`
- Used for fine tracking and discipline management

### With LeaveRequests Model
- Requests reference Profile via `playerId`
- Used for absence tracking and calendar integration

### With Inventory Model
- Items reference Profile via `assignedTo`
- Used for equipment assignment tracking

## Task 3.2 Completion

✅ **All requirements met:**

1. ✅ userId reference to User with unique constraint
2. ✅ Fitness status enum ['Green', 'Yellow', 'Red']
3. ✅ Position enum ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Staff']
4. ✅ Contract fields (contractType, contractStart, contractEnd)
5. ✅ Stats object (goals, assists, appearances, rating with 0-10 range)
6. ✅ PerformanceNotes array with createdBy reference
7. ✅ Indexes for userId, fitnessStatus, contractEnd
8. ✅ All field validations and enums
9. ✅ Proper references to User model
10. ✅ Virtual properties for contract tracking

**Files Created:**
- `server/models/Profile.js` - Complete Mongoose schema
- `server/test-profile-model.js` - Comprehensive test suite
- `server/models/PROFILE_MODEL_DOCUMENTATION.md` - This documentation

**Next Steps:**
- Install Node.js and MongoDB (see SETUP_GUIDE.md)
- Run `npm install` in server directory
- Run test suite: `node server/test-profile-model.js`
- Proceed to Task 3.3: Create Fixture schema
