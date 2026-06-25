import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        performance: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Remove password
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    throw error;
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const { role, departmentId, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (departmentId) where.departmentId = departmentId;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          departmentId: true,
          isActive: true,
          createdAt: true,
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    throw error;
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, profileImage, departmentId } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        profileImage: profileImage || undefined,
        departmentId: departmentId || undefined,
      },
    });

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: userWithoutPassword,
    });
  } catch (error) {
    throw error;
  }
};

// Assign Role (Admin only)
export const assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['SUPER_ADMIN', 'HR', 'TEAM_LEAD', 'EMPLOYEE', 'INTERN'];
    if (!validRoles.includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.status(200).json({
      success: true,
      message: 'Role assigned',
      data: { id: user.id, role: user.role },
    });
  } catch (error) {
    throw error;
  }
};

// Deactivate User (Admin only)
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated',
    });
  } catch (error) {
    throw error;
  }
};

// Get Activity Logs
export const getActivityLogs = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = userId ? { userId } : {};

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    throw error;
  }
};
