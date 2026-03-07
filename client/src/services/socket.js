import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const joinCase = (caseId) => {
  if (socket) socket.emit('joinCase', caseId);
};

export const leaveCase = (caseId) => {
  if (socket) socket.emit('leaveCase', caseId);
};

export const sendMessage = (data) => {
  if (socket) socket.emit('sendMessage', data);
};

export const onNewMessage = (callback) => {
  if (socket) socket.on('newMessage', callback);
};

export const offNewMessage = (callback) => {
  if (socket) socket.off('newMessage', callback);
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinCase,
  leaveCase,
  sendMessage,
  onNewMessage,
  offNewMessage,
};