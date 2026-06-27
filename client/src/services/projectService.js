import api from './api';

// Create a new project
export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

// Get all projects
export const getProjects = async (filters = {}) => {
  const response = await api.get('/projects', { params: filters });
  return response.data;
};

// Get project details
export const getProjectDetails = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

// Update project progress and status
export const updateProject = async (projectId, updateData) => {
  const response = await api.put(`/projects/${projectId}`, updateData);
  return response.data;
};

// Create milestone
export const createMilestone = async (projectId, milestoneData) => {
  const response = await api.post(`/projects/${projectId}/milestones`, milestoneData);
  return response.data;
};

// Update milestone status
export const updateMilestoneStatus = async (milestoneId, status) => {
  const response = await api.patch(`/projects/milestone/${milestoneId}`, { status });
  return response.data;
};

// Delete milestone
export const deleteMilestone = async (milestoneId) => {
  const response = await api.delete(`/projects/milestone/${milestoneId}`);
  return response.data;
};
