import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, statusColor, sourceLabel } from '../utils/helpers';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const StatCard = ({ label, value, sub, color }) => (
  <div className="stat-card card">
    <div className="stat-dot" style={{ background: color }} />
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub !== undefined && <div className="stat-sub">{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', fontSize:'0.82rem' }}>
      <div style={{ color:'var(--text-2)', marginBottom:2 }}>{label}</div>
      <div style={{ color:'var(--text)', fontWeight:600 }}>{payload[0].value} leads</div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/summary')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, gap:12 }}>
      <div className="spinner" />
      <span style={{ color:'var(--text-2)' }}>Loading analytics…</span>
    </div>
  );

  const monthlyData = (data?.monthlyCounts || []).map(m => ({
    name: MONTH_NAMES[m._id.month - 1],
    leads: m.count
  }));

  const sourceData = (data?.sourceCounts || []).map(s => ({
    name: sourceLabel(s._id),
    value: s.count
  }));

  const pieData = [
    { name: 'New', value: data?.new || 0, color: '#6c63ff' },
    { name: 'Contacted', value: data?.contacted || 0, color: '#f59e0b' },
    { name: 'Qualified', value: data?.qualified || 0, color: '#63b3ed' },
    { name: 'Converted', value: data?.converted || 0, color: '#10b981' },
    { name: 'Lost', value: data?.lost || 0, color: '#ff4d6d' },
  ].filter(d => d.value > 0);

  return (
    <div className="dashboard animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Good to see you, {user?.name?.split(' ')[0]} 👋</p>
        </div>
        <Link to="/leads/new" className="btn btn-primary">
          + Add Lead
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <StatCard label="Total Leads" value={data?.total || 0} color="#6c63ff" />
        <StatCard label="New" value={data?.new || 0} color="#6c63ff" />
        <StatCard label="Contacted" value={data?.contacted || 0} color="#f59e0b" />
        <StatCard label="Converted" value={data?.converted || 0} color="#10b981" />
        <StatCard
          label="Conversion Rate"
          value={`${data?.conversionRate || 0}%`}
          color="#00d4aa"
          sub={`${data?.lost || 0} lost`}
        />
      </div>

      {/* Charts row */}
      <div className="charts-row">
        {/* Monthly trend */}
        <div className="card chart-card">
          <h3 className="chart-title">Lead Volume</h3>
          <p className="chart-sub">Monthly incoming leads</p>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill:'#5a6070', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#5a6070', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#6c63ff" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding:'40px 0' }}>
              <div className="empty-icon">📈</div>
              <p>No data yet. Add some leads!</p>
            </div>
          )}
        </div>

        {/* Pipeline pie */}
        <div className="card chart-card chart-card-sm">
          <h3 className="chart-title">Pipeline</h3>
          <p className="chart-sub">Leads by status</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:8, fontSize:'0.82rem' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.map(d => (
                  <div key={d.name} className="legend-item">
                    <span className="legend-dot" style={{ background: d.color }} />
                    <span>{d.name}</span>
                    <span className="legend-val">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding:'40px 0' }}>
              <div className="empty-icon">🥧</div>
              <p>No leads yet</p>
            </div>
          )}
        </div>

        {/* Sources */}
        {sourceData.length > 0 && (
          <div className="card chart-card chart-card-sm">
            <h3 className="chart-title">Sources</h3>
            <p className="chart-sub">Where leads come from</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sourceData} layout="vertical" margin={{ top:0, right:10, left:10, bottom:0 }}>
                <XAxis type="number" tick={{ fill:'#5a6070', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill:'#9298aa', fontSize:11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:8, fontSize:'0.82rem' }} />
                <Bar dataKey="value" fill="#6c63ff" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent leads */}
      {data?.recentLeads?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 className="chart-title" style={{ marginBottom:0 }}>Recent Leads</h3>
            <Link to="/leads" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.map(lead => (
                  <tr key={lead._id}>
                    <td>
                      <Link to={`/leads/${lead._id}`} style={{ color:'var(--text)', fontWeight:500 }}>
                        {lead.name}
                      </Link>
                    </td>
                    <td>{lead.email}</td>
                    <td><span className="source-badge">{sourceLabel(lead.source)}</span></td>
                    <td><span className={`badge badge-${lead.status}`}>{lead.status}</span></td>
                    <td>{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
