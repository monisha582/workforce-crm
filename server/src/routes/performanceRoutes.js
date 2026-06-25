import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getPerformanceMetrics,
  getLeaderboard,
  getUserRank,
  recalculatePerformance,
} from '../controllers/performanceController.js';

const router = express.Router();

router.get('/metrics', protect, getPerformanceMetrics);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/rank/:userId', protect, getUserRank);
router.post('/recalculate', protect, authorize('SUPER_ADMIN'), recalculatePerformance);

export default router;
