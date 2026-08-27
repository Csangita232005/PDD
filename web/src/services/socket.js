import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.io connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  if (s && userId) {
    s.emit('join_user', userId);
  }
};

export const joinRoleRoom = (role) => {
  const s = getSocket();
  if (s && role) {
    s.emit('join_role', role);
  }
};

const socketService = {
  initSocket,
  getSocket,
  joinUserRoom,
  joinRoleRoom,
  on: (...args) => getSocket().on(...args),
  off: (...args) => getSocket().off(...args),
  emit: (...args) => getSocket().emit(...args),
};

export default socketService;
