'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const NAV = [
  ['Dashboard', '/admin'],
  ['Activity Reports', '/admin/reports'],
  ['Pending Review', '/admin/reports?status=PENDING_REVIEW'],
  ['Approved Reports', '/admin/reports?status=APPROVED'],
  ['Finance Intelligence', '/admin/finance'],
  ['MEAL Intelligence', '/admin/meal'],
];

const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;
const money = (n) => `ZMW ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Card({ label, value, note, accent = 'blue', href }) {
  const body = <div className={`stat-card ${accent}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
  return href ? <Link href={href} className="stat-link">{body}</Link> : body;
}

function Sidebar({ active }) {
  return <aside className="admin-sidebar">
    <div className="side-brand"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" /><div><strong>VSI IMS</strong><small>ADMINISTRATION</small></div></div>
    <div className="side-label">WORKSPACE</div>
    <nav>{NAV.slice(0, 4).map(([label, href]) => <Link key={label} href={href} className={active === label ? 'active' : ''}><span className="nav-dot" />{label}</Link>)}</nav>
    <div className="side-label intelligence">INTELLIGENCE</div>
    <nav>{NAV.slice(4).map(([label, href]) => <Link key={label} href={href} className={active === label ? 'active' : ''}><span className="nav-dot intel-dot" />{label}</Link>)}</nav>
    <div className="side-note">Approved reports are the trusted layer for organisational performance, finance and MEAL intelligence.</div>
    <Link className="back-report" href="/activity-report">Open Activity Report ↗</Link>
  </aside>;
}

