import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createChatRoom,
  getChatRooms,
  getMessages,
  sendMessage,
  createChannel,
  getChannels,
  postAnnouncement,
  getAnnouncements,
} from '../controllers/chatController.js';

const router = express.Router();

router.post('/rooms', protect, createChatRoom);
router.get('/rooms', protect, getChatRooms);
router.get('/rooms/:roomId/messages', protect, getMessages);
router.post('/rooms/:roomId/messages', protect, sendMessage);

router.post('/channels', protect, createChannel);
router.get('/channels', protect, getChannels);
router.post('/channels/:channelId/announcements', protect, postAnnouncement);
router.get('/channels/:channelId/announcements', protect, getAnnouncements);

export default router;
