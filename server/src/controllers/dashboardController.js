import prisma from '../config/prisma.js';

// Get Dashboard Overview
export const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user's tasks
    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
    });

    const activeTasks = tasks.filter((t) => ['PENDING', 'IN_PROGRESS'].includes(t.status));
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

    // Get attendance this month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,
        date: { gte: monthStart },
      },
    });

    const presentDays = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const attendancePercentage =
      attendanceRecords.length > 0 ? (presentDays / attendanceRecords.length) * 100 : 0;

    // Get performance data
    const performance = await prisma.performance.findFirst({
      where: {
        userId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    // Get user's projects
    const projects = await prisma.project.findMany({
      where: {
        OR: [{ leadId: userId }, { teamMembers: { some: { memberId: userId } } }],
      },
    });

    // Get recent activities
    const activityLogs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        expiresAt: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.status(200).json({
      success: true,
      data: {
        tasks: {
          active: activeTasks.length,
          completed: completedTasks.length,
          pending: tasks.filter((t) => t.status === 'PENDING').length,
          total: tasks.length,
        },
        attendance: {
          presentDays,
          absent: attendanceRecords.filter((a) => a.status === 'ABSENT').length,
          leave: attendanceRecords.filter((a) => a.status === 'LEAVE').length,
          percentage: Math.round(attendancePercentage),
        },
        performance: performance || { totalScore: 0 },
        projects: {
          count: projects.length,
          data: projects,
        },
        recentActivities: activityLogs,
        announcements,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Get Statistics
export const getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Task statistics
    const tasks = await prisma.task.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    // Project statistics
    const projects = await prisma.project.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    // User statistics
    const users = await prisma.user.findMany();

    res.status(200).json({
      success: true,
      data: {
        tasks: {
          total: tasks.length,
          completed: tasks.filter((t) => t.status === 'COMPLETED').length,
          pending: tasks.filter((t) => t.status === 'PENDING').length,
          inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        },
        projects: {
          total: projects.length,
          completed: projects.filter((p) => p.status === 'COMPLETED').length,
          inProgress: projects.filter((p) => p.status === 'IN_PROGRESS').length,
        },
        users: {
          total: users.length,
          active: users.filter((u) => u.isActive).length,
          byRole: {
            SUPER_ADMIN: users.filter((u) => u.role === 'SUPER_ADMIN').length,
            HR: users.filter((u) => u.role === 'HR').length,
            TEAM_LEAD: users.filter((u) => u.role === 'TEAM_LEAD').length,
            EMPLOYEE: users.filter((u) => u.role === 'EMPLOYEE').length,
            INTERN: users.filter((u) => u.role === 'INTERN').length,
          },
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

// Get Leaderboard
export const getLeaderboardData = async (req, res) => {
  try {
    const performances = await prisma.performance.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { totalScore: 'desc' },
      take: 10,
    });

    const leaderboard = performances.map((p, index) => ({
      rank: index + 1,
      user: p.user,
      score: p.totalScore,
    }));

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    throw error;
  }
};