export default function AdminDashboard({ active = 'Dashboard', title = 'Administration Dashboard', subtitle = 'Management overview of VSI activity reporting, finance and MEAL performance.' }) {
  const [reports, setReports] = useState([]), [details, setDetails] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch('/api/admin/activity-reports', { cache: 'no-store' });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Unable to load dashboard data.');
        const list = data.reports || [];
        const approved = list.filter(x => x.review_status === 'APPROVED');
        const full = await Promise.all(approved.map(async x => {
          const response = await fetch(`/api/admin/activity-reports/${encodeURIComponent(x.reference)}`, { cache: 'no-store' });
          const item = await response.json();
          return item.report || x;
        }));
        if (!cancelled) { setReports(list); setDetails(full); }
      } catch (e) { if (!cancelled) setError(e.message); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const pending = reports.filter(r => (r.review_status || 'PENDING_REVIEW') === 'PENDING_REVIEW').length;
    const approved = reports.filter(r => r.review_status === 'APPROVED').length;
    const returned = reports.filter(r => r.review_status === 'RETURNED').length;
    const rejected = reports.filter(r => r.review_status === 'REJECTED').length;
    const planned = details.reduce((s, r) => s + Number(r.plannedParticipantTotal || r.participant_total || 0), 0);
    const reached = details.reduce((s, r) => s + Number(r.reachedParticipantTotal || r.participant_total || 0), 0);
    const budget = details.reduce((s, r) => s + Number(r.approved_budget || 0), 0);
    const spent = details.reduce((s, r) => s + Number(r.actual_spent || 0), 0);
    const achievement = details.reduce((s, r) => s + Number(r.participant_performance_percent || 0), 0);
    const assessed = details.filter(r => r.overall_assessment).length;
    return { total: reports.length, pending, approved, returned, rejected, planned, reached, budget, spent, achievement: assessed ? Math.round(achievement / assessed) : pct(reached, planned), health: reports.length ? Math.round((approved / reports.length) * 100) : 0 };
  }, [reports, details]);

  const byProgramme = useMemo(() => {
    const map = new Map();
    details.forEach(r => {
      const key = r.programme || 'Unspecified';
      const row = map.get(key) || { name: key, reports: 0, participants: 0, budget: 0, spent: 0 };
      row.reports += 1;
      row.participants += Number(r.reachedParticipantTotal || r.participant_total || 0);
      row.budget += Number(r.approved_budget || 0);
      row.spent += Number(r.actual_spent || 0);
      map.set(key, row);
    });
    return [...map.values()].sort((a, b) => b.reports - a.reports).slice(0, 6);
  }, [details]);

  return <div className="admin-app"><Sidebar active={active} /><main className="admin-main">
    <header className="admin-header"><div><div className="admin-kicker">VSI ADMINISTRATION · MANAGEMENT INTELLIGENCE</div><h1>{title}</h1><p>{subtitle}</p></div><Link href="/admin/reports" className="header-action">Reports Inbox →</Link></header>
    {loading && <div className="admin-notice">Loading management intelligence…</div>}
    {error && <div className="admin-error">{error}</div>}
    {!loading && !error && <>
      <section className="stat-grid">
        <Card label="TOTAL REPORTS" value={stats.total} note="Active submitted reports" href="/admin/reports" />
        <Card label="PENDING REVIEW" value={stats.pending} note="Awaiting administrative decision" accent="yellow" href="/admin/reports?status=PENDING_REVIEW" />
        <Card label="APPROVED" value={stats.approved} note="Trusted verified reports" accent="green" href="/admin/reports?status=APPROVED" />
        <Card label="ORG HEALTH" value={`${stats.health}%`} note="Approved report coverage" accent="navy" />
      </section>

      <section className="dashboard-grid">
        <div className="dash-panel wide hero-panel"><div className="panel-head"><div><span>ACTIVITY REPORT INTELLIGENCE</span><h2>Organisation-wide reporting performance</h2></div><Link href="/admin/reports">Open register →</Link></div><div className="metric-grid"><div><small>Approved reach</small><strong>{stats.reached.toLocaleString()}</strong><span>participants</span></div><div><small>Target achievement</small><strong>{stats.achievement}%</strong><span>approved reports</span></div><div><small>Returned</small><strong>{stats.returned}</strong><span>require correction</span></div><div><small>Rejected</small><strong>{stats.rejected}</strong><span>not accepted</span></div></div></div>

        <div className="dash-panel"><div className="panel-head"><div><span>FINANCE INTELLIGENCE</span><h2>Approved activity finance</h2></div><Link href="/admin/finance">View →</Link></div><div className="big-number">{money(stats.spent)}</div><div className="bar"><i style={{ width: `${Math.min(100, pct(stats.spent, stats.budget))}%` }} /></div><div className="bar-label"><span>Budget utilisation</span><strong>{pct(stats.spent, stats.budget)}%</strong></div><div className="finance-row"><span>Approved budget</span><strong>{money(stats.budget)}</strong></div><div className="finance-row"><span>Balance / overspend</span><strong>{money(stats.budget - stats.spent)}</strong></div></div>

        <div className="dash-panel"><div className="panel-head"><div><span>MEAL INTELLIGENCE</span><h2>Organisational health</h2></div><Link href="/admin/meal">View →</Link></div><div className="health-ring"><strong>{stats.health}%</strong><span>approved<br />reports</span></div><p className="panel-copy">Health signal based on the proportion of active submitted reports that have completed administrative approval.</p></div>

        <div className="dash-panel wide"><div className="panel-head"><div><span>PROGRAMME PERFORMANCE</span><h2>Approved activity footprint</h2></div><Link href="/admin/meal">MEAL view →</Link></div>{byProgramme.length ? <div className="programme-list">{byProgramme.map(r => <div className="programme-row" key={r.name}><div><strong>{r.name}</strong><small>{r.reports} approved report{r.reports === 1 ? '' : 's'} · {r.participants.toLocaleString()} reached</small></div><div className="programme-finance"><strong>{money(r.spent)}</strong><small>{pct(r.spent, r.budget)}% budget used</small></div></div>)}</div> : <div className="empty">No approved reports yet. Finance and MEAL intelligence will populate as reports are approved.</div>}</div>
      </section>
    </>}
  </main><style jsx>{`
    .admin-app{min-height:100vh;background:#f4f7fa;color:#17212b;display:flex}.admin-sidebar{position:sticky;top:0;height:100vh;width:264px;flex:0 0 264px;background:linear-gradient(180deg,#003566 0%,#094074 58%,#082f52 100%);color:#fff;padding:22px 16px;display:flex;flex-direction:column;box-shadow:8px 0 24px rgba(0,53,102,.12)}.side-brand{display:flex;align-items:center;gap:11px;padding:4px 8px 25px;border-bottom:1px solid rgba(255,255,255,.14)}.side-brand img{width:66px;height:44px;object-fit:contain}.side-brand strong{display:block;font-size:17px;letter-spacing:.08em}.side-brand small{display:block;font-size:9px;letter-spacing:.16em;color:#ffd60a;margin-top:3px;font-weight:900}.side-label{font-size:10px;font-weight:900;letter-spacing:.16em;color:rgba(255,255,255,.58);padding:22px 10px 8px}.side-label.intelligence{padding-top:25px}.admin-sidebar nav{display:flex;flex-direction:column;gap:4px}.admin-sidebar nav a{color:rgba(255,255,255,.84);text-decoration:none;padding:11px 12px;border-radius:10px;font-size:13px;font-weight:800;display:flex;align-items:center;gap:10px;transition:.15s}.admin-sidebar nav a:hover{background:rgba(255,255,255,.09);color:#fff;transform:translateX(2px)}.admin-sidebar nav a.active{background:#ffc300;color:#003566;box-shadow:0 6px 16px rgba(0,0,0,.12)}.nav-dot{width:7px;height:7px;border-radius:50%;background:#3c6997;flex:0 0 7px}.intel-dot{background:#ffd60a}.active .nav-dot{background:#003566}.side-note{font-size:11px;line-height:1.6;color:rgba(255,255,255,.68);padding:18px 10px 0}.back-report{margin-top:auto;text-decoration:none;color:#003566;background:#ffd60a;border-radius:10px;padding:11px 12px;text-align:center;font-size:12px;font-weight:900}.admin-main{min-width:0;flex:1;padding:30px clamp(20px,4vw,46px) 60px}.admin-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:28px}.admin-kicker{font-size:11px;letter-spacing:.14em;color:#3c6997;font-weight:900;margin-bottom:8px}.admin-header h1{margin:0;color:#003566;font-size:clamp(27px,3vw,38px);letter-spacing:-.03em}.admin-header p{margin:8px 0 0;color:#65717d;max-width:760px;line-height:1.6;font-size:14px}.header-action,.panel-head a{white-space:nowrap;text-decoration:none;color:#094074;font-size:11px;font-weight:900}.header-action{border:1px solid #dfe5ea;background:#fff;border-radius:10px;padding:11px 14px;font-size:12px}.stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:18px}.stat-link{display:block;text-decoration:none;color:inherit}.stat-card{background:#fff;border:1px solid #dfe5ea;border-radius:14px;padding:18px;box-shadow:0 4px 18px rgba(0,53,102,.045);border-top:4px solid #3c6997;transition:transform .15s,box-shadow .15s}.stat-link:hover .stat-card{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,53,102,.09)}.stat-card.yellow{border-top-color:#ffc300}.stat-card.green{border-top-color:#2e7d52}.stat-card.navy{border-top-color:#003566}.stat-card span{display:block;font-size:10px;letter-spacing:.13em;color:#65717d;font-weight:900}.stat-card strong{display:block;color:#003566;font-size:29px;margin:7px 0 3px}.stat-card small{color:#65717d;font-size:11px}.dashboard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.dash-panel{background:#fff;border:1px solid #dfe5ea;border-radius:15px;padding:22px;box-shadow:0 4px 18px rgba(0,53,102,.045);min-width:0}.dash-panel.wide{grid-column:span 2}.hero-panel{border-top:4px solid #003566}.panel-head{display:flex;justify-content:space-between;gap:15px;align-items:flex-start;margin-bottom:20px}.panel-head span{font-size:10px;letter-spacing:.13em;color:#3c6997;font-weight:900}.panel-head h2{margin:5px 0 0;color:#003566;font-size:18px}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.metric-grid>div{background:#f6f9fb;border-radius:10px;padding:14px}.metric-grid small{display:block;color:#65717d;font-size:11px}.metric-grid strong{display:block;color:#003566;font-size:24px;margin:5px 0}.metric-grid span{color:#65717d;font-size:10px}.big-number{font-size:31px;color:#003566;font-weight:900;margin:5px 0 16px}.bar{height:9px;background:#e9eef2;border-radius:99px;overflow:hidden}.bar i{display:block;height:100%;background:#ffc300;border-radius:99px}.bar-label{display:flex;justify-content:space-between;margin:8px 0 18px;font-size:11px;color:#65717d}.bar-label strong{color:#003566}.finance-row{display:flex;justify-content:space-between;border-top:1px solid #dfe5ea;padding:10px 0;font-size:12px;color:#65717d}.finance-row strong{color:#003566}.health-ring{width:118px;height:118px;border-radius:50%;margin:3px auto 15px;background:conic-gradient(#ffc300 ${stats.health}%,#e8edf1 0);display:grid;place-content:center;text-align:center;position:relative}.health-ring:after{content:'';position:absolute;inset:9px;background:#fff;border-radius:50%}.health-ring strong,.health-ring span{position:relative;z-index:1}.health-ring strong{font-size:26px;color:#003566}.health-ring span{font-size:9px;color:#65717d;text-transform:uppercase;letter-spacing:.08em}.panel-copy{text-align:center;color:#65717d;font-size:12px;line-height:1.55;max-width:330px;margin:auto}.programme-list{display:flex;flex-direction:column}.programme-row{display:flex;justify-content:space-between;gap:20px;padding:13px 0;border-top:1px solid #dfe5ea}.programme-row>div:first-child{min-width:0}.programme-row strong{display:block;color:#003566;font-size:13px}.programme-row small{display:block;color:#65717d;font-size:10px;margin-top:3px}.programme-finance{text-align:right}.empty,.admin-notice,.admin-error{padding:16px;border-radius:10px;font-size:13px}.empty,.admin-notice{background:#f5f8fa;color:#65717d}.admin-error{background:#fff0f0;border:1px solid #efb6b6;color:#9a2525;margin-bottom:18px}@media(max-width:1000px){.admin-sidebar{width:220px;flex-basis:220px}.stat-grid{grid-template-columns:repeat(2,1fr)}.metric-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.admin-app{display:block}.admin-sidebar{position:relative;width:100%;height:auto;padding:12px}.side-brand{padding-bottom:12px}.admin-sidebar nav{display:grid;grid-template-columns:repeat(2,1fr)}.side-label,.side-note,.back-report{display:none}.admin-main{padding:22px 14px 40px}.admin-header{display:block}.header-action{display:inline-block;margin-top:15px}.dashboard-grid{grid-template-columns:1fr}.dash-panel.wide{grid-column:auto}.stat-grid{grid-template-columns:repeat(2,1fr)}.metric-grid{grid-template-columns:repeat(2,1fr)}}
  `}</style></div>;
}
