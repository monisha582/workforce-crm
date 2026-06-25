export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teams</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Team {i}</h3>
            <p className="text-gray-600 text-sm mb-4">4 members</p>
            <div className="flex -space-x-2 mb-4">
              {[1, 2, 3, 4].map((member) => (
                <div
                  key={member}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold border-2 border-white"
                >
                  {member}
                </div>
              ))}
            </div>
            <button className="w-full bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
