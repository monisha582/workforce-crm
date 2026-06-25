import { useEffect, useState } from 'react';
import api from '../../services/api';
import { showToast, showErrorToast } from '../../utils/toast';
import { TableSkeleton, CardSkeleton } from '../../components/Skeleton';

export default function AttendancePage() {
  const [history, setHistory] = useState({ records: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/history');
      setHistory(res.data.data || { records: [], summary: {} });
    } catch (e) {
      console.error('Failed to load attendance', e);
      showErrorToast(e);
      setHistory({ records: [], summary: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/checkin', { latitude: 0, longitude: 0 });
      showToast.success('Checked in successfully');
      await fetchHistory();
    } catch (e) {
      console.error(e);
      showErrorToast(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/checkout', { latitude: 0, longitude: 0 });
      showToast.success('Checked out successfully');
      await fetchHistory();
    } catch (e) {
      console.error(e);
      showErrorToast(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <div className="space-x-2">
          <button 
            onClick={handleCheckIn} 
            disabled={actionLoading}
            aria-label="Check in"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            Check In
          </button>
          <button 
            onClick={handleCheckOut} 
            disabled={actionLoading}
            aria-label="Check out"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            Check Out
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Present</p>
            <p className="text-3xl font-bold text-blue-600" aria-label={`Present: ${history.summary?.present ?? 0} days`}>
              {history.summary?.present ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Absent</p>
            <p className="text-3xl font-bold text-red-600" aria-label={`Absent: ${history.summary?.absent ?? 0} days`}>
              {history.summary?.absent ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">On Leave</p>
            <p className="text-3xl font-bold text-yellow-600" aria-label={`On Leave: ${history.summary?.leave ?? 0} days`}>
              {history.summary?.leave ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {loading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : (history.records || []).length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full" role="table">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Check In</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {(history.records || []).map((h) => (
                <tr key={h.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(h.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        h.status === 'PRESENT' 
                          ? 'bg-green-100 text-green-800' 
                          : h.status === 'ABSENT' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                      aria-label={`Status: ${h.status}`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{h.checkInTime ? new Date(h.checkInTime).toLocaleTimeString() : '-'}</td>
                  <td className="px-6 py-4 text-sm">{h.checkOutTime ? new Date(h.checkOutTime).toLocaleTimeString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No attendance records found</p>
        </div>
      )}
    </div>
  );
}
