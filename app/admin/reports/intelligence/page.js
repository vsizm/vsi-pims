'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const nav = [
  ['Dashboard', '/admin'],
  ['Activity Reports', '/admin/reports'],
  ['Pending Review', '/admin/reports?status=PENDING_REVIEW'],
  ['Approved Reports', '/admin/reports?status=APPROVED'],
  ['Finance Intelligence', '/admin/finance'],
  ['MEAL Intelligence', '/admin/meal'],
];

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function followUpText(item) {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return '';
  return item.action || item.description || item.task || item.title || item.followUp || '';
}

function followUpStatus(item) {
  if (!item || typeof item !== 'object') return 'Pending';
  return item.status || item.progress || item.state || 'Pending';
}

export default function ActivityIntelligencePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [geo, setGeo] = useState('All');
  const [implementation, setImplementation] = useState('All');

  useEffect(() => {
    fetch('/api/admin/activity-reports/intelligence', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load activity intelligence.');
        setReports(data.reports || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const geographies = useMemo(() => ['All', ...new Set(reports.map(r => r.province).filter(Boolean))], [reports]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      if (geo !== 'All' && r.province !== geo) return false;
      if (implementation !== 'All' && (r.implementation_status || 'Not stated') !== implementation) return false;
      if (!q) return true;
      return [r.reference, r.activity_title, r.activity_code, r.directorate, r.programme, r.project, r.province, r.district, r.constituency, r.ward_community, r.reporter_full_name]
        .filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [reports, search, geo, implementation]);

  const metrics = useMemo(() => {
    const approved = filtered.filter(r => r.review_status === 'APPROVED');
    const fully = filtered.filter(r => r.implementation_status === 'Fully').length;
    const partial = filtered.filter(r => r.implementation_status === 'Partially').length;
    const notImplemented = filtered.filter(r => r.implementation_status === 'Not Implemented').length;
    const followUps = filtered.flatMap(r => list(r.follow_up_actions));
    const pendingTasks = followUps.filter(x => ['complete', 'completed', 'done'].indexOf(String(followUpStatus(x)).toLowerCase()) === -1).length;
    return { approved: approved.length, fully, partial, notImplemented, pendingTasks, followUps: followUps.length };
  }, [filtered]);

  return <div className="phase2-app">
    <aside className="admin-sidebar">
      <div className="side-brand"><div className="side-logo-wrap"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" /></div><div className="side-brand-copy"><strong>VSI IMS</strong><small>ADMINISTRATION</small></div></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{nav.slice(0,4).map(([label, href]) => <Link key={label} href={href} className={label === 'Activity Reports' ? 'active' : ''}><span className="nav-dot" />{label}</Link>)}</nav>
      <div className="side-label intelligence">INTELLIGENCE</div>
      <nav>{nav.slice(4).map(([label, href]) => <Link key={label} href={href}><span className="nav-dot intel-dot" />{label}</Link>)}</nav>
      <div className="side-note">Phase 2 operational intelligence uses activity-report data to map delivery, implementation and follow-up actions.</div>
      <Link className="back-report" href="/admin/reports">← Reports Register</Link>
    </aside>

    <main className="phase2-main">
      <header className="page-header">
        <div><div className="kicker">VSI ADMINISTRATION · PHASE 02</div><h1>Activity Reports Intelligence</h1><p>Operational intelligence from activity location, implementation and follow-up data.</p></div>
        <Link className="header-action" href="/admin/reports">Reports Register →</Link>
      </header>

      <section className="hero-note"><strong>Operational view</strong><span>Track where VSI activities are delivered, how implementation is progressing and which follow-up actions remain open.</span></section>

      <section className="metric-grid">
        <div className="metric"><span>ACTIVITIES IN VIEW</span><strong>{filtered.length}</strong><small>Filtered activity reports</small></div>
        <div className="metric approved"><span>APPROVED</span><strong>{metrics.approved}</strong><small>Trusted operational records</small></div>
        <div className="metric"><span>FULLY IMPLEMENTED</span><strong>{metrics.fully}</strong><small>Reported as fully delivered</small></div>
        <div className="metric partial"><span>PARTIALLY IMPLEMENTED</span><strong>{metrics.partial}</strong><small>Requires attention</small></div>
        <div className="metric risk"><span>FOLLOW-UPS OPEN</span><strong>{metrics.pendingTasks}</strong><small>{metrics.followUps} actions identified</small></div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><div className="section-kicker">01 · DELIVERY FOOTPRINT</div><h2>Geographic &amp; programme mapping</h2><p>Province, district, constituency and ward visibility across submitted activities.</p></div></div>
        <div className="toolbar"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity, programme, project, officer or location…" aria-label="Search activity intelligence" /><select value={geo} onChange={e => setGeo(e.target.value)} aria-label="Filter by province">{geographies.map(x => <option key={x}>{x}</option>)}</select><select value={implementation} onChange={e => setImplementation(e.target.value)} aria-label="Filter by implementation status"><option>All</option><option>Fully</option><option>Partially</option><option>Not Implemented</option><option>Not stated</option></select></div>
        {loading && <div className="empty">Loading operational intelligence…</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && <div className="table-wrap"><table><thead><tr><th>Activity</th><th>Directorate / Programme</th><th>Project</th><th>Location</th><th>Participants</th><th>Implementation</th><th>Status</th></tr></thead><tbody>{filtered.map(r => <tr key={r.reference}><td><strong>{r.activity_title || 'Untitled activity'}</strong><small>{r.reference}{r.activity_code ? ` · ${r.activity_code}` : ''}</small></td><td>{r.directorate || '—'}<small>{r.programme || '—'}</small></td><td>{r.project || '—'}</td><td>{[r.province, r.district, r.constituency, r.ward_community].filter(Boolean).join(' · ') || '—'}<small>{r.venue || ''}</small></td><td>{r.participant_total ?? 0}</td><td><span className={`pill ${(r.implementation_status || 'Not stated').toLowerCase().replaceAll(' ','-')}`}>{r.implementation_status || 'Not stated'}</span>{r.implementation_change && <small className="change">Deviation noted</small>}</td><td><span className={`status ${String(r.review_status || 'PENDING_REVIEW').toLowerCase()}`}>{r.review_status || 'PENDING REVIEW'}</span></td></tr>)}{filtered.length === 0 && <tr><td colSpan="7" className="empty-cell">No activities match the selected filters.</td></tr>}</tbody></table></div>}
      </section>

      <div className="two-col">
        <section className="panel"><div className="panel-head"><div><div className="section-kicker">02 · FOLLOW-UP ACTIONS</div><h2>Operational tracker</h2><p>Actions reported by officers, with progress where supplied.</p></div></div><div className="task-list">{filtered.flatMap(r => list(r.follow_up_actions).map((item, index) => ({ report:r, item, index }))).slice(0,30).map(({report,item,index}) => <div className="task" key={`${report.reference}-${index}`}><div><strong>{followUpText(item) || 'Follow-up action'}</strong><small>{report.activity_title} · {report.reference}</small></div><span className={`task-status ${String(followUpStatus(item)).toLowerCase().replaceAll(' ','-')}`}>{followUpStatus(item)}</span></div>)}{metrics.followUps === 0 && <div className="empty">No follow-up actions have been recorded.</div>}</div></section>
        <section className="panel"><div className="panel-head"><div><div className="section-kicker">03 · IMPLEMENTATION AUDIT</div><h2>Delivery status</h2><p>Implementation outcomes and reported deviations.</p></div></div><div className="audit-grid"><div><strong>{metrics.fully}</strong><span>Fully</span></div><div><strong>{metrics.partial}</strong><span>Partially</span></div><div><strong>{metrics.notImplemented}</strong><span>Not Implemented</span></div></div><div className="audit-note">{filtered.filter(r => r.implementation_change).length} activities report an implementation change or deviation from the original plan.</div></section>
      </div>

      <section className="panel compact"><div className="panel-head"><div><div className="section-kicker">04 · STRATEGIC CONTEXT</div><h2>Alignment &amp; activity context</h2><p>Activity intelligence remains linked to the existing Directorate, Programme, Project and Activity structure. Strategic alignment continues to come from the activity record rather than being re-entered here.</p></div></div></section>
    </main>
    <style jsx>{`
      .phase2-app{min-height:100vh;background:#f4f7fa;color:#17212b;display:flex;overflow-x:hidden}.admin-sidebar{position:sticky;top:0;height:100vh;width:250px;flex:0 0 250px;background:linear-gradient(180deg,#003566 0%,#094074 58%,#082f52 100%);color:#fff;padding:20px 14px;display:flex;flex-direction:column;box-sizing:border-box;box-shadow:8px 0 24px rgba(0,53,102,.12)}.side-brand{display:flex;align-items:center;gap:10px;padding:4px 8px 20px;border-bottom:1px solid rgba(255,255,255,.14)}.side-logo-wrap{width:48px;height:34px;flex:0 0 48px;display:flex;align-items:center;justify-content:center;overflow:hidden}.side-brand img{max-width:48px;max-height:30px;width:auto;height:auto;display:block;object-fit:contain}.side-brand strong{display:block;font-size:16px;line-height:1.2;letter-spacing:.07em}.side-brand small{display:block;font-size:9px;line-height:1.2;letter-spacing:.14em;color:#ffd60a;margin-top:3px;font-weight:900}.side-label{font-size:10px;font-weight:900;letter-spacing:.16em;color:rgba(255,255,255,.58);padding:20px 10px 8px}.side-label.intelligence{padding-top:22px}.admin-sidebar nav{display:flex;flex-direction:column;gap:3px}.admin-sidebar nav a{color:rgba(255,255,255,.84);text-decoration:none;padding:10px 11px;border-radius:9px;font-size:12px;font-weight:800;display:flex;align-items:center;gap:9px;white-space:nowrap;overflow:hidden}.admin-sidebar nav a.active{background:#ffc300;color:#003566}.admin-sidebar nav a:hover{background:rgba(255,255,255,.09)}.nav-dot{width:7px;height:7px;border-radius:50%;background:#3c6997;flex:0 0 7px}.intel-dot{background:#ffd60a}.active .nav-dot{background:#003566}.side-note{font-size:10px;line-height:1.55;color:rgba(255,255,255,.64);padding:15px 10px 0}.back-report{margin-top:auto;text-decoration:none;color:#003566;background:#ffd60a;border-radius:9px;padding:10px 11px;text-align:center;font-size:11px;font-weight:900}.phase2-main{min-width:0;flex:1;padding:28px clamp(18px,3.5vw,42px) 55px;box-sizing:border-box}.page-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:18px}.kicker,.section-kicker{font-size:10px;letter-spacing:.13em;color:#3c6997;font-weight:900}.page-header h1{margin:6px 0 0;color:#003566;font-size:clamp(27px,3vw,38px);line-height:1.05;letter-spacing:-.03em}.page-header p{margin:8px 0 0;color:#65717d;font-size:13px}.header-action{border:1px solid #dfe5ea;background:#fff;color:#003566;border-radius:9px;padding:9px 13px;font-size:11px;font-weight:900;text-decoration:none;white-space:nowrap}.hero-note{display:flex;gap:12px;align-items:center;background:#003566;color:#fff;border-radius:12px;padding:14px 17px;margin-bottom:14px}.hero-note strong{font-size:12px;white-space:nowrap}.hero-note span{font-size:11px;color:rgba(255,255,255,.78)}.metric-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:16px}.metric{background:#fff;border:1px solid #dfe5ea;border-top:3px solid #3c6997;border-radius:11px;padding:13px;min-width:0}.metric.approved{border-top-color:#2e7d52}.metric.partial{border-top-color:#ffc300}.metric.risk{border-top-color:#c56a19}.metric span{display:block;color:#65717d;font-size:8px;font-weight:900;letter-spacing:.09em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.metric strong{display:block;color:#003566;font-size:25px;line-height:1.1;margin:6px 0}.metric small{color:#65717d;font-size:10px}.panel{background:#fff;border:1px solid #dfe5ea;border-radius:14px;margin-bottom:16px;box-shadow:0 4px 18px rgba(0,53,102,.045);overflow:hidden}.panel-head{padding:16px 19px;border-bottom:1px solid #e7edf1}.panel-head h2{margin:4px 0 0;color:#003566;font-size:18px}.panel-head p{margin:4px 0 0;color:#65717d;font-size:11px;line-height:1.5}.toolbar{display:flex;gap:8px;padding:14px 18px;border-bottom:1px solid #e7edf1}.toolbar input,.toolbar select{height:38px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#17212b;padding:8px 10px;font:inherit;font-size:11px;box-sizing:border-box}.toolbar input{flex:1;min-width:180px}.toolbar select{min-width:150px}.table-wrap{overflow:auto}table{width:100%;min-width:900px;border-collapse:collapse;table-layout:fixed}th{background:#f4f7fa;color:#52606d;text-transform:uppercase;font-size:8px;letter-spacing:.05em;text-align:left;padding:10px;border-bottom:1px solid #dfe5ea}td{padding:11px 10px;border-bottom:1px solid #e7edf1;font-size:10px;vertical-align:top;overflow-wrap:anywhere}td strong{display:block;color:#17212b}td small{display:block;color:#7a8793;margin-top:3px;line-height:1.35}.pill,.status,.task-status{display:inline-block;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:900;white-space:nowrap;background:#eef2f5;color:#52606d}.pill.fully{background:#dcfce7;color:#15803d}.pill.partially{background:#fef3c7;color:#a16207}.pill.not-implemented{background:#fee2e2;color:#b42318}.status.approved{background:#dcfce7;color:#15803d}.status.pending_review{background:#fef3c7;color:#a16207}.status.returned{background:#ffedd5;color:#c2410c}.status.rejected{background:#fee2e2;color:#b42318}.change{color:#c56a19!important;font-weight:800}.empty,.error{padding:24px 18px;color:#65717d;font-size:12px}.error{color:#b42318}.empty-cell{text-align:center!important;color:#65717d!important}.two-col{display:grid;grid-template-columns:1.25fr .75fr;gap:16px}.task-list{padding:5px 18px}.task{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid #e7edf1}.task:last-child{border-bottom:0}.task strong{display:block;font-size:11px;color:#17212b}.task small{display:block;color:#7a8793;font-size:9px;margin-top:3px}.task-status.complete,.task-status.completed{background:#dcfce7;color:#15803d}.task-status.in-progress{background:#dbeafe;color:#1d4ed8}.task-status.pending{background:#fef3c7;color:#a16207}.audit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:18px}.audit-grid div{background:#f4f7fa;border-radius:9px;padding:16px;text-align:center}.audit-grid strong{display:block;color:#003566;font-size:27px}.audit-grid span{display:block;color:#65717d;font-size:10px;margin-top:4px}.audit-note{margin:0 18px 18px;padding:12px;background:#f8fafc;border-radius:9px;color:#65717d;font-size:10px;line-height:1.45}.compact .panel-head{border-bottom:0}@media(max-width:1000px){.metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.two-col{grid-template-columns:1fr}}@media(max-width:760px){.admin-sidebar{position:relative;width:100%;height:auto;min-height:auto;flex-basis:auto}.phase2-app{display:block}.page-header{flex-direction:column}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.toolbar{flex-direction:column}.toolbar input,.toolbar select{width:100%}.hero-note{align-items:flex-start;flex-direction:column}.phase2-main{padding:20px 14px 40px}}
    `}</style>
  </div>;
}
