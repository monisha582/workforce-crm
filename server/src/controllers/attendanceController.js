import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

// Check In
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      throw new AppError('Already checked in today', 400);
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      update: {
        checkInTime: new Date(),
        status: 'PRESENT',
      },
      create: {
        userId,
        date: today,
        checkInTime: new Date(),
        status: 'PRESENT',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Check in successful',
      data: attendance,
    });
  } catch (error) {
    throw error;
  }
};

// Check Out
export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: { userId, date: today },
      },
    });

    if (!attendance) {
      throw new AppError('No check-in record found', 404);
    }

    if (attendance.checkOutTime) {
      throw new AppError('Already checked out today', 400);
    }

    const checkOutTime = new Date();
    const checkInTime = attendance.checkInTime;
    const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    const updated = await prisma.attendance.update({
      where: {
        userId_date: { userId, date: today },
      },
      data: {
        checkOutTime,
        workingHours: Math.round(workingHours * 100) / 100,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Check out successful',
      data: updated,
    });
  } catch (error) {
    throw error;
  }
};

// Get Attendance History
export const getAttendanceHistory = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    const targetUserId = userId || req.user.id;

    const startDate = new Date(year || new Date().getFullYear(), month ? month - 1 : 0, 1);
    const endDate = new Date(year || new Date().getFullYear(), month ? month : 11, 32);

    const records = await prisma.attendance.findMany({
      where: {
        userId: targetUserId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === 'PRESENT').length,
      absent: records.filter((r) => r.status === 'ABSENT').length,
      leave: records.filter((r) => r.status === 'LEAVE').length,
      workFromHome: records.filter((r) => r.status === 'WORK_FROM_HOME').length,
    };

    res.status(200).json({
      success: true,
      data: { records, summary },
    });
  } catch (error) {
    throw error;
  }
};

// Request Leave
export const requestLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.user.id;

    if (!type || !startDate || !endDate || !reason) {
      throw new AppError('Missing required fields', 400);
    }

    const leave = await prisma.leave.create({
      data: {
        userId,
        leaveType: type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted',
      data: leave,
    });
  } catch (error) {
    throw error;
  }
};

// Get Leaves
export const getLeaves = async (req, res) => {
  try {
    const { userId, status } = req.query;
    const targetUserId = userId || req.user.id;

    const where = { userId: targetUserId };
    if (status) where.status = status;

    const leaves = await prisma.leave.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    throw error;
  }
};

// Approve/Reject Leave (HR only)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: {
        status,
        rejectReason: status === 'REJECTED' ? rejectReason : null,
        approvalDate: new Date(),
        approvedBy: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      message: `Leave ${status.toLowerCase()}`,
      data: leave,
    });
  } catch (error) {
    throw error;
  }
};
