import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { STATUS_OPTIONS, SOURCE_OPTIONS, formatDate, sourceLabel } from '../utils/helpers';
import LeadModal from '../components/LeadModal';
import './Leads.css';

const exportCSV = async (addToast, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    const res = await api.get(`/leads/export/csv?${params}`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Leads exported as CSV', 'success');
  } catch {
    addToast('Export failed', 'error');
  }
};

export default function Leads() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', source: '' });
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.source) params.set('source', filters.source);
      const res = await api.get(`/leads?${params}`);
      setLeads(res.data.leads);
      setTotal(res.data.total);
    } catch (err) {
      addToast('Failed to load leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setFilters(p => ({ ...p, search: searchInput })); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleFilter = (key, val) => { setFilters(p => ({ ...p, [key]: val })); setPage(1); };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/leads/${id}/status`, { status });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      addToast('Status updated', 'success');
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete lead "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/leads/${id}`);
      setLeads(prev => prev.filter(l => l._id !== id));
      setTotal(p => p - 1);
      addToast('Lead deleted', 'success');
    } catch {
      addToast('Failed to delete lead', 'error');
    }
  };

  const handleSaved = () => { setShowModal(false); setEditLead(null); fetchLeads(); };
  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="leads-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">{total} total lead{total !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" onClick={() => exportCSV(addToast, filters)} title="Export current view as CSV">
            ↓ Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => { setEditLead(null); setShowModal(true); }}>
            + Add Lead
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="filters-bar card">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by name, email, company…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <select
          className="form-select filter-select"
          value={filters.status}
          onChange={e => handleFilter('status', e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          className="form-select filter-select"
          value={filters.source}
          onChange={e => handleFilter('source', e.target.value)}
        >
          <option value="">All sources</option>
          {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{sourceLabel(s)}</option>)}
        </select>
        {(filters.search || filters.status || filters.source) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ search:'', status:'', source:'' }); setSearchInput(''); }}>
            Clear ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card table-card">
        {loading ? (
          <div className="loading-row"><div className="spinner" /><span>Loading leads…</span></div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No leads found</h3>
            <p>{filters.search || filters.status || filters.source ? 'Try adjusting your filters' : 'Add your first lead to get started'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead._id}>
                    <td>
                      <Link to={`/leads/${lead._id}`} className="lead-name-link">
                        <div className="lead-avatar">{lead.name[0].toUpperCase()}</div>
                        <span>{lead.name}</span>
                      </Link>
                    </td>
                    <td>{lead.email}</td>
                    <td>{lead.company || <span style={{color:'var(--text-3)'}}>—</span>}</td>
                    <td><span className="source-badge">{sourceLabel(lead.source)}</span></td>
                    <td>
                      <select
                        className="status-select"
                        value={lead.status}
                        onChange={e => handleStatusChange(lead._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>{formatDate(lead.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Edit"
                          onClick={() => { setEditLead(lead); setShowModal(true); }}
                        >✎</button>
                        <Link to={`/leads/${lead._id}`} className="btn btn-ghost btn-icon btn-sm" title="View">↗</Link>
                        <button
                          className="btn btn-ghost btn-icon btn-sm delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(lead._id, lead.name)}
                        >✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination">
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="page-info">Page {page} of {pages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {showModal && (
        <LeadModal
          lead={editLead}
          onClose={() => { setShowModal(false); setEditLead(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
