import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

// Create Project
export const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, budget, teamMemberIds } = req.body;
    const leadId = req.user.id;

    if (!name || !startDate) {
      throw new AppError('Name and startDate are required', 400);
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        budget,
        leadId,
      },
    });

    // Add team members
    if (teamMemberIds && teamMemberIds.length > 0) {
      await Promise.all(
        teamMemberIds.map((memberId) =>
          prisma.teamMember.create({
            data: {
              projectId: project.id,
              memberId,
            },
          })
        )
      );
    }

    res.status(201).json({
      success: true,
      message: 'Project created',
      data: project,
    });
  } catch (error) {
    throw error;
  }
};

// Get Projects
export const getProjects = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          lead: true,
          teamMembers: { include: { member: true } },
          milestones: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: projects,
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

// Get Project Details
export const getProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        lead: true,
        teamMembers: { include: { member: true } },
        milestones: true,
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    throw error;
  }
};

// Update Project Progress
export const updateProjectProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, status } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        progress: progress || undefined,
        status: status || undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Project updated',
      data: project,
    });
  } catch (error) {
    throw error;
  }
};

// Create Milestone
export const createMilestone = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, dueDate } = req.body;

    const milestone = await prisma.milestone.create({
      data: {
        projectId,
        name,
        description,
        dueDate: new Date(dueDate),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Milestone created',
      data: milestone,
    });
  } catch (error) {
    throw error;
  }
};

// Update Milestone Status
export const updateMilestoneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Milestone updated',
      data: milestone,
    });
  } catch (error) {
    throw error;
  }
};
