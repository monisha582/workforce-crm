import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createProject,
  getProjects,
  getProjectDetails,
  updateProjectProgress,
  createMilestone,
  updateMilestoneStatus,
} from '../controllers/projectController.js';

const router = express.Router();

router.post('/', protect, authorize('TEAM_LEAD', 'SUPER_ADMIN'), createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectDetails);
router.patch('/:id/progress', protect, updateProjectProgress);
router.post('/:projectId/milestone', protect, createMilestone);
router.patch('/milestone/:id/status', protect, updateMilestoneStatus);

export default router;
