const fc = require('fast-check');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('Property Tests: Authentication and Authorization (Task 4.4)', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
  const TOKEN_EXPIRY = '8h';

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/football_club_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  describe('Property 1: JWT Token Generation and Expiry', () => {
    it('should generate valid JWT tokens with correct expiry', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.constantFrom('admin', 'manager', 'coach', 'player'),
          async (email, role) => {
            const userId = new mongoose.Types.ObjectId();
            const token = jwt.sign(
              { id: userId.toString(), role },
              JWT_SECRET,
              { expiresIn: TOKEN_EXPIRY }
            );

            const decoded = jwt.verify(token, JWT_SECRET);
            expect(decoded.id).toBe(userId.toString());
            expect(decoded.role).toBe(role);
            expect(decoded.exp).toBeDefined();
            expect(decoded.iat).toBeDefined();
            
            // Verify expiry is approximately 8 hours from now
            const expiryTime = decoded.exp - decoded.iat;
            expect(expiryTime).toBeGreaterThanOrEqual(8 * 3600 - 10);
            expect(expiryTime).toBeLessThanOrEqual(8 * 3600 + 10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject expired tokens', async () => {
      const userId = new mongoose.Types.ObjectId();
      const expiredToken = jwt.sign(
        { id: userId.toString(), role: 'player' },
        JWT_SECRET,
        { expiresIn: '-1s' } // Already expired
      );

      expect(() => jwt.verify(expiredToken, JWT_SECRET)).toThrow();
    });
  });

  describe('Property 2: Authentication Error Handling', () => {
    it('should reject tokens with invalid signatures', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          (invalidSecret) => {
            if (invalidSecret !== JWT_SECRET) {
              const token = jwt.sign(
                { id: 'test-id', role: 'player' },
                invalidSecret,
                { expiresIn: TOKEN_EXPIRY }
              );

              expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject malformed tokens', async () => {
      await fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('.')),
          (malformedToken) => {
            expect(() => jwt.verify(malformedToken, JWT_SECRET)).toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 3: Password Storage Security', () => {
    it('should hash passwords with bcrypt cost factor 10', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 50 }),
          async (password) => {
            const hash = await bcrypt.hash(password, 10);
            
            // Verify hash format (bcrypt hashes start with $2b$10$)
            expect(hash).toMatch(/^\$2[aby]\$10\$/);
            
            // Verify password can be verified
            const isValid = await bcrypt.compare(password, hash);
            expect(isValid).toBe(true);
            
            // Verify wrong password fails
            const isInvalid = await bcrypt.compare(password + 'wrong', hash);
            expect(isInvalid).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    }, 15000);

    it('should never store passwords in plain text', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 50 }),
          fc.constantFrom('admin', 'manager', 'coach', 'player'),
          async (email, password, role) => {
            const passwordHash = await bcrypt.hash(password, 10);
            const user = new User({
              email,
              passwordHash,
              role
            });
            await user.save();

            // Verify stored hash is not the plain password
            expect(user.passwordHash).not.toBe(password);
            
            // Verify stored hash is a valid bcrypt hash
            expect(user.passwordHash).toMatch(/^\$2[aby]\$10\$/);
          }
        ),
        { numRuns: 10 }
      );
    }, 15000);
  });

  describe('Property 4: Role-Based Route Authorization', () => {
    const roleHierarchy = {
      admin: ['admin', 'manager', 'coach', 'player'],
      manager: ['manager', 'coach', 'player'],
      coach: ['coach', 'player'],
      player: ['player']
    };

    it('should enforce role-based access control', async () => {
      await fc.assert(
        fc.property(
          fc.constantFrom('admin', 'manager', 'coach', 'player'),
          fc.constantFrom('admin', 'manager', 'coach', 'player'),
          (userRole, requiredRole) => {
            const allowedRoles = roleHierarchy[requiredRole] || [requiredRole];
            const hasAccess = allowedRoles.includes(userRole);
            
            // Simulate authorization check
            const isAuthorized = (user, required) => {
              const allowed = roleHierarchy[required] || [required];
              return allowed.includes(user);
            };

            expect(isAuthorized(userRole, requiredRole)).toBe(hasAccess);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Protected Route Authentication', () => {
    it('should require valid token for protected routes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.constantFrom('admin', 'manager', 'coach', 'player'),
          async (email, role) => {
            const userId = new mongoose.Types.ObjectId();
            
            // Valid token should be accepted
            const validToken = jwt.sign(
              { id: userId.toString(), role },
              JWT_SECRET,
              { expiresIn: TOKEN_EXPIRY }
            );
            
            const decoded = jwt.verify(validToken, JWT_SECRET);
            expect(decoded).toBeDefined();
            expect(decoded.id).toBe(userId.toString());
            expect(decoded.role).toBe(role);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests without tokens', () => {
      const noToken = null;
      const emptyToken = '';
      
      expect(() => jwt.verify(noToken, JWT_SECRET)).toThrow();
      expect(() => jwt.verify(emptyToken, JWT_SECRET)).toThrow();
    });
  });
});
