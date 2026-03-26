import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { STATUS_OPTIONS, SOURCE_OPTIONS, formatDate, formatTime, sourceLabel, STATUS_FLOW } from '../utils/helpers';
import LeadModal from '../components/LeadModal';
import './LeadDetail.css';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [deletingNote, setDeletingNote] = useState(null);

  const fetchLead = async () => {
    try {
      const res = await api.get(`/leads/${id}`);
      setLead(res.data);
    } catch {
      addToast('Lead not found', 'error');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleStatusChange = async (status) => {
    try {
      const res = await api.patch(`/leads/${id}/status`, { status });
      setLead(res.data);
      addToast('Status updated', 'success');
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  const handleAddNote = async e => {
    e.preventDefault();
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      const res = await api.post(`/leads/${id}/notes`, { content: note.trim() });
      setLead(res.data);
      setNote('');
      addToast('Note added', 'success');
    } catch {
      addToast('Failed to add note', 'error');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setDeletingNote(noteId);
    try {
      const res = await api.delete(`/leads/${id}/notes/${noteId}`);
      setLead(res.data);
      addToast('Note deleted', 'success');
    } catch {
      addToast('Failed to delete note', 'error');
    } finally {
      setDeletingNote(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Permanently delete "${lead.name}"?`)) return;
    try {
      await api.delete(`/leads/${id}`);
      addToast('Lead deleted', 'success');
      navigate('/leads');
    } catch {
      addToast('Failed to delete lead', 'error');
    }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:40, color:'var(--text-2)' }}>
      <div className="spinner" /> Loading lead…
    </div>
  );

  if (!lead) return null;

  const nextStatus = STATUS_FLOW[lead.status];

  return (
    <div className="lead-detail animate-in">
      {/* Header */}
      <div className="detail-header">
        <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
          <Link to="/leads" className="btn btn-ghost btn-sm">← Back</Link>
          <div className="detail-avatar">{lead.name[0].toUpperCase()}</div>
          <div style={{ minWidth:0 }}>
            <h1 className="detail-name">{lead.name}</h1>
            <p style={{ color:'var(--text-2)', fontSize:'0.88rem', marginTop:1 }}>{lead.email}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
          {nextStatus && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleStatusChange(nextStatus)}
            >
              Mark as {nextStatus} →
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setShowEdit(true)}>✎ Edit</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>✕ Delete</button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left: info */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Info card */}
          <div className="card">
            <h3 className="section-title">Lead Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Status</div>
                <div>
                  <select
                    className="status-select-lg"
                    value={lead.status}
                    onChange={e => handleStatusChange(e.target.value)}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">Source</div>
                <div><span className="source-badge">{sourceLabel(lead.source)}</span></div>
              </div>
              {lead.company && (
                <div className="info-item">
                  <div className="info-label">Company</div>
                  <div className="info-value">{lead.company}</div>
                </div>
              )}
              {lead.phone && (
                <div className="info-item">
                  <div className="info-label">Phone</div>
                  <div className="info-value">{lead.phone}</div>
                </div>
              )}
              {lead.value > 0 && (
                <div className="info-item">
                  <div className="info-label">Deal Value</div>
                  <div className="info-value deal-value">${lead.value.toLocaleString()}</div>
                </div>
              )}
              <div className="info-item">
                <div className="info-label">Added</div>
                <div className="info-value">{formatTime(lead.createdAt)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Last Updated</div>
                <div className="info-value">{formatTime(lead.updatedAt)}</div>
              </div>
            </div>

            {lead.message && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop:'1px solid var(--border)' }}>
                <div className="info-label" style={{ marginBottom:8 }}>Initial Message</div>
                <p style={{ color:'var(--text-2)', fontSize:'0.9rem', lineHeight:1.6 }}>{lead.message}</p>
              </div>
            )}
          </div>

          {/* Status pipeline */}
          <div className="card">
            <h3 className="section-title">Pipeline Stage</h3>
            <div className="pipeline-steps">
              {STATUS_OPTIONS.filter(s => s !== 'lost').map((s, i) => {
                const statuses = STATUS_OPTIONS.filter(x => x !== 'lost');
                const currentIdx = statuses.indexOf(lead.status);
                const stepIdx = statuses.indexOf(s);
                const done = stepIdx < currentIdx;
                const active = s === lead.status;
                return (
                  <div key={s} className={`pipeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}
                    onClick={() => handleStatusChange(s)} title={`Set to ${s}`}>
                    <div className="pipeline-dot">{done ? '✓' : stepIdx + 1}</div>
                    <div className="pipeline-label">{s}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Notes */}
        <div className="card notes-card">
          <h3 className="section-title">Follow-up Notes</h3>
          <p style={{ color:'var(--text-3)', fontSize:'0.82rem', marginBottom:16 }}>
            {lead.notes.length} note{lead.notes.length !== 1 ? 's' : ''}
          </p>

          {/* Add note form */}
          <form onSubmit={handleAddNote} className="note-form">
            <textarea
              className="form-textarea"
              placeholder="Add a follow-up note, call summary, or update…"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={addingNote || !note.trim()}>
              {addingNote ? <><span className="spinner" style={{width:12,height:12}} /> Adding…</> : '+ Add Note'}
            </button>
          </form>

          {/* Notes list */}
          <div className="notes-list">
            {lead.notes.length === 0 ? (
              <div className="empty-state" style={{ padding:'30px 0' }}>
                <div className="empty-icon">📝</div>
                <p>No notes yet</p>
              </div>
            ) : (
              [...lead.notes].reverse().map(n => (
                <div key={n._id} className="note-item">
                  <div className="note-meta">
                    <span className="note-author">{n.addedBy}</span>
                    <span className="note-time">{formatTime(n.createdAt)}</span>
                    <button
                      className="btn btn-ghost btn-icon note-del"
                      title="Delete note"
                      onClick={() => handleDeleteNote(n._id)}
                      disabled={deletingNote === n._id}
                    >
                      {deletingNote === n._id ? '…' : '✕'}
                    </button>
                  </div>
                  <p className="note-content">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <LeadModal
          lead={lead}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchLead(); addToast('Lead updated', 'success'); }}
        />
      )}
    </div>
  );
}
