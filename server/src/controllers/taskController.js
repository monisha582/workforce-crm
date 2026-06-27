import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, description, assigneeId, dueDate, priority, projectId } = req.body;
    const createdBy = req.user.id;

    if (!title || !assigneeId) {
      throw new AppError('Title and assigneeId are required', 400);
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        createdBy,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        projectId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    throw error;
  }
};

// Get Tasks
export const getTasks = async (req, res) => {
  try {
    const { status, assigneeId, projectId, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const where = {};
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (projectId) where.projectId = projectId;

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: { assignee: true, subtasks: true },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
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

// Update Task Status
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, qualityRating } = req.body;

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        status,
        qualityRating: qualityRating || undefined,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Task updated',
      data: task,
    });
  } catch (error) {
    throw error;
  }
};

// Create Subtask
export const createSubtask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, assigneeId } = req.body;

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title,
        assigneeId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Subtask created',
      data: subtask,
    });
  } catch (error) {
    throw error;
  }
};

// Get Task Details
export const getTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        subtasks: { include: { assignee: true } },
        attachments: true,
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    throw error;
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    throw error;
  }
};

// Update Subtask Status
export const updateSubtaskStatus = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Subtask updated',
      data: subtask,
    });
  } catch (error) {
    throw error;
  }
};

// Delete Subtask
export const deleteSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;

    await prisma.subtask.delete({
      where: { id: subtaskId },
    });

    res.status(200).json({
      success: true,
      message: 'Subtask deleted',
    });
  } catch (error) {
    throw error;
  }
};
