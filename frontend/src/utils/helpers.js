export const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'converted', 'lost'];
export const SOURCE_OPTIONS = ['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'other'];

export const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const sourceLabel = (s) => s?.replace(/_/g, ' ') || '—';

export const STATUS_FLOW = {
  new: 'contacted',
  contacted: 'qualified',
  qualified: 'converted'
};

export const statusColor = (s) => ({
  new: '#6c63ff',
  contacted: '#f59e0b',
  qualified: '#63b3ed',
  converted: '#10b981',
  lost: '#ff4d6d'
}[s] || '#9298aa');
