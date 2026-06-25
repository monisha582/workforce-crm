import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  assignRole,
  deactivateUser,
  getActivityLogs,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserProfile);
router.patch('/:id', protect, updateUserProfile);
router.patch('/:id/role', protect, authorize('SUPER_ADMIN'), assignRole);
router.patch('/:id/deactivate', protect, authorize('SUPER_ADMIN'), deactivateUser);
router.get('/:userId/activity-logs', protect, getActivityLogs);

export default router;
