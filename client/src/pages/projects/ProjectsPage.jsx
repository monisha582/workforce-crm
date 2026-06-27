import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as projectService from '../../services/projectService';
import api from '../../services/api';
import { FiPlus, FiTarget, FiUsers, FiCalendar, FiCheckCircle } from 'react-icons/fi';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    teamMemberIds: [],
  });
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects();
      setProjects(res.data || []);
    } catch (err) {
      toast.error('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamMemberSelect = (userId) => {
    setForm((prev) => {
      const members = prev.teamMemberIds.includes(userId)
        ? prev.teamMemberIds.filter((id) => id !== userId)
        : [...prev.teamMemberIds, userId];
      return { ...prev, teamMemberIds: members };
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const projectData = {
        ...form,
        budget: form.budget ? parseFloat(form.budget) : null,
      };
      await projectService.createProject(projectData);
      toast.success('Project created successfully');
      setForm({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        budget: '',
        teamMemberIds: [],
      });
      setShowModal(false);
      await fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneForm.name || !milestoneForm.dueDate) {
      toast.error('Enter milestone name and due date');
      return;
    }

    try {
      await projectService.createMilestone(selectedProject.id, milestoneForm);
      toast.success('Milestone created');
      setMilestoneForm({ name: '', description: '', dueDate: '' });
      setShowMilestoneForm(false);
      const res = await projectService.getProjectDetails(selectedProject.id);
      setSelectedProject(res.data);
    } catch (err) {
      toast.error('Failed to create milestone');
      console.error(err);
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId, status) => {
    try {
      await projectService.updateMilestoneStatus(milestoneId, status);
      toast.success('Milestone updated');
      const res = await projectService.getProjectDetails(selectedProject.id);
      setSelectedProject(res.data);
    } catch (err) {
      toast.error('Failed to update milestone');
      console.error(err);
    }
  };

  const handleViewDetails = async (project) => {
    try {
      const res = await projectService.getProjectDetails(project.id);
      setSelectedProject(res.data);
      setShowProjectDetails(true);
    } catch (err) {
      toast.error('Failed to load project details');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track your projects</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus className="text-xl" />
          New Project
        </button>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl my-8">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={form.budget}
                    onChange={handleInputChange}
                    placeholder="Enter budget"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Enter project description"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Members
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.teamMemberIds.includes(user.id)}
                        onChange={() => handleTeamMemberSelect(user.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{user.firstName} {user.lastName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showProjectDetails && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl my-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                <p className="text-gray-600 mt-2">{selectedProject.description}</p>
              </div>
              <button
                onClick={() => setShowProjectDetails(false)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Status</p>
                <span className={`mt-2 px-3 py-1 rounded text-sm font-medium inline-block ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status || 'ACTIVE'}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FiCalendar className="text-blue-600" /> Start Date
                </p>
                <p className="mt-2 font-semibold">
                  {format(new Date(selectedProject.startDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FiTarget className="text-green-600" /> Progress
                </p>
                <p className="mt-2 font-semibold">{selectedProject.progress || 0}%</p>
              </div>
            </div>

            {/* Milestones */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Milestones ({selectedProject.milestones?.length || 0})</h3>
                <button
                  onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <FiPlus /> Add Milestone
                </button>
              </div>

              {showMilestoneForm && (
                <form onSubmit={handleCreateMilestone} className="space-y-3 p-4 bg-gray-50 rounded mb-4">
                  <input
                    type="text"
                    value={milestoneForm.name}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                    placeholder="Milestone name"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <textarea
                    value={milestoneForm.description}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                    placeholder="Milestone description"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <input
                    type="date"
                    value={milestoneForm.dueDate}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMilestoneForm(false)}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-800 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                <div className="space-y-2">
                  {selectedProject.milestones.map((milestone) => (
                    <div key={milestone.id} className="p-4 bg-gray-50 rounded border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">{milestone.name}</p>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <select
                          value={milestone.status || 'PENDING'}
                          onChange={(e) => handleUpdateMilestoneStatus(milestone.id, e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No milestones yet</p>
              )}
            </div>

            {/* Team Members */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <FiUsers className="text-blue-600" />
                Team Members ({selectedProject.teamMembers?.length || 0})
              </h3>
              {selectedProject.teamMembers && selectedProject.teamMembers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedProject.teamMembers.map((tm) => (
                    <div key={tm.id} className="p-3 bg-gray-50 rounded">
                      <p className="font-semibold text-sm">
                        {tm.member.firstName} {tm.member.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{tm.member.email}</p>
                      {tm.role && <p className="text-xs text-blue-600 mt-1">{tm.role}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No team members assigned</p>
              )}
            </div>

            <button
              onClick={() => setShowProjectDetails(false)}
              className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading projects...</p>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleViewDetails(project)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-3 py-1 rounded font-medium ${getStatusColor(project.status)}`}>
                    {project.status || 'ACTIVE'}
                  </span>
                  <span className="text-sm font-semibold">{project.progress || 0}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <FiUsers className="text-blue-600" />
                    {project.teamMembers?.length || 0} members
                  </span>
                  <span className="flex items-center gap-1">
                    <FiTarget className="text-green-600" />
                    {project.milestones?.length || 0} milestones
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No projects yet. Create one to get started!</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus /> Create Project
          </button>
        </div>
      )}
    </div>
  );
}
