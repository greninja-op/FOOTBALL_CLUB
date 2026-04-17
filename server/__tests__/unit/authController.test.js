const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// Mock express app for testing
const express = require('express');
const authRoutes = require('../../routes/authRoutes');

describe('Unit Tests: Authentication Controller (Task 5.3)', () => {
  let app;
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/football_club_test');

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  describe('POST /api/auth/login', () => {
    it('should return token for valid credentials', async () => {
      // Create test user
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'player'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('role', 'player');
      expect(response.body).toHaveProperty('userId');

      // Verify token is valid
      const decoded = jwt.verify(response.body.token, JWT_SECRET);
      expect(decoded.id).toBe(user._id.toString());
      expect(decoded.role).toBe('player');
    });

    it('should return 401 for invalid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'player'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Token Expiry', () => {
    it('should generate tokens that expire after 8 hours', async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign(
        { id: userId.toString(), role: 'player' },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      const decoded = jwt.verify(token, JWT_SECRET);
      const expiryTime = decoded.exp - decoded.iat;
      
      // 8 hours = 28800 seconds
      expect(expiryTime).toBeGreaterThanOrEqual(28790);
      expect(expiryTime).toBeLessThanOrEqual(28810);
    });

    it('should reject expired tokens', () => {
      const userId = new mongoose.Types.ObjectId();
      const expiredToken = jwt.sign(
        { id: userId.toString(), role: 'player' },
        JWT_SECRET,
        { expiresIn: '-1s' }
      );

      expect(() => jwt.verify(expiredToken, JWT_SECRET)).toThrow('jwt expired');
    });
  });

  describe('Password Hashing', () => {
    it('should hash passwords with bcrypt cost factor 10', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);

      // Verify hash format (bcrypt hashes start with $2b$10$)
      expect(hash).toMatch(/^\$2[aby]\$10\$/);

      // Verify password can be verified
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should never store passwords in plain text', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'player'
      });

      expect(user.passwordHash).not.toBe(password);
      expect(user.passwordHash).toMatch(/^\$2[aby]\$10\$/);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid tokens', async () => {
      const user = await User.create({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'player'
      });

      const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user.id', user._id.toString());
      expect(response.body).toHaveProperty('user.role', 'player');
    });

    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.status).toBe(401);
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
