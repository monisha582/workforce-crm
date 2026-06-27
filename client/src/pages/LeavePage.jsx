import React, { useEffect, useState } from 'react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { FiCalendar, FiCheck, FiX, FiClock, FiPlus } from 'react-icons/fi';
import * as leaveService from '../services/leaveService';
import { useAuthStore } from '../context/authStore';

export default function LeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    type: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getMyLeaves(statusFilter);
      setLeaves(response.data || []);
    } catch (error) {
      toast.error('Failed to load leaves');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.reason.length < 10) {
      toast.error('Reason must be at least 10 characters');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      await leaveService.requestLeave({
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });
      toast.success('Leave request submitted');
      setFormData({ type: 'CASUAL', startDate: '', endDate: '', reason: '' });
      setShowForm(false);
      loadLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'CASUAL':
        return 'bg-blue-100 text-blue-800';
      case 'SICK':
        return 'bg-red-100 text-red-800';
      case 'PERSONAL':
        return 'bg-purple-100 text-purple-800';
      case 'PAID':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Leave Management</h1>
            <p className="text-gray-600">Request and track your leave requests</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus className="text-xl" />
            Request Leave
          </button>
        </div>

        {/* Leave Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request New Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Leave Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="PERSONAL">Personal Leave</option>
                    <option value="PAID">Paid Leave</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Reason */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Enter reason for leave"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status || 'all'}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                statusFilter === status
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {status ? status.charAt(0) + status.slice(1).toLowerCase() : 'All'}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <FiClock className="text-4xl text-blue-600" />
            </div>
            <p className="text-gray-600 mt-4">Loading leaves...</p>
          </div>
        )}

        {/* Leaves List */}
        {!loading && leaves.length > 0 ? (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                        {leave.leaveType}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{leave.reason}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 flex items-center gap-2">
                      <FiCalendar className="text-blue-600" />
                      Start Date
                    </p>
                    <p className="font-semibold text-gray-800">
                      {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 flex items-center gap-2">
                      <FiCalendar className="text-blue-600" />
                      End Date
                    </p>
                    <p className="font-semibold text-gray-800">
                      {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-800">
                      {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>

                {leave.status === 'REJECTED' && leave.rejectReason && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                    <p className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {leave.rejectReason}
                    </p>
                  </div>
                )}

                {leave.status === 'APPROVED' && leave.approvalDate && (
                  <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                    <p className="text-sm text-green-800">
                      <strong>Approved on:</strong> {format(new Date(leave.approvalDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No leave requests found</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
