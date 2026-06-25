export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Total Users', 'Active Projects', 'Departments', 'Tasks'].map((stat) => (
          <div key={stat} className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">{stat}</p>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Users Management</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((user) => (
              <div key={user} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">User {user}</p>
                  <p className="text-xs text-gray-600">user{user}@example.com</p>
                </div>
                <button className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Departments</h3>
          <div className="space-y-3">
            {['Engineering', 'HR', 'Operations', 'Sales'].map((dept) => (
              <div key={dept} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <p className="font-semibold">{dept}</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
