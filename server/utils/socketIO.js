/**
 * Socket.IO Instance Manager
 * 
 * This module provides a centralized way to access the Socket.io instance
 * from any controller or module in the application.
 * 
 * Validates Requirements: 18.1
 * 
 * Usage in controllers:
 * const { getIO } = require('../utils/socketIO');
 * const io = getIO();
 * io.emit('event:name', data);
 * 
 * @module utils/socketIO
 */

let io = null;

/**
 * Set the Socket.io instance
 * This should be called once during server initialization
 * 
 * @param {SocketIO.Server} ioInstance - The Socket.io server instance
 */
function setIO(ioInstance) {
  io = ioInstance;
  console.log('✓ Socket.io instance registered for controller access');
}

/**
 * Get the Socket.io instance
 * This can be called from any controller to emit events
 * 
 * @returns {SocketIO.Server} The Socket.io server instance
 * @throws {Error} If Socket.io has not been initialized
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call setIO() first.');
  }
  return io;
}

module.exports = { setIO, getIO };
