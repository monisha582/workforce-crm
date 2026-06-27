import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '../../services/api';
import * as taskService from '../../services/taskService';
import { showToast, showErrorToast } from '../../utils/toast';
import { TaskSkeleton } from '../../components/Skeleton';
import { FiPlus, FiChevronDown, FiChevronUp, FiTrash2, FiEdit2, FiCheckCircle } from 'react-icons/fi';

export default function TasksPage() {
  const [showModal, setShowModal] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    assigneeId: '',
    priority: 'MEDIUM',
    dueDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [subtaskAssignee, setSubtaskAssignee] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data.data || []);
    } catch (e) {
      console.error('Failed to load tasks', e);
      showErrorToast(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await taskService.createTask(form);
      closeModal();
      setForm({ 
        title: '', 
        description: '', 
        assigneeId: '',
        priority: 'MEDIUM',
        dueDate: ''
      });
      await fetchTasks();
      showToast.success('Task created successfully');
    } catch (err) {
      console.error(err);
      showErrorToast(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      await fetchTasks();
      toast.success('Task status updated');
    } catch (err) {
      toast.error('Failed to update task status');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      await fetchTasks();
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
      console.error(err);
    }
  };

  const toggleTaskExpanded = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleViewDetails = async (task) => {
    try {
      const res = await taskService.getTaskDetails(task.id);
      setSelectedTask(res.data);
      setShowTaskDetails(true);
    } catch (err) {
      toast.error('Failed to load task details');
      console.error(err);
    }
  };

  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) {
      toast.error('Enter subtask title');
      return;
    }

    try {
      await taskService.createSubtask(selectedTask.id, {
        title: newSubtask,
        assigneeId: subtaskAssignee || null
      });
      setNewSubtask('');
      setSubtaskAssignee('');
      const res = await taskService.getTaskDetails(selectedTask.id);
      setSelectedTask(res.data);
      toast.success('Subtask created');
    } catch (err) {
      toast.error('Failed to create subtask');
      console.error(err);
    }
  };

  const handleUpdateSubtaskStatus = async (subtaskId, status) => {
    try {
      await taskService.updateSubtaskStatus(subtaskId, status);
      const res = await taskService.getTaskDetails(selectedTask.id);
      setSelectedTask(res.data);
      toast.success('Subtask updated');
    } catch (err) {
      toast.error('Failed to update subtask');
      console.error(err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-slate-100 text-slate-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">Tasks</h1>
        <button 
          type="button" 
          onClick={openModal} 
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus className="text-xl" />
          Create Task
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 id="task-modal-title" className="text-xl font-semibold mb-4">Create Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input 
                  id="task-title"
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  placeholder="Enter task title" 
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea 
                  id="task-description"
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  placeholder="Enter task description" 
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select 
                    id="task-priority"
                    name="priority" 
                    value={form.priority} 
                    onChange={handleChange} 
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="task-duedate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input 
                    id="task-duedate"
                    type="date"
                    name="dueDate" 
                    value={form.dueDate} 
                    onChange={handleChange} 
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="task-assignee" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee *
                </label>
                <select 
                  id="task-assignee"
                  name="assigneeId" 
                  value={form.assigneeId} 
                  onChange={handleChange} 
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                >
                  <option value="">Select assignee</option>
                  {users.length ? users.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  )) : <option value="" disabled>Loading users...</option>}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-4 py-2 rounded border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl my-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
                <p className="text-gray-600 mt-2">{selectedTask.description}</p>
              </div>
              <button
                onClick={() => setShowTaskDetails(false)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Status</p>
                <select 
                  value={selectedTask.status || 'PENDING'}
                  onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                  className={`mt-1 px-3 py-2 rounded font-medium text-sm ${getStatusColor(selectedTask.status)}`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Priority</p>
                <p className={`mt-1 px-3 py-2 rounded font-medium text-sm inline-block ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority || 'MEDIUM'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Assigned To</p>
                <p className="mt-1 font-semibold">
                  {selectedTask.assignee?.firstName} {selectedTask.assignee?.lastName}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="mt-1 font-semibold">
                  {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'MMM dd, yyyy') : 'No date'}
                </p>
              </div>
            </div>

            {/* Subtasks */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">Subtasks ({selectedTask.subtasks?.length || 0})</h3>
              
              {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {selectedTask.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <input 
                        type="checkbox"
                        checked={subtask.status === 'COMPLETED'}
                        onChange={(e) => handleUpdateSubtaskStatus(
                          subtask.id, 
                          e.target.checked ? 'COMPLETED' : 'PENDING'
                        )}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className={subtask.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}>
                          {subtask.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {subtask.assignee ? `${subtask.assignee.firstName} ${subtask.assignee.lastName}` : 'Unassigned'}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(subtask.status)}`}>
                        {subtask.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleCreateSubtask} className="space-y-3">
                <input 
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add new subtask..."
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select 
                  value={subtaskAssignee}
                  onChange={(e) => setSubtaskAssignee(e.target.value)}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Assign to...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Subtask
                </button>
              </form>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowTaskDetails(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button 
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              >
                <FiTrash2 />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <TaskSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'].map((status) => (
            <div key={status} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-4 text-gray-700 text-lg">{status.replace(/_/g, ' ')}</h3>
              <div className="space-y-3">
                {tasks.filter((t) => (t.status || 'PENDING') === status).map((task) => (
                  <div 
                    key={task.id} 
                    onClick={() => handleViewDetails(task)}
                    className="bg-gray-50 p-4 rounded border-l-4 border-blue-500 hover:shadow-lg transition cursor-pointer"
                  >
                    <p className="font-medium text-sm">{task.title}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {task.priority && (
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                      {task.subtasks?.length > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {task.assignee?.firstName} {task.assignee?.lastName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
