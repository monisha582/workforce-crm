import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://satisfied-freedom-production-aace.up.railway.app';

let socket = null;

export const initializeSocket = () => {
  if (socket) return socket;

  socket = io(API_URL, {
    auth: {
      token: localStorage.getItem('token'),
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event listeners for real-time updates

export const onTaskCreated = (callback) => {
  const socket = getSocket();
  socket.on('task:created', callback);
};

export const onTaskUpdated = (callback) => {
  const socket = getSocket();
  socket.on('task:updated', callback);
};

export const onLeaveRequested = (callback) => {
  const socket = getSocket();
  socket.on('leave:requested', callback);
};

export const onLeaveApproved = (callback) => {
  const socket = getSocket();
  socket.on('leave:approved', callback);
};

export const onMessageSent = (callback) => {
  const socket = getSocket();
  socket.on('message:sent', callback);
};

export const onAttendanceCheckedIn = (callback) => {
  const socket = getSocket();
  socket.on('attendance:checkedIn', callback);
};

export const onAttendanceCheckedOut = (callback) => {
  const socket = getSocket();
  socket.on('attendance:checkedOut', callback);
};

// Emit events

export const emitTaskCreated = (task) => {
  const socket = getSocket();
  socket.emit('task:create', task);
};

export const emitTaskUpdated = (taskId, updates) => {
  const socket = getSocket();
  socket.emit('task:update', { taskId, ...updates });
};

export const emitMessageSent = (roomId, message) => {
  const socket = getSocket();
  socket.emit('message:send', { roomId, message });
};

export const emitLeaveRequested = (leaveData) => {
  const socket = getSocket();
  socket.emit('leave:request', leaveData);
};

export const joinChatRoom = (roomId) => {
  const socket = getSocket();
  socket.emit('chat:join', { roomId });
};

export const leaveChatRoom = (roomId) => {
  const socket = getSocket();
  socket.emit('chat:leave', { roomId });
};
