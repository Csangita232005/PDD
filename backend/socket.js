const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined room user:${userId}`);
      }
    });

    // Join role-specific room (e.g. role:NGO, room:ngos, role:VOLUNTEER, room:volunteers, role:ADMIN, room:admins)
    socket.on('join_role', (role) => {
      if (role) {
        const roleClean = role.toString().toLowerCase().replace('room:', '').replace('role:', '');
        const roomNameRole = `role:${roleClean.toUpperCase()}`;
        const roomNamePlural = `room:${roleClean}s`;
        socket.join(roomNameRole);
        socket.join(roomNamePlural);
        console.log(`Socket ${socket.id} joined rooms ${roomNameRole} and ${roomNamePlural}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    console.warn('Socket.io not initialized yet!');
  }
  return io;
};

const notifyUser = (userId, eventName, payload) => {
  if (io) {
    io.to(`user:${userId}`).emit(eventName, payload);
  }
};

const notifyRole = (role, eventName, payload) => {
  if (io) {
    io.to(`role:${role.toUpperCase()}`).emit(eventName, payload);
  }
};

const broadcastEvent = (eventName, payload) => {
  if (io) {
    io.emit(eventName, payload);
  }
};

module.exports = {
  initSocket,
  getIo,
  notifyUser,
  notifyRole,
  broadcastEvent,
};
