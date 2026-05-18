import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { getEmployees } from '../services/userService';
import { getErrorMessage, formatStatus, statusColors } from '../utils/helpers';
import { format } from 'date-fns';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const emptyForm = { title: '', description: '', deadline: '', priority: 'medium', assignedUser: '', status: 'pending' };

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTasks({ page, limit: 10, search, status: statusFilter });
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { getEmployees().then((r) => setEmployees(r.data.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || '',
      deadline: task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : '',
      priority: task.priority,
      assignedUser: task.assignedUser?._id || '',
      status: task.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, deadline: new Date(form.deadline).toISOString() };
      if (editing) { await updateTask(editing._id, payload); toast.success('Task updated'); }
      else { await createTask(payload); toast.success('Task created'); }
      setModalOpen(false);
      fetchTasks();
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this completed task?')) return;
    try { await deleteTask(id); toast.success('Task deleted'); fetchTasks(); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold">Tasks & Follow-ups</h1><p className="text-gray-500">Manage team tasks and follow-ups</p></div>
        <button onClick={openCreate} className="btn-primary"><Plus className="mr-2 h-4 w-4" /> Add Task</button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1"><SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search tasks..." /></div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field sm:w-44">
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden !p-0">
        {loading ? <div className="flex h-48 items-center justify-center"><LoadingSpinner /></div> :
         tasks.length === 0 ? <EmptyState icon={CheckSquare} title="No tasks found" action={<button onClick={openCreate} className="btn-primary">Add Task</button>} /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Title</th>
                    <th className="px-4 py-3 text-left font-medium">Assigned</th>
                    <th className="px-4 py-3 text-left font-medium">Deadline</th>
                    <th className="px-4 py-3 text-left font-medium">Priority</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {tasks.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium">{t.title}</td>
                      <td className="px-4 py-3">{t.assignedUser?.name}</td>
                      <td className="px-4 py-3">{format(new Date(t.deadline), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3"><span className={`badge ${statusColors[t.priority]}`}>{formatStatus(t.priority)}</span></td>
                      <td className="px-4 py-3"><span className={`badge ${statusColors[t.status]}`}>{formatStatus(t.status)}</span></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(t)} className="mr-2 rounded p-1 hover:bg-gray-100"><Pencil className="h-4 w-4" /></button>
                        {t.status === 'completed' && (
                          <button onClick={() => handleDelete(t._id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Task' : 'Add Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium">Title *</label><input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label className="mb-1 block text-sm font-medium">Description</label><textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium">Deadline *</label><input type="date" className="input-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required /></div>
            <div><label className="mb-1 block text-sm font-medium">Assigned User *</label>
              <select className="input-field" value={form.assignedUser} onChange={(e) => setForm({ ...form, assignedUser: e.target.value })} required>
                <option value="">Select employee</option>
                {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium">Priority</label>
              <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{formatStatus(p)}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium">Status</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={submitting} className="btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
