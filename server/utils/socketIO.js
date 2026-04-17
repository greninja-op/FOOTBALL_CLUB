/**
 * Socket.IO Instance Manager
 */

let io = null;
const activeUsers = new Map();

function setIO(ioInstance) {
  io = ioInstance;
  console.log('Socket.io instance registered for controller access');
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call setIO() first.');
  }

  return io;
}

function setUserOnline(userId, socketId) {
  const key = String(userId);
  const sockets = activeUsers.get(key) || new Set();
  sockets.add(socketId);
  activeUsers.set(key, sockets);
}

function setUserOffline(userId, socketId) {
  const key = String(userId);
  const sockets = activeUsers.get(key);

  if (!sockets) {
    return;
  }

  sockets.delete(socketId);

  if (sockets.size === 0) {
    activeUsers.delete(key);
    return;
  }

  activeUsers.set(key, sockets);
}

function getOnlineUserIds() {
  return Array.from(activeUsers.keys());
}

module.exports = {
  setIO,
  getIO,
  setUserOnline,
  setUserOffline,
  getOnlineUserIds,
};
