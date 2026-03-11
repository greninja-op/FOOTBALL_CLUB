const fc = require('fast-check');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Settings = require('../../models/Settings');
const Fixture = require('../../models/Fixture');
const LeaveRequest = require('../../models/LeaveRequest');

describe('Property Tests: Schema Validation (Task 3.11)', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/football_club_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clean up collections after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  describe('Property 7: Role Enumeration Validation', () => {
    it('should only accept valid roles (admin, manager, coach, player)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('admin', 'manager', 'coach', 'player'),
          fc.emailAddress(),
          async (role, email) => {
            const user = new User({
              email,
              passwordHash: 'hashedpassword123',
              role
            });
            await user.validate();
            expect(['admin', 'manager', 'coach', 'player']).toContain(user.role);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid roles', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string().filter(s => !['admin', 'manager', 'coach', 'player'].includes(s)),
          fc.emailAddress(),
          async (invalidRole, email) => {
            const user = new User({
              email,
              passwordHash: 'hashedpassword123',
              role: invalidRole
            });
            await expect(user.validate()).rejects.toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 13: Club Name Length Validation', () => {
    it('should accept club names between 3-100 characters', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 100 }),
          async (clubName) => {
            const settings = new Settings({ clubName });
            await settings.validate();
            expect(settings.clubName.length).toBeGreaterThanOrEqual(3);
            expect(settings.clubName.length).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject club names shorter than 3 characters', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ maxLength: 2 }),
          async (shortName) => {
            if (shortName.length < 3) {
              const settings = new Settings({ clubName: shortName });
              await expect(settings.validate()).rejects.toThrow();
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject club names longer than 100 characters', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 101, maxLength: 200 }),
          async (longName) => {
            const settings = new Settings({ clubName: longName });
            await expect(settings.validate()).rejects.toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 14: Date Range Validation', () => {
    it('should accept leave requests where endDate >= startDate', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          fc.integer({ min: 0, max: 365 }),
          fc.string({ minLength: 10, maxLength: 200 }),
          async (startDate, daysToAdd, reason) => {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + daysToAdd);
            
            const leaveRequest = new LeaveRequest({
              playerId: new mongoose.Types.ObjectId(),
              startDate,
              endDate,
              reason,
              status: 'Pending'
            });
            
            await leaveRequest.validate();
            expect(leaveRequest.endDate.getTime()).toBeGreaterThanOrEqual(leaveRequest.startDate.getTime());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 22: Fitness Status Enumeration', () => {
    it('should only accept valid fitness statuses (Green, Yellow, Red)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('Green', 'Yellow', 'Red'),
          fc.string({ minLength: 3, maxLength: 50 }),
          async (fitnessStatus, fullName) => {
            const profile = new Profile({
              userId: new mongoose.Types.ObjectId(),
              fullName,
              position: 'Forward',
              fitnessStatus
            });
            await profile.validate();
            expect(['Green', 'Yellow', 'Red']).toContain(profile.fitnessStatus);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 24: Player Rating Range Validation', () => {
    it('should accept ratings between 0-10', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: 0, max: 10 }),
          fc.string({ minLength: 3, maxLength: 50 }),
          async (rating, fullName) => {
            const profile = new Profile({
              userId: new mongoose.Types.ObjectId(),
              fullName,
              position: 'Forward',
              stats: {
                goals: 0,
                assists: 0,
                appearances: 0,
                rating
              }
            });
            await profile.validate();
            expect(profile.stats.rating).toBeGreaterThanOrEqual(0);
            expect(profile.stats.rating).toBeLessThanOrEqual(10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject ratings outside 0-10 range', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.float({ min: -100, max: -0.1 }),
            fc.float({ min: 10.1, max: 100 })
          ),
          fc.string({ minLength: 3, maxLength: 50 }),
          async (invalidRating, fullName) => {
            const profile = new Profile({
              userId: new mongoose.Types.ObjectId(),
              fullName,
              position: 'Forward',
              stats: {
                goals: 0,
                assists: 0,
                appearances: 0,
                rating: invalidRating
              }
            });
            await expect(profile.validate()).rejects.toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 28: Numeric Range Validation', () => {
    it('should accept fine amounts between 0-100000', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100000 }),
          async (fineAmount) => {
            const DisciplinaryAction = require('../../models/DisciplinaryAction');
            const action = new DisciplinaryAction({
              playerId: new mongoose.Types.ObjectId(),
              offense: 'Test offense',
              fineAmount,
              issuedBy: new mongoose.Types.ObjectId()
            });
            await action.validate();
            expect(action.fineAmount).toBeGreaterThanOrEqual(0);
            expect(action.fineAmount).toBeLessThanOrEqual(100000);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 32: Schema Validation Enforcement', () => {
    it('should enforce required fields', async () => {
      const user = new User({});
      await expect(user.validate()).rejects.toThrow();
    });

    it('should enforce email uniqueness', async () => {
      const email = 'test@example.com';
      const user1 = new User({
        email,
        passwordHash: 'hash1',
        role: 'player'
      });
      await user1.save();

      const user2 = new User({
        email,
        passwordHash: 'hash2',
        role: 'coach'
      });
      await expect(user2.save()).rejects.toThrow();
    });
  });
});
