import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../../context/uiStore';
import { useAuthStore } from '../../context/authStore';
import {
  MdDashboard,
  MdTask,
  MdAssignment,
  MdDateRange,
  MdShowChart,
  MdPeople,
  MdChat,
  MdAdminPanelSettings,
  MdMenu,
  MdClose,
  MdLogout,
} from 'react-icons/md';

const menuItems = [
  { icon: MdDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MdTask, label: 'Tasks', path: '/tasks' },
  { icon: MdAssignment, label: 'Projects', path: '/projects', roles: ['TEAM_LEAD', 'SUPER_ADMIN'] },
  { icon: MdDateRange, label: 'Attendance', path: '/attendance' },
  { icon: MdShowChart, label: 'Performance', path: '/performance' },
  { icon: MdPeople, label: 'Teams', path: '/teams', roles: ['HR', 'TEAM_LEAD', 'SUPER_ADMIN'] },
  { icon: MdChat, label: 'Chat', path: '/chat' },
  { icon: MdAdminPanelSettings, label: 'Admin', path: '/admin', roles: ['SUPER_ADMIN'] },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout, user } = useAuthStore();
  const availableMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } overflow-y-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Workforce CRM</h1>}
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-gray-800 rounded"
          >
            {sidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4">
          {availableMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon size={24} />
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <MdLogout size={20} />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome to Workforce CRM
            </h2>
            <p className="text-sm text-gray-500">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest user'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-semibold">{user?.role || 'Unknown'}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
