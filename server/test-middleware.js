/**
 * Middleware Test Script
 * Tests authMiddleware, roleGuard, and loggerMiddleware functionality
 * 
 * Run with: node test-middleware.js
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');
const requireRole = require('./middleware/roleGuard');

console.log('=== Middleware Test Suite ===\n');

// Test 1: JWT Token Generation
console.log('Test 1: JWT Token Generation');
const testUser = {
  id: '507f1f77bcf86cd799439011',
  role: 'admin'
};

const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '8h' });
console.log('✓ Token generated successfully');
console.log(`Token: ${token.substring(0, 50)}...\n`);

// Test 2: Token Verification
console.log('Test 2: Token Verification');
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✓ Token verified successfully');
  console.log(`Decoded payload:`, { id: decoded.id, role: decoded.role });
  console.log(`Token expires in: ${Math.floor((decoded.exp - decoded.iat) / 3600)} hours\n`);
} catch (error) {
  console.log('✗ Token verification failed:', error.message);
}

// Test 3: authMiddleware with valid token
console.log('Test 3: authMiddleware with valid token');
const mockReq1 = {
  headers: {
    authorization: `Bearer ${token}`
  }
};
const mockRes1 = {
  status: (code) => ({
    json: (data) => {
      console.log(`✗ Unexpected response: ${code}`, data);
    }
  })
};
const mockNext1 = () => {
  console.log('✓ authMiddleware passed - req.user attached');
  console.log(`req.user:`, mockReq1.user);
  console.log();
};

authMiddleware(mockReq1, mockRes1, mockNext1);

// Test 4: authMiddleware without token
console.log('Test 4: authMiddleware without token');
const mockReq2 = {
  headers: {}
};
const mockRes2 = {
  status: (code) => ({
    json: (data) => {
      if (code === 401) {
        console.log('✓ authMiddleware correctly rejected request');
        console.log(`Status: ${code}, Message: ${data.message}\n`);
      }
      return mockRes2;
    }
  })
};
const mockNext2 = () => {
  console.log('✗ authMiddleware should have rejected this request\n');
};

authMiddleware(mockReq2, mockRes2, mockNext2);

// Test 5: authMiddleware with invalid token
console.log('Test 5: authMiddleware with invalid token');
const mockReq3 = {
  headers: {
    authorization: 'Bearer invalid.token.here'
  }
};
const mockRes3 = {
  status: (code) => ({
    json: (data) => {
      if (code === 401) {
        console.log('✓ authMiddleware correctly rejected invalid token');
        console.log(`Status: ${code}, Message: ${data.message}\n`);
      }
      return mockRes3;
    }
  })
};
const mockNext3 = () => {
  console.log('✗ authMiddleware should have rejected invalid token\n');
};

authMiddleware(mockReq3, mockRes3, mockNext3);

// Test 6: roleGuard with authorized role
console.log('Test 6: roleGuard with authorized role (admin accessing admin route)');
const adminGuard = requireRole(['admin']);
const mockReq4 = {
  user: {
    id: '507f1f77bcf86cd799439011',
    role: 'admin'
  }
};
const mockRes4 = {
  status: (code) => ({
    json: (data) => {
      console.log(`✗ Unexpected response: ${code}`, data);
    }
  })
};
const mockNext4 = () => {
  console.log('✓ roleGuard passed - admin authorized\n');
};

adminGuard(mockReq4, mockRes4, mockNext4);

// Test 7: roleGuard with unauthorized role
console.log('Test 7: roleGuard with unauthorized role (player accessing admin route)');
const mockReq5 = {
  user: {
    id: '507f1f77bcf86cd799439012',
    role: 'player'
  }
};
const mockRes5 = {
  status: (code) => ({
    json: (data) => {
      if (code === 403) {
        console.log('✓ roleGuard correctly denied access');
        console.log(`Status: ${code}, Message: ${data.message}\n`);
      }
      return mockRes5;
    }
  })
};
const mockNext5 = () => {
  console.log('✗ roleGuard should have denied access\n');
};

adminGuard(mockReq5, mockRes5, mockNext5);

// Test 8: roleGuard with multiple allowed roles
console.log('Test 8: roleGuard with multiple allowed roles (coach accessing coach/admin route)');
const coachAdminGuard = requireRole(['coach', 'admin']);
const mockReq6 = {
  user: {
    id: '507f1f77bcf86cd799439013',
    role: 'coach'
  }
};
const mockRes6 = {
  status: (code) => ({
    json: (data) => {
      console.log(`✗ Unexpected response: ${code}`, data);
    }
  })
};
const mockNext6 = () => {
  console.log('✓ roleGuard passed - coach authorized for coach/admin route\n');
};

coachAdminGuard(mockReq6, mockRes6, mockNext6);

// Test 9: Token expiry validation
console.log('Test 9: Token expiry validation');
const expiredToken = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '0s' });
setTimeout(() => {
  const mockReq7 = {
    headers: {
      authorization: `Bearer ${expiredToken}`
    }
  };
  const mockRes7 = {
    status: (code) => ({
      json: (data) => {
        if (code === 401 && data.message.includes('expired')) {
          console.log('✓ authMiddleware correctly detected expired token');
          console.log(`Status: ${code}, Message: ${data.message}\n`);
        }
        return mockRes7;
      }
    })
  };
  const mockNext7 = () => {
    console.log('✗ authMiddleware should have rejected expired token\n');
  };

  authMiddleware(mockReq7, mockRes7, mockNext7);

  console.log('=== All Tests Complete ===');
}, 100);
