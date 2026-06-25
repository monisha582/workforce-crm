import { useEffect, useState } from 'react';
import api from '../../services/api';
import { showToast, showErrorToast } from '../../utils/toast';
import { TaskSkeleton } from '../../components/Skeleton';

export default function TasksPage() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', assigneeId: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (e) {
      console.error('Failed to load users', e);
      showErrorToast(e);
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
      await api.post('/tasks', form);
      closeModal();
      setForm({ title: '', description: '', assigneeId: '' });
      await fetchTasks();
      showToast.success('Task created successfully');
    } catch (err) {
      console.error(err);
      showErrorToast(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button 
          type="button" 
          onClick={openModal} 
          aria-label="Create new task"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Create Task
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
            <form onSubmit={handleCreate} className="space-y-3">
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
                  aria-required="true"
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
                  rows={4} 
                />
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
                  aria-required="true"
                >
                  <option value="">Select assignee</option>
                  {users.length ? users.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                  )) : <option value="" disabled>Loading users...</option>}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-4 py-2 rounded border hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
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
              <h3 className="font-semibold mb-4 text-gray-700" id={`status-${status}`}>
                {status.replace('_', ' ')}
              </h3>
              <div className="space-y-3" role="region" aria-labelledby={`status-${status}`}>
                {tasks.filter((t) => (t.status || 'PENDING') === status).map((task) => (
                  <article 
                    key={task.id} 
                    className="bg-gray-50 p-3 rounded border-l-4 border-blue-500 hover:shadow-md transition cursor-pointer"
                    tabIndex="0"
                    role="article"
                  >
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600 mt-1" aria-label={`Assigned to ${task.assignee?.firstName || 'User'}`}>
                      Assigned to: {task.assignee?.firstName || 'User'}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
