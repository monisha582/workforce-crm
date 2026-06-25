import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDashboardOverview,
  getStatistics,
  getLeaderboardData,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', protect, getDashboardOverview);
router.get('/statistics', protect, getStatistics);
router.get('/leaderboard', protect, getLeaderboardData);

export default router;
