'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const tabs = ['All Reports', 'Pending Review', 'Approved', 'Returned', 'Rejected'];

export default function ReportsClient() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('All Reports');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/admin/activity-reports', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load reports.');
        return data;
      })
      .then((data) => setReports(data.reports || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    window.location.href = '/admin/login';
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((report) => {
      if (tab !== 'All Reports' && tab !== 'Pending Review') return false;
      if (!q) return true;
      return [report.reference, report.activity_title, report.directorate, report.programme, report.project, report.reporter_full_name]
        .filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [reports, tab, query]);

  return (
    <main className="page" style={{ minHeight: '100vh' }}>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" className="vsi-logo" /></div>
          <span>ACTIVITY REPORT</span>
          <div className="social-links" aria-label="VSI social links">
            <a href="https://web.facebook.com/vsizambia" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://www.linkedin.com/in/visionary-students-initiative-vsi-0a447238/" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://www.instagram.com/vsizambia" target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>
            <a href="https://www.youtube.com/@vsizambia" target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>
            <a href="https://www.vsizambia.org" target="_blank" rel="noreferrer" aria-label="VSI website">↗</a>
            <button onClick={logout} type="button" style={{ marginLeft: 6, background: 'transparent', border: '1px solid rgba(255,255,255,.5)', color: '#fff', borderRadius: 20, padding: '8px 12px', fontWeight: 800, cursor: 'pointer' }}>Sign out</button>
          </div>
        </div>
      </div>

      <div className="shell">
        <header className="form-intro">
          <p><strong>VSI ADMINISTRATION · ACTIVITY REPORTS</strong><br />Review, verify, approve and manage activity reports submitted by VSI officers.</p>
        </header>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
          {tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} style={{ border: '1px solid var(--line)', borderRadius: 9, padding: '10px 14px', background: tab === item ? 'var(--regal-navy)' : '#fff', color: tab === item ? '#fff' : 'var(--regal-navy)', fontWeight: 800, cursor: 'pointer' }}>{item}</button>)}
        </div>

        <section className="section">
          <div className="section-head"><span className="number">01</span><div><h2>Dashboard Summary</h2><p>Activity report submission and review queue.</p></div></div>
          <div className="section-body">
            <div className="grid">
              {[['TOTAL REPORTS', reports.length, 'All submitted reports'], ['PENDING REVIEW', reports.length, 'Awaiting administrative review'], ['APPROVED', 0, 'Verified reports'], ['RETURNED', 0, 'Require corrections'], ['REJECTED', 0, 'Not accepted']].map(([label, value, note]) => <div key={label} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 18, background: '#fff' }}><div className="kicker">{label}</div><strong style={{ display: 'block', color: 'var(--regal-navy)', fontSize: 30 }}>{value}</strong><span style={{ color: 'var(--muted)', fontSize: 13 }}>{note}</span></div>)}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head"><span className="number">02</span><div><h2>Activity Report Register</h2><p>Open a report to inspect the complete submitted record and attachments.</p></div></div>
          <div className="section-body">
            <div style={{ marginBottom: 18 }}><label>Search reports<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Reference, activity, programme, project or officer…" /></label></div>
            {loading && <div className="vsi-document-empty">Loading reports…</div>}
            {error && <div className="error">{error}</div>}
            {!loading && !error && <div className="table-wrap"><table className="money-table" style={{ minWidth: 1100 }}><thead><tr><th>Reference</th><th>Activity</th><th>Directorate / Programme</th><th>Project</th><th>Date</th><th>Submitted By</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map((report) => <tr key={report.reference}><td><strong>{report.reference}</strong></td><td><strong>{report.activity_title}</strong></td><td>{report.directorate || '—'} / {report.programme || '—'}</td><td>{report.project || '—'}</td><td>{report.activity_date ? new Date(report.activity_date).toLocaleDateString() : '—'}</td><td>{report.reporter_full_name || '—'}</td><td><span style={{ display: 'inline-block', padding: '5px 8px', borderRadius: 999, background: '#fff9dc', color: '#6b5600', fontWeight: 800, fontSize: 12 }}>PENDING REVIEW</span></td><td><Link href={`/admin/reports/${encodeURIComponent(report.reference)}`} className="small-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>Review ↗</Link></td></tr>)}{filtered.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: 35, color: 'var(--muted)' }}>No reports match this view.</td></tr>}</tbody></table></div>}
          </div>
        </section>
      </div>
    </main>
  );
}
