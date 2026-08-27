'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ReportsClient() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <main style={{ minHeight: '100vh', background: '#f4f7fa', color: '#122033' }}>
      <header style={{ background: '#032b4d', borderBottom: '4px solid #ffd220', color: '#fff' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ color: '#ffd220', fontWeight: 800, fontSize: 12, letterSpacing: '.1em' }}>VSI IMS · ADMINISTRATION</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 30 }}>Activity Reports</h1>
          </div>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.45)', color: '#fff', padding: '9px 14px', borderRadius: 8, fontWeight: 700 }}>Sign out</button>
        </div>
      </header>

      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '30px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 20, marginBottom: 22 }}>
          <div><h2 style={{ margin: 0, fontSize: 24 }}>Reports Inbox</h2><p style={{ margin: '6px 0 0', color: '#5d6b7b' }}>Review submitted activity reports and open individual records for the next workflow stage.</p></div>
          <Link href="/activity-report" style={{ color: '#063b6d', fontWeight: 800, textDecoration: 'none' }}>View public form →</Link>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', minWidth: 170, boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}><div style={{ fontSize: 12, color: '#6b7785', textTransform: 'uppercase', fontWeight: 800 }}>Submitted</div><strong style={{ display: 'block', fontSize: 28, marginTop: 4 }}>{reports.length}</strong></div>
        </div>

        {loading && <div style={{ background: '#fff', borderRadius: 14, padding: 28 }}>Loading reports…</div>}
        {error && <div style={{ background: '#fff1f1', color: '#9b1c1c', borderRadius: 14, padding: 18 }}>{error}</div>}
        {!loading && !error && (
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'auto', boxShadow: '0 2px 14px rgba(0,0,0,.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead><tr style={{ background: '#eef3f7', textAlign: 'left' }}>{['Reference','Activity','Date','Directorate','Programme','Project','Reporter','Participants','Assessment','Action'].map((h) => <th key={h} style={{ padding: '13px 14px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.03em' }}>{h}</th>)}</tr></thead>
              <tbody>
                {reports.map((report) => <tr key={report.reference} style={{ borderTop: '1px solid #e5eaf0' }}>
                  <td style={{ padding: 14, fontWeight: 800, whiteSpace: 'nowrap' }}>{report.reference}</td>
                  <td style={{ padding: 14, fontWeight: 700, minWidth: 190 }}>{report.activity_title}</td>
                  <td style={{ padding: 14, whiteSpace: 'nowrap' }}>{report.activity_date ? new Date(report.activity_date).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: 14 }}>{report.directorate || '—'}</td>
                  <td style={{ padding: 14 }}>{report.programme || '—'}</td>
                  <td style={{ padding: 14 }}>{report.project || '—'}</td>
                  <td style={{ padding: 14 }}>{report.reporter_full_name || '—'}</td>
                  <td style={{ padding: 14, textAlign: 'center' }}>{report.participant_total ?? 0}</td>
                  <td style={{ padding: 14 }}>{report.overall_assessment || '—'}</td>
                  <td style={{ padding: 14 }}><button disabled style={{ border: '1px solid #ccd5df', background: '#f7f9fb', borderRadius: 7, padding: '8px 11px', fontWeight: 700, color: '#526273' }}>Review soon</button></td>
                </tr>)}
                {reports.length === 0 && <tr><td colSpan="10" style={{ padding: 40, textAlign: 'center', color: '#647384' }}>No activity reports have been submitted yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
