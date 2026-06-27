import api from './api';

// Create a new task
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

// Get tasks
export const getTasks = async (filters = {}) => {
  const response = await api.get('/tasks', { params: filters });
  return response.data;
};

// Get task details
export const getTaskDetails = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

// Update task status
export const updateTaskStatus = async (taskId, status, qualityRating) => {
  const response = await api.patch(`/tasks/${taskId}/status`, {
    status,
    qualityRating,
  });
  return response.data;
};

// Delete task
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

// Create subtask
export const createSubtask = async (taskId, subtaskData) => {
  const response = await api.post(`/tasks/${taskId}/subtask`, subtaskData);
  return response.data;
};

// Get subtasks (included in task details)
// Use getTaskDetails to get task with subtasks

// Update subtask status
export const updateSubtaskStatus = async (subtaskId, status) => {
  const response = await api.patch(`/tasks/subtask/${subtaskId}`, { status });
  return response.data;
};

// Delete subtask
export const deleteSubtask = async (subtaskId) => {
  const response = await api.delete(`/tasks/subtask/${subtaskId}`);
  return response.data;
};
