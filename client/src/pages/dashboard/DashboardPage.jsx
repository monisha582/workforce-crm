export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Active Tasks', value: '12', color: 'bg-blue-500' },
          { title: 'Completed Tasks', value: '48', color: 'bg-green-500' },
          { title: 'Attendance', value: '96%', color: 'bg-purple-500' },
          { title: 'Performance', value: '85/100', color: 'bg-orange-500' },
        ].map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
            <p className={`${stat.color} text-white text-2xl font-bold p-2 rounded inline-block`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            Chart Placeholder
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            Chart Placeholder
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {['Task completed', 'Project milestone reached', 'New announcement posted'].map(
            (activity) => (
              <div key={activity} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                {activity}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
