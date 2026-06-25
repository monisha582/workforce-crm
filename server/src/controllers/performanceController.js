import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

// Calculate Performance Score
const calculatePerformanceScore = async (userId) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Get attendance data (30 points max)
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      userId,
      date: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0),
      },
    },
  });

  const presentDays = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
  const attendanceScore = (presentDays / attendanceRecords.length) * 30 || 0;

  // Get task completion data (40 points max)
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
  });

  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const taskScore = (completedTasks / tasks.length) * 40 || 0;

  // Get deadline score (20 points max)
  const onTimeDeliveries = tasks.filter(
    (t) => t.status === 'COMPLETED' && t.completedAt <= t.dueDate
  ).length;
  const deadlineScore = (onTimeDeliveries / tasks.length) * 20 || 0;

  // Get quality score (10 points max)
  const qualityRatings = tasks.filter((t) => t.qualityRating).map((t) => t.qualityRating);
  const qualityScore =
    qualityRatings.length > 0
      ? (qualityRatings.reduce((a, b) => a + b, 0) / (qualityRatings.length * 5)) * 10
      : 0;

  const totalScore = attendanceScore + taskScore + deadlineScore + qualityScore;

  return {
    attendanceScore: Math.round(attendanceScore * 100) / 100,
    taskScore: Math.round(taskScore * 100) / 100,
    deadlineScore: Math.round(deadlineScore * 100) / 100,
    qualityScore: Math.round(qualityScore * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100,
  };
};

// Get Performance Metrics
export const getPerformanceMetrics = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    const targetUserId = userId || req.user.id;

    const metrics = await calculatePerformanceScore(targetUserId);

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    throw error;
  }
};

// Get Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const performances = await prisma.performance.findMany({
      include: { user: true },
      orderBy: { totalScore: 'desc' },
      take: 50,
    });

    const leaderboard = performances.map((p, index) => ({
      rank: index + 1,
      userId: p.user.id,
      userName: `${p.user.firstName} ${p.user.lastName}`,
      email: p.user.email,
      department: p.user.departmentId,
      score: p.totalScore,
      month: p.month,
      year: p.year,
    }));

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    throw error;
  }
};

// Get User Rank
export const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;

    const performances = await prisma.performance.findMany({
      include: { user: true },
      orderBy: { totalScore: 'desc' },
    });

    const userPerformance = performances.find((p) => p.userId === userId);
    const rank = performances.findIndex((p) => p.userId === userId) + 1;

    res.status(200).json({
      success: true,
      data: {
        rank,
        performance: userPerformance,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Recalculate All Performance Scores
export const recalculatePerformance = async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    for (const user of users) {
      const metrics = await calculatePerformanceScore(user.id);
      const now = new Date();

      await prisma.performance.upsert({
        where: {
          userId_month_year: {
            userId: user.id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        },
        update: metrics,
        create: {
          userId: user.id,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          ...metrics,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Performance metrics recalculated',
    });
  } catch (error) {
    throw error;
  }
};
