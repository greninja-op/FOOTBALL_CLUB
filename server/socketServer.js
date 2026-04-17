const jwt = require('jsonwebtoken');
const { setUserOnline, setUserOffline } = require('./utils/socketIO');

/**
 * Socket.io Server Configuration with Authentication
 * 
 * This module initializes the Socket.io server with JWT authentication middleware
 * and provides the io instance for controllers to emit real-time events.
 * 
 * Validates Requirements: 18.8, 21.1, 18.1
 * 
 * @module socketServer
 */

/**
 * Initialize Socket.io server with authentication middleware
 * 
 * @param {http.Server} server - HTTP server instance
 * @param {Object} corsOptions - CORS configuration options
 * @returns {SocketIO.Server} Configured Socket.io server instance
 */
function initializeSocketServer(server, corsOptions) {
  const { Server } = require('socket.io');
  
  const io = new Server(server, {
    cors: corsOptions
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    try {
      // Extract JWT token from socket handshake auth
      const token = socket.handshake.auth.token;

      // Check if token exists
      if (!token) {
        return next(new Error('Authentication required: No token provided'));
      }

      // Verify JWT token using secret from environment
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user information to socket instance
      // This makes userId and userRole available throughout the socket lifecycle
      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      // Log successful authentication
      console.log(`Socket authenticated: User ${decoded.id} (${decoded.role})`);

      // Proceed with connection
      next();
    } catch (error) {
      // Handle JWT-specific errors
      if (error.name === 'JsonWebTokenError') {
        return next(new Error('Authentication failed: Invalid token'));
      }

      if (error.name === 'TokenExpiredError') {
        return next(new Error('Authentication failed: Token has expired'));
      }

      // Handle other errors
      return next(new Error('Authentication failed: Token verification failed'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);
    setUserOnline(socket.userId, socket.id);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      setUserOffline(socket.userId, socket.id);
      console.log(`Client disconnected: ${socket.id} (Reason: ${reason})`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error.message);
    });
  });

  return io;
}

module.exports = { initializeSocketServer };
