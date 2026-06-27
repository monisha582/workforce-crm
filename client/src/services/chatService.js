import api from './api';

// Create chat room (for direct messaging)
export const createChatRoom = async (chatRoomData) => {
  const response = await api.post('/chat/rooms', chatRoomData);
  return response.data;
};

// Get chat rooms
export const getChatRooms = async (filters = {}) => {
  const response = await api.get('/chat/rooms', { params: filters });
  return response.data;
};

// Get messages in a chat room
export const getMessages = async (roomId, limit = 50) => {
  const response = await api.get(`/chat/rooms/${roomId}/messages`, {
    params: { limit },
  });
  return response.data;
};

// Send message
export const sendMessage = async (roomId, messageData) => {
  const response = await api.post(`/chat/rooms/${roomId}/messages`, messageData);
  return response.data;
};

// Create channel
export const createChannel = async (channelData) => {
  const response = await api.post('/chat/channels', channelData);
  return response.data;
};

// Get channels
export const getChannels = async (filters = {}) => {
  const response = await api.get('/chat/channels', { params: filters });
  return response.data;
};

// Post announcement
export const postAnnouncement = async (channelId, announcementData) => {
  const response = await api.post(`/chat/channels/${channelId}/announcements`, announcementData);
  return response.data;
};

// Get announcements
export const getAnnouncements = async (channelId) => {
  const response = await api.get(`/chat/channels/${channelId}/announcements`);
  return response.data;
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  const response = await api.post(`/chat/messages/${messageId}/read`);
  return response.data;
};
