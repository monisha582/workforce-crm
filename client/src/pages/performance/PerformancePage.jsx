export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Attendance', value: '92%', color: 'text-blue-600' },
          { label: 'Tasks Completed', value: '48', color: 'text-green-600' },
          { label: 'On-time Delivery', value: '95%', color: 'text-purple-600' },
          { label: 'Quality Rating', value: '4.5/5', color: 'text-orange-600' },
        ].map((metric) => (
          <div key={metric.label} className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">{metric.label}</p>
            <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Score</h3>
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <div className="text-5xl font-bold text-blue-600">87</div>
            <p className="text-gray-600 text-sm mt-2">out of 100</p>
          </div>
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white text-3xl font-bold">87%</p>
              <p className="text-blue-100 text-xs">Excellent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((rank) => (
            <div key={rank} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-lg text-gray-400">#{rank}</span>
                <div>
                  <p className="font-semibold">Employee {rank}</p>
                  <p className="text-xs text-gray-600">Engineering</p>
                </div>
              </div>
              <span className="text-lg font-bold">{95 - rank}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
