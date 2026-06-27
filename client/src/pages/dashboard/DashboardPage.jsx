import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FiClock, FiCheckCircle, FiCalendar, FiTrendingUp } from 'react-icons/fi';

export default function DashboardPage() {
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

      // Fetch tasks
      const tasksRes = await api.get('/tasks');
      const allTasks = tasksRes.data?.data || [];
      setTasks(allTasks);

      // Fetch attendance data
      const attendanceRes = await api.get('/attendance/history', {
        params: { month, year },
      });
      const attendanceData = attendanceRes.data?.data?.records || [];
      setAttendance(attendanceData);

      // Fetch performance
      const perfRes = await api.get('/performance/metrics');
      setPerformance(perfRes.data?.data);

      // Calculate working hours
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

      // Calculate stats
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

  const getAttendanceStatus = () => {
    if (attendance.length === 0) return 'No data';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRecord = attendance.find(
      (a) => new Date(a.date).getTime() === today.getTime()
    );
    if (todayRecord) {
      if (todayRecord.checkOutTime) {
        return `Checked out at ${format(new Date(todayRecord.checkOutTime), 'hh:mm a')}`;
      }
      return `Checked in at ${format(new Date(todayRecord.checkInTime), 'hh:mm a')}`;
    }
    return 'Not checked in';
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
              <p className="text-xl font-bold text-blue-600 mt-2">{getAttendanceStatus()}</p>
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
        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Active Tasks</h3>
          {getRecentTasks().length > 0 ? (
            <div className="space-y-3">
              {getRecentTasks().map((task) => (
                <div key={task.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500 hover:bg-gray-100 transition">
                  <p className="font-medium text-sm">{task.title}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                    <span>{task.assignee?.firstName || 'Unassigned'}</span>
                    <span
                      className={`px-2 py-1 rounded ${
                        task.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {task.status || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No active tasks</div>
          )}
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
          {performance ? (
            <div className="space-y-3">
              {[
                { label: 'Attendance Score', value: Math.round(performance.attendanceScore || 0) },
                { label: 'Task Score', value: Math.round(performance.taskScore || 0) },
                { label: 'Deadline Score', value: Math.round(performance.deadlineScore || 0) },
                { label: 'Quality Score', value: Math.round(performance.qualityScore || 0) },
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
            <div className="p-4 text-center text-gray-500">No performance data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
