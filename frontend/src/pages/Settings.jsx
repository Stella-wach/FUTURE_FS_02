import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import './Settings.css';

export default function Settings() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileChange = e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePassChange = e => setPasswords(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileSave = async e => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.put('/auth/profile', profile);
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      addToast('New passwords do not match', 'error');
      return;
    }
    if (passwords.newPass.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setPassLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      addToast('Password changed successfully', 'success');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      const res = await api.get('/leads/export/csv', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('CSV exported successfully', 'success');
    } catch {
      addToast('Export failed', 'error');
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'data', label: 'Data & Export' },
    { id: 'api', label: 'API Info' },
  ];

  return (
    <div className="settings-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Tab sidebar */}
        <div className="settings-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`settings-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="card animate-in">
              <div className="settings-section-header">
                <h2>Profile Information</h2>
                <p>Update your name and email address</p>
              </div>
              <div className="profile-avatar-row">
                <div className="profile-avatar-lg">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="profile-name">{user?.name}</div>
                  <div className="profile-role-badge">{user?.role}</div>
                </div>
              </div>
              <form onSubmit={handleProfileSave} style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:420 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="name" className="form-input" value={profile.name} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input name="email" type="email" className="form-input" value={profile.email} onChange={handleProfileChange} required />
                </div>
                <div>
                  <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                    {profileLoading ? <><span className="spinner" style={{width:14,height:14}} /> Saving…</> : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <div className="card animate-in">
              <div className="settings-section-header">
                <h2>Change Password</h2>
                <p>Use a strong password of at least 6 characters</p>
              </div>
              <form onSubmit={handlePasswordChange} style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:420 }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input name="current" type="password" className="form-input" value={passwords.current} onChange={handlePassChange} required placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input name="newPass" type="password" className="form-input" value={passwords.newPass} onChange={handlePassChange} required placeholder="Min. 6 characters" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input name="confirm" type="password" className="form-input" value={passwords.confirm} onChange={handlePassChange} required placeholder="Repeat new password" />
                </div>
                <div>
                  <button type="submit" className="btn btn-primary" disabled={passLoading}>
                    {passLoading ? <><span className="spinner" style={{width:14,height:14}} /> Updating…</> : 'Update Password'}
                  </button>
                </div>
              </form>

              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <div className="danger-item">
                  <div>
                    <div className="danger-label">Sign out everywhere</div>
                    <div className="danger-desc">This will log you out of the current session</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={logout}>Sign Out</button>
                </div>
              </div>
            </div>
          )}

          {/* Data tab */}
          {activeTab === 'data' && (
            <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="card">
                <div className="settings-section-header">
                  <h2>Export Leads</h2>
                  <p>Download all your lead data as a CSV file for use in Excel, Google Sheets, or other tools</p>
                </div>
                <div className="export-options">
                  <div className="export-option">
                    <div className="export-icon">📊</div>
                    <div>
                      <div className="export-title">All Leads (CSV)</div>
                      <div className="export-desc">Name, email, company, status, source, value, notes count, message, date</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleExportAll}>
                      ↓ Export CSV
                    </button>
                  </div>
                  <div className="export-option">
                    <div className="export-icon">✅</div>
                    <div>
                      <div className="export-title">Converted Leads Only</div>
                      <div className="export-desc">Export only leads with "converted" status</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={async () => {
                      try {
                        const res = await api.get('/leads/export/csv?status=converted', { responseType: 'blob' });
                        const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
                        const a = document.createElement('a'); a.href = url;
                        a.download = `converted-leads-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click(); URL.revokeObjectURL(url);
                        addToast('Exported converted leads', 'success');
                      } catch { addToast('Export failed', 'error'); }
                    }}>
                      ↓ Export CSV
                    </button>
                  </div>
                  <div className="export-option">
                    <div className="export-icon">🆕</div>
                    <div>
                      <div className="export-title">New Leads Only</div>
                      <div className="export-desc">Export uncontacted leads to prioritise outreach</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={async () => {
                      try {
                        const res = await api.get('/leads/export/csv?status=new', { responseType: 'blob' });
                        const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
                        const a = document.createElement('a'); a.href = url;
                        a.download = `new-leads-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click(); URL.revokeObjectURL(url);
                        addToast('Exported new leads', 'success');
                      } catch { addToast('Export failed', 'error'); }
                    }}>
                      ↓ Export CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Info tab */}
          {activeTab === 'api' && (
            <div className="card animate-in">
              <div className="settings-section-header">
                <h2>Public Contact Form API</h2>
                <p>Embed this endpoint in your website's contact form to automatically create leads in SavanaCRM</p>
              </div>

              <div className="api-block">
                <div className="api-method-badge">POST</div>
                <code className="api-url">http://localhost:5000/api/contact</code>
              </div>

              <p style={{ color:'var(--text-2)', fontSize:'0.88rem', marginBottom:16 }}>No authentication required — designed to be called from your public website.</p>

              <div className="code-block">
                <div className="code-header">Request Body (JSON)</div>
                <pre>{`{
  "name":    "Jane Smith",          // required
  "email":   "jane@company.com",    // required
  "phone":   "+1 555 000 0000",     // optional
  "company": "Acme Corp",           // optional
  "message": "I'd like a demo...",  // optional
  "source":  "website"              // optional
}`}</pre>
              </div>

              <div className="code-block" style={{ marginTop:16 }}>
                <div className="code-header">Example — fetch() in your website</div>
                <pre>{`fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: formData.name,
    email: formData.email,
    message: formData.message,
    source: 'website'
  })
})
.then(r => r.json())
.then(data => console.log(data.message));
// → "Thank you! We'll be in touch shortly."`}</pre>
              </div>

              <div className="code-block" style={{ marginTop:16 }}>
                <div className="code-header">Success Response (201)</div>
                <pre>{`{
  "success": true,
  "message": "Thank you! We'll be in touch shortly.",
  "leadId":  "6612abc..."
}`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
