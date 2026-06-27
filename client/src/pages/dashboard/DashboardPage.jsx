import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '../../context/authStore';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FiClock, FiCheckCircle, FiCalendar, FiTrendingUp, FiUsers, FiTarget } from 'react-icons/fi';

// HR Dashboard Component
function HRDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    attendanceRate: 0,
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHRData();
  }, []);

  const fetchHRData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users
      const usersRes = await api.get('/users');
      const totalEmployees = usersRes.data?.data?.length || 0;
      setStats(prev => ({ ...prev, totalEmployees }));

      // Fetch all leave requests
      const leavesRes = await api.get('/attendance/leaves');
      const leaves = leavesRes.data?.data || [];
      const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
      setLeaveRequests(pendingLeaves);

      // Fetch attendance summary
      const attendanceRes = await api.get('/attendance/history');
      const records = attendanceRes.data?.data?.records || [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRecords = records.filter(r => 
        new Date(r.date).toDateString() === today.toDateString()
      );
      
      setStats(prev => ({
        ...prev,
        presentToday: todayRecords.filter(r => r.status === 'PRESENT').length,
        onLeave: todayRecords.filter(r => r.status === 'LEAVE').length,
        attendanceRate: totalEmployees > 0 
          ? Math.round((todayRecords.filter(r => r.status === 'PRESENT').length / totalEmployees) * 100)
          : 0,
      }));

      // Process attendance data for chart
      const attendanceByDay = records.reduce((acc, curr) => {
        const date = format(new Date(curr.date), 'MMM dd');
        const existing = acc.find(a => a.date === date);
        if (existing) {
          if (curr.status === 'PRESENT') existing.present++;
          if (curr.status === 'ABSENT') existing.absent++;
          if (curr.status === 'LEAVE') existing.leave++;
        } else {
          acc.push({
            date,
            present: curr.status === 'PRESENT' ? 1 : 0,
            absent: curr.status === 'ABSENT' ? 1 : 0,
            leave: curr.status === 'LEAVE' ? 1 : 0,
          });
        }
        return acc;
      }, []);
      setAttendanceData(attendanceByDay);
    } catch (error) {
      console.error('Failed to fetch HR data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">HR Dashboard</h1>
        <p className="text-gray-600 mt-2">Employee attendance and leave management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Employees', value: stats.totalEmployees, icon: FiUsers, color: 'bg-blue-500' },
          { title: 'Present Today', value: stats.presentToday, icon: FiCheckCircle, color: 'bg-green-500' },
          { title: 'On Leave', value: stats.onLeave, icon: FiCalendar, color: 'bg-yellow-500' },
          { title: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: FiTrendingUp, color: 'bg-purple-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  <Icon className="text-2xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Attendance Trend</h3>
        {attendanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
              <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
              <Bar dataKey="leave" stackId="a" fill="#f59e0b" name="Leave" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
        )}
      </div>

      {/* Pending Leave Requests */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Pending Leave Requests ({leaveRequests.length})</h3>
        {leaveRequests.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="p-4 bg-gray-50 rounded border-l-4 border-yellow-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{leave.reason}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd')}
                    </p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                    {leave.leaveType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No pending leave requests</p>
        )}
      </div>
    </div>
  );
}

// Team Lead Dashboard Component
function TeamLeadDashboard() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    activeTasksTeam: 0,
    completedTasks: 0,
    teamMembers: 0,
  });
  const [teamTasks, setTeamTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamLeadData();
  }, []);

  const fetchTeamLeadData = async () => {
    try {
      setLoading(true);

      // Fetch projects
      const projectsRes = await api.get('/projects');
      const allProjects = projectsRes.data?.data || [];
      const activeProjects = allProjects.filter(p => p.status !== 'COMPLETED');
      setProjects(activeProjects);

      // Fetch tasks
      const tasksRes = await api.get('/tasks');
      const allTasks = tasksRes.data?.data || [];
      setTeamTasks(allTasks);

      setStats({
        activeProjects: activeProjects.length,
        activeTasksTeam: allTasks.filter(t => t.status !== 'COMPLETED').length,
        completedTasks: allTasks.filter(t => t.status === 'COMPLETED').length,
        teamMembers: allProjects.reduce((sum, p) => sum + (p.teamMembers?.length || 0), 0),
      });
    } catch (error) {
      console.error('Failed to fetch team lead data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">Team Lead Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage projects and team performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Active Projects', value: stats.activeProjects, icon: FiTarget, color: 'bg-blue-500' },
          { title: 'Team Tasks', value: stats.activeTasksTeam, icon: FiCheckCircle, color: 'bg-green-500' },
          { title: 'Completed', value: stats.completedTasks, icon: FiTrendingUp, color: 'bg-purple-500' },
          { title: 'Team Members', value: stats.teamMembers, icon: FiUsers, color: 'bg-orange-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  <Icon className="text-2xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Active Projects ({projects.length})</h3>
          {projects.length > 0 ? (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <p className="font-semibold text-sm">{project.name}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{project.progress || 0}% complete</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No active projects</p>
          )}
        </div>

        {/* Task Status Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Task Distribution</h3>
          <div className="space-y-2">
            {[
              { status: 'PENDING', count: teamTasks.filter(t => t.status === 'PENDING').length, color: 'bg-slate-100' },
              { status: 'IN_PROGRESS', count: teamTasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'bg-blue-100' },
              { status: 'UNDER_REVIEW', count: teamTasks.filter(t => t.status === 'UNDER_REVIEW').length, color: 'bg-purple-100' },
              { status: 'COMPLETED', count: teamTasks.filter(t => t.status === 'COMPLETED').length, color: 'bg-green-100' },
            ].map((item) => (
              <div key={item.status} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium">{item.status.replace(/_/g, ' ')}</span>
                <span className={`px-3 py-1 rounded text-sm font-bold ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Employee Dashboard Component (default)
function EmployeeDashboard() {
  const [stats, setStats] = useState({
    activeTasks: 0,
    completedTasks: 0,
    attendancePercent: 0,
    performanceScore: 0,
  });
  const [workingHours, setWorkingHours] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const tasksRes = await api.get('/tasks');
      const allTasks = tasksRes.data?.data || [];
      setTasks(allTasks);

      const attendanceRes = await api.get('/attendance/history', {
        params: { month, year },
      });
      const attendanceData = attendanceRes.data?.data?.records || [];
      setAttendance(attendanceData);

      const perfRes = await api.get('/performance/metrics');
      setPerformance(perfRes.data?.data);

      const workingHoursData = attendanceData
        .filter((a) => a.workingHours)
        .reduce((acc, curr) => {
          const date = format(new Date(curr.date), 'MMM dd');
          const existing = acc.find((a) => a.date === date);
          if (existing) {
            existing.hours += curr.workingHours;
          } else {
            acc.push({ date, hours: curr.workingHours });
          }
          return acc;
        }, []);
      setWorkingHours(workingHoursData);

      const activeTasks = allTasks.filter(
        (t) => t.status && ['PENDING', 'IN_PROGRESS'].includes(t.status)
      ).length;
      const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED').length;

      const attendance_data = attendanceRes.data?.data?.summary || {};
      const totalDays = attendance_data.total || 30;
      const presentDays = attendance_data.present || 0;
      const attendancePercent =
        totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      setStats({
        activeTasks,
        completedTasks,
        attendancePercent,
        performanceScore: perfRes.data?.data?.totalScore || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentTasks = () => {
    return tasks
      .filter((t) => t.status && ['PENDING', 'IN_PROGRESS'].includes(t.status))
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your performance overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Active Tasks',
            value: stats.activeTasks,
            color: 'bg-blue-500',
            icon: FiCheckCircle,
          },
          {
            title: 'Completed Tasks',
            value: stats.completedTasks,
            color: 'bg-green-500',
            icon: FiCheckCircle,
          },
          {
            title: 'Attendance',
            value: `${stats.attendancePercent}%`,
            color: 'bg-purple-500',
            icon: FiCalendar,
          },
          {
            title: 'Performance Score',
            value: Math.round(stats.performanceScore),
            color: 'bg-orange-500',
            icon: FiTrendingUp,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  <Icon className="text-2xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Working Hours & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Hours Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiClock className="text-blue-600 text-xl" />
            <h3 className="text-lg font-bold">Working Hours This Month</h3>
          </div>
          {workingHours.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workingHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No working hours data available
            </div>
          )}
        </div>

        {/* Attendance Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Today's Attendance</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-xl font-bold text-blue-600 mt-2">Checked In</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Present Days</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {attendance.filter((a) => a.status === 'PRESENT').length}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Absent Days</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {attendance.filter((a) => a.status === 'ABSENT').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Active Tasks</h3>
          {getRecentTasks().length > 0 ? (
            <div className="space-y-3">
              {getRecentTasks().map((task) => (
                <div key={task.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{task.assignee?.firstName || 'Unassigned'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No active tasks</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
          {performance ? (
            <div className="space-y-3">
              {[
                { label: 'Attendance', value: Math.round(performance.attendanceScore || 0) },
                { label: 'Tasks', value: Math.round(performance.taskScore || 0) },
                { label: 'Deadlines', value: Math.round(performance.deadlineScore || 0) },
                { label: 'Quality', value: Math.round(performance.qualityScore || 0) },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                    <p className="text-sm font-bold text-gray-900">{metric.value}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No performance data</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main component that routes based on role
export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Route to role-specific dashboard
  switch (user.role) {
    case 'HR':
    case 'SUPER_ADMIN':
      return <HRDashboard />;
    case 'TEAM_LEAD':
      return <TeamLeadDashboard />;
    case 'EMPLOYEE':
    case 'INTERN':
    default:
      return <EmployeeDashboard />;
  }
}
