import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { clearAuth, getUser } from '../utils/auth';

const defaultTask = { title: '', description: '', status: 'pending' };

function statusClass(status) {
  if (status === 'completed') return 'badge done';
  if (status === 'in-progress') return 'badge progress';
  return 'badge pending';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(defaultTask);
  const [editingId, setEditingId] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [loadingTaskId, setLoadingTaskId] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const user = useMemo(() => getUser(), []);
  const isAdmin = user?.role === 'admin';

  const fetchTasks = async () => {
    setLoadingTasks(true);
    setError('');

    try {
      const response = await api.get('/tasks');
      setTasks(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskInput = (e) => {
    setTaskForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setSavingTask(true);
    setError('');
    setMessage('');

    try {
      if (editingId) {
        const response = await api.put(`/tasks/${editingId}`, taskForm);
        setMessage(response?.data?.message || 'Task updated');
      } else {
        const response = await api.post('/tasks', taskForm);
        setMessage(response?.data?.message || 'Task created');
      }

      setTaskForm(defaultTask);
      setEditingId(null);
      await fetchTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending'
    });
  };

  const handleView = async (id) => {
    setLoadingTaskId(id);
    setError('');
    setMessage('');

    try {
      const response = await api.get(`/tasks/${id}`);
      const task = response?.data?.data;
      if (task) {
        setMessage(`Viewing: ${task.title} (${task.status})`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch task');
    } finally {
      setLoadingTaskId('');
    }
  };

  const handleDelete = async (id) => {
    setDeletingTaskId(id);
    setError('');
    setMessage('');

    try {
      const response = await api.delete(`/tasks/${id}`);
      setMessage(response?.data?.message || 'Task deleted');
      await fetchTasks();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeletingTaskId('');
    }
  };

  const handleLogout = async () => {
    setError('');
    setMessage('');

    try {
      await api.post('/auth/logout');
    } catch (_err) {
      // Clear local auth even if API logout fails.
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-page">
      <header className="topbar card">
        <div>
          <h1>Task Dashboard</h1>
          <p className="muted">Signed in as {user?.name || 'User'} ({user?.role || 'user'})</p>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <section className="card form-card">
        <h2>{editingId ? 'Update task' : 'Create task'}</h2>
        <form onSubmit={handleCreateOrUpdate}>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={taskForm.title} onChange={handleTaskInput} required />

          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={taskForm.description} onChange={handleTaskInput} required />

          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={taskForm.status} onChange={handleTaskInput}>
            <option value="pending">pending</option>
            <option value="in-progress">in-progress</option>
            <option value="completed">completed</option>
          </select>

          <div className="row">
            <button type="submit" disabled={savingTask}>
              {savingTask ? 'Saving...' : editingId ? 'Update Task' : 'Create Task'}
            </button>
            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEditingId(null);
                  setTaskForm(defaultTask);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      {message && <p className="alert success">{message}</p>}
      {error && <p className="alert error">{error}</p>}

      <section className="card list-card">
        <h2>Your tasks</h2>
        {loadingTasks ? (
          <p className="muted">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="muted">No tasks yet.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <article key={task._id} className="task-item">
                <div className="task-head">
                  <h3>{task.title}</h3>
                  <span className={statusClass(task.status)}>{task.status}</span>
                </div>
                <p>{task.description}</p>
                <div className="row">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => handleView(task._id)}
                    disabled={loadingTaskId === task._id}
                  >
                    {loadingTaskId === task._id ? 'Viewing...' : 'View'}
                  </button>
                  <button type="button" className="secondary" onClick={() => handleEdit(task)}>
                    Edit
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(task._id)}
                      disabled={deletingTaskId === task._id}
                    >
                      {deletingTaskId === task._id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
