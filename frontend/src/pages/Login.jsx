import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Login() {
  const { login, demoLogin } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      addToast('Welcome back!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Self-healing demo account (backend/routes/auth.js POST /demo) -
      // creates the account on first use if needed, so this works in
      // production without anyone having to manually run seed.js.
      await demoLogin();
      addToast('Welcome to the demo!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
      </div>
      <div className="auth-card animate-in">
        <div className="auth-logo">
          <span className="auth-logo-icon">◈</span>
          <span className="auth-logo-text">SavanaCRM</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your CRM dashboard</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16}} /> Signing in…</> : 'Sign In →'}
          </button>
        </form>

        <p className="auth-switch">
          No account? <Link to="/register">Create one free</Link>
        </p>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="btn btn-secondary auth-submit"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          {loading ? <><span className="spinner" style={{width:16,height:16}} /> Loading demo…</> : 'Try Demo — No Signup Needed'}
        </button>
      </div>
    </div>
  );
}
