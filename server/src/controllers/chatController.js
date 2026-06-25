import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

// Create Chat Room
export const createChatRoom = async (req, res) => {
  try {
    const { name, type, members, channelId } = req.body;
    const createdById = req.user.id;

    if (!name || !type) {
      throw new AppError('Name and type are required', 400);
    }

    const chatRoom = await prisma.chatRoom.create({
      data: {
        name,
        type,
        createdById,
        members: members || [createdById],
        channelId: channelId || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Chat room created',
      data: chatRoom,
    });
  } catch (error) {
    throw error;
  }
};

// Get Chat Rooms
export const getChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        members: { has: userId },
      },
      include: {
        createdBy: true,
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    res.status(200).json({
      success: true,
      data: chatRooms,
    });
  } catch (error) {
    throw error;
  }
};

// Get Messages in Room
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatRoomId: roomId },
        include: { sender: true, readBy: true },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.message.count({ where: { chatRoomId: roomId } }),
    ]);

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, attachmentUrl } = req.body;
    const senderId = req.user.id;

    if (!content && !attachmentUrl) {
      throw new AppError('Message content is required', 400);
    }

    const message = await prisma.message.create({
      data: {
        chatRoomId: roomId,
        senderId,
        content: content || '',
        attachmentUrl,
      },
      include: { sender: true },
    });

    // Emit via Socket.IO
    const io = req.app.get('io');
    io.to(`room-${roomId}`).emit('new-message', message);

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: message,
    });
  } catch (error) {
    throw error;
  }
};

// Create Channel
export const createChannel = async (req, res) => {
  try {
    const { name, description, departmentId, isPrivate } = req.body;

    const channel = await prisma.channel.create({
      data: {
        name,
        description,
        departmentId,
        isPrivate: isPrivate || false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Channel created',
      data: channel,
    });
  } catch (error) {
    throw error;
  }
};

// Get Channels
export const getChannels = async (req, res) => {
  try {
    const channels = await prisma.channel.findMany({
      include: { department: true },
    });

    res.status(200).json({
      success: true,
      data: channels,
    });
  } catch (error) {
    throw error;
  }
};

// Post Announcement
export const postAnnouncement = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { title, content, priority, expiresAt } = req.body;

    if (!content) {
      throw new AppError('Message content is required', 400);
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title || content.substring(0, 60) || 'Announcement',
        content,
        channelId,
        priority: priority || 'MEDIUM',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Announcement posted',
      data: announcement,
    });
  } catch (error) {
    throw error;
  }
};

// Get Announcements
export const getAnnouncements = async (req, res) => {
  try {
    const { channelId } = req.params;

    const announcements = await prisma.announcement.findMany({
      where: { channelId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    throw error;
  }
};
