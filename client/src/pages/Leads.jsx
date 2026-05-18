import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { getLeads, createLead, updateLead, deleteLead } from '../services/leadService';
import { getEmployees } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, formatStatus, statusColors } from '../utils/helpers';

const LEAD_STATUSES = ['new', 'contacted', 'interested', 'negotiation', 'closed'];
const emptyForm = { title: '', customerName: '', email: '', phone: '', company: '', value: 0, status: 'new', source: 'website', assignedTo: '', notes: '' };

const Leads = () => {
  const { hasRole } = useAuth();
  const [leads, setLeads] = useState([]);
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

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeads({ page, limit: 10, search, status: statusFilter });
      setLeads(res.data.data.leads);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { getEmployees().then((r) => setEmployees(r.data.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (lead) => {
    setEditing(lead);
    setForm({ title: lead.title, customerName: lead.customerName, email: lead.email, phone: lead.phone || '', company: lead.company || '', value: lead.value, status: lead.status, source: lead.source, assignedTo: lead.assignedTo?._id || '', notes: lead.notes || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) { await updateLead(editing._id, form); toast.success('Lead updated'); }
      else { await createLead(form); toast.success('Lead created'); }
      setModalOpen(false);
      fetchLeads();
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead permanently?')) return;
    try { await deleteLead(id); toast.success('Lead deleted'); fetchLeads(); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold">Leads</h1><p className="text-gray-500">Track and manage sales leads</p></div>
        <button onClick={openCreate} className="btn-primary"><Plus className="mr-2 h-4 w-4" /> Add Lead</button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1"><SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search leads..." /></div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field sm:w-44">
          <option value="">All Status</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden !p-0">
        {loading ? <div className="flex h-48 items-center justify-center"><LoadingSpinner /></div> :
         leads.length === 0 ? <EmptyState icon={Target} title="No leads found" action={<button onClick={openCreate} className="btn-primary">Add Lead</button>} /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Title</th>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-left font-medium">Value</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Assigned</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {leads.map((l) => (
                    <tr key={l._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium">{l.title}</td>
                      <td className="px-4 py-3">{l.customerName}</td>
                      <td className="px-4 py-3">${l.value?.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={`badge ${statusColors[l.status]}`}>{formatStatus(l.status)}</span></td>
                      <td className="px-4 py-3">{l.assignedTo?.name || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(l)} className="mr-2 rounded p-1 hover:bg-gray-100"><Pencil className="h-4 w-4" /></button>
                        {hasRole('admin', 'sales_manager') && (
                          <button onClick={() => handleDelete(l._id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Lead' : 'Add Lead'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium">Title *</label><input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div><label className="mb-1 block text-sm font-medium">Customer Name *</label><input className="input-field" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required /></div>
            <div><label className="mb-1 block text-sm font-medium">Email *</label><input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div><label className="mb-1 block text-sm font-medium">Phone</label><input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="mb-1 block text-sm font-medium">Company</label><input className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><label className="mb-1 block text-sm font-medium">Value ($)</label><input type="number" className="input-field" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
            <div><label className="mb-1 block text-sm font-medium">Status</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {LEAD_STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium">Assigned To</label>
              <select className="input-field" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="mb-1 block text-sm font-medium">Notes</label><textarea className="input-field" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : 'Save'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Leads;

