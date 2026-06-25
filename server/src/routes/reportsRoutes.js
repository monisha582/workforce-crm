import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports data
 */
router.get('/', protect, async (req, res) => {
  res.json({ message: 'Reports data' });
});

export default router;
