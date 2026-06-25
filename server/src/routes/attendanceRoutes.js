import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validationMiddleware, checkInOutSchema, leaveRequestSchema } from '../utils/validators.js';
import {
  checkIn,
  checkOut,
  getAttendanceHistory,
  requestLeave,
  getLeaves,
  updateLeaveStatus,
} from '../controllers/attendanceController.js';

const router = express.Router();

/**
 * @swagger
 * /api/attendance/checkin:
 *   post:
 *     summary: Check in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/checkin', protect, validationMiddleware(checkInOutSchema), checkIn);

/**
 * @swagger
 * /api/attendance/checkout:
 *   post:
 *     summary: Check out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/checkout', protect, validationMiddleware(checkInOutSchema), checkOut);

/**
 * @swagger
 * /api/attendance/history:
 *   get:
 *     summary: Get attendance history
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history', protect, getAttendanceHistory);

/**
 * @swagger
 * /api/attendance/leave:
 *   post:
 *     summary: Request leave
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/leaves', protect, validationMiddleware(leaveRequestSchema), requestLeave);

/**
 * @swagger
 * /api/attendance/leaves:
 *   get:
 *     summary: Get leaves
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/leaves', protect, getLeaves);

/**
 * @swagger
 * /api/attendance/leaves/{id}:
 *   patch:
 *     summary: Update leave status
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/leaves/:id', protect, authorize('HR', 'SUPER_ADMIN'), updateLeaveStatus);

export default router;
