import { useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { STATUS_OPTIONS, SOURCE_OPTIONS, sourceLabel } from '../utils/helpers';

const EMPTY = { name:'', email:'', phone:'', company:'', source:'website', status:'new', message:'', value:'' };

export default function LeadModal({ lead, onClose, onSaved }) {
  const { addToast } = useToast();
  const [form, setForm] = useState(lead ? {
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    company: lead.company || '',
    source: lead.source || 'website',
    status: lead.status || 'new',
    message: lead.message || '',
    value: lead.value || ''
  } : EMPTY);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (lead) {
        await api.put(`/leads/${lead._id}`, form);
        addToast('Lead updated successfully', 'success');
      } else {
        await api.post('/leads', form);
        addToast('Lead added successfully', 'success');
      }
      onSaved();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input name="name" className="form-input" placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input name="email" type="email" className="form-input" placeholder="jane@company.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input name="phone" className="form-input" placeholder="+1 555 000 0000" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input name="company" className="form-input" placeholder="Acme Corp" value={form.company} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select name="source" className="form-select" value={form.source} onChange={handleChange}>
                  {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{sourceLabel(s)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Deal Value ($)</label>
              <input name="value" type="number" min="0" className="form-input" placeholder="0" value={form.value} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Message / Notes</label>
              <textarea name="message" className="form-textarea" placeholder="What did they inquire about?" value={form.message} onChange={handleChange} />
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" style={{width:14,height:14}} /> Saving…</> : (lead ? 'Save Changes' : 'Add Lead')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
