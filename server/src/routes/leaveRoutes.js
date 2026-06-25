import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: Get leave requests
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leaves
 */
router.get('/', protect, async (req, res) => {
  res.json({ message: 'Leaves list' });
});

export default router;
