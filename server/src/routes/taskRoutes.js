import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validationMiddleware, createTaskSchema } from '../utils/validators.js';
import {
  createTask,
  getTasks,
  updateTaskStatus,
  createSubtask,
  updateSubtaskStatus,
  deleteSubtask,
  getTaskDetails,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.post('/', protect, validationMiddleware(createTaskSchema), createTask);
router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskDetails);
router.patch('/:id/status', protect, updateTaskStatus);
router.delete('/:id', protect, deleteTask);
router.post('/:taskId/subtask', protect, createSubtask);
router.patch('/subtask/:subtaskId', protect, updateSubtaskStatus);
router.delete('/subtask/:subtaskId', protect, deleteSubtask);

export default router;
