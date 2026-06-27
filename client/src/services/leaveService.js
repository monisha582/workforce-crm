import api from './api';

// Request a leave
export const requestLeave = async (leaveData) => {
  const response = await api.post('/attendance/request-leave', leaveData);
  return response.data;
};

// Get my leaves
export const getMyLeaves = async (status) => {
  const response = await api.get('/attendance/leaves', {
    params: { status },
  });
  return response.data;
};

// Get all leaves (HR/Admin)
export const getAllLeaves = async (userId, status) => {
  const response = await api.get('/attendance/leaves', {
    params: { userId, status },
  });
  return response.data;
};

// Approve leave (HR/Admin only)
export const approveLeave = async (leaveId, approvalData) => {
  const response = await api.put(`/attendance/leaves/${leaveId}`, {
    status: 'APPROVED',
    ...approvalData,
  });
  return response.data;
};

// Reject leave (HR/Admin only)
export const rejectLeave = async (leaveId, rejectReason) => {
  const response = await api.put(`/attendance/leaves/${leaveId}`, {
    status: 'REJECTED',
    rejectReason,
  });
  return response.data;
};
