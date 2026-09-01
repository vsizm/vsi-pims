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
    <div className="side-brand"><div className="side-logo-wrap"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" /></div></div>
    <div className="side-label">WORKSPACE</div>
    <nav>{NAV.slice(0, 4).map(([label, href]) => <Link key={label} href={href} className={active === label ? 'active' : ''}><span className="nav-dot" />{label}</Link>)}</nav>
    <div className="side-label intelligence">INTELLIGENCE</div>
    <nav>{NAV.slice(4).map(([label, href]) => <Link key={label} href={href} className={active === label ? 'active' : ''}><span className="nav-dot intel-dot" />{label}</Link>)}</nav>
    <div className="side-note">Approved reports are the trusted layer for organisational performance, finance and MEAL intelligence.</div>
    <Link className="back-report" href="/activity-report">Open Activity Report ↗</Link>
  </aside>;
}

export default function AdminDashboard({ active = 'Dashboard', title = 'Executive Dashboard', subtitle = 'A concise organisation-wide view of reporting, programme reach, finance and MEAL performance.' }) {
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
    const planned = details.reduce((s, r) => s + Number(r.planned_participant_total ?? r.plannedParticipantTotal ?? r.participant_total ?? 0), 0);
    const reached = details.reduce((s, r) => s + Number(r.reached_participant_total ?? r.reachedParticipantTotal ?? r.participant_total ?? 0), 0);
    const budget = details.reduce((s, r) => s + Number(r.approved_budget ?? 0), 0);
    const spent = details.reduce((s, r) => s + Number(r.actual_spent ?? 0), 0);
    const achievementValues = details.map(r => Number(r.participant_performance_percent ?? r.participantPerformancePercent ?? 0)).filter(v => v > 0);
    const achievement = achievementValues.length ? Math.round(achievementValues.reduce((s, v) => s + v, 0) / achievementValues.length) : pct(reached, planned);
    return { total: reports.length, pending, approved, returned, rejected, planned, reached, budget, spent, achievement, health: reports.length ? Math.round((approved / reports.length) * 100) : 0 };
  }, [reports, details]);

  const byProgramme = useMemo(() => {
    const map = new Map();
    details.forEach(r => {
      const key = r.programme || 'Unspecified';
      const row = map.get(key) || { name: key, reports: 0, participants: 0, budget: 0, spent: 0 };
      row.reports += 1;
      row.participants += Number(r.reached_participant_total ?? r.reachedParticipantTotal ?? r.participant_total ?? 0);
      row.budget += Number(r.approved_budget ?? 0);
      row.spent += Number(r.actual_spent ?? 0);
      map.set(key, row);
    });
    return [...map.values()].sort((a, b) => b.reports - a.reports).slice(0, 6);
  }, [details]);

  return <div className="admin-app"><Sidebar active={active} /><main className="admin-main">
    <header className="admin-header"><div><div className="admin-kicker">VSI · EXECUTIVE MANAGEMENT</div><h1>{title}</h1><p>{subtitle}</p></div><Link href="/admin/reports" className="header-action">Open Reports Inbox →</Link></header>
    {loading && <div className="admin-notice">Loading executive intelligence…</div>}
    {error && <div className="admin-error">{error}</div>}
    {!loading && !error && <>
      <section className="stat-grid">
        <Card label="TOTAL REPORTS" value={stats.total} note="Submitted activity reports" href="/admin/reports" />
        <Card label="PENDING REVIEW" value={stats.pending} note="Require executive or administrative action" accent="yellow" href="/admin/reports?status=PENDING_REVIEW" />
        <Card label="APPROVED" value={stats.approved} note="Verified reports feeding intelligence" accent="green" href="/admin/reports?status=APPROVED" />
        <Card label="REPORTING HEALTH" value={`${stats.health}%`} note="Approved share of submitted reports" accent="navy" />
      </section>

      <section className="dashboard-grid">
        <div className="dash-panel wide hero-panel"><div className="panel-head"><div><span>EXECUTIVE PERFORMANCE</span><h2>Organisation-wide reporting snapshot</h2></div><Link href="/admin/reports">Open register →</Link></div><div className="metric-grid"><div><small>Approved reach</small><strong>{stats.reached.toLocaleString()}</strong><span>participants</span></div><div><small>Target achievement</small><strong>{stats.achievement}%</strong><span>approved reports</span></div><div><small>Returned</small><strong>{stats.returned}</strong><span>require correction</span></div><div><small>Rejected</small><strong>{stats.rejected}</strong><span>not accepted</span></div></div></div>

        <div className="dash-panel"><div className="panel-head"><div><span>FINANCE INTELLIGENCE</span><h2>Approved activity finance</h2></div><Link href="/admin/finance">View →</Link></div><div className="big-number">{money(stats.spent)}</div><div className="bar"><i style={{ width: `${Math.min(100, pct(stats.spent, stats.budget))}%` }} /></div><div className="bar-label"><span>Budget utilisation</span><strong>{pct(stats.spent, stats.budget)}%</strong></div><div className="finance-row"><span>Approved budget</span><strong>{money(stats.budget)}</strong></div><div className="finance-row"><span>Balance / overspend</span><strong>{money(stats.budget - stats.spent)}</strong></div></div>

        <div className="dash-panel"><div className="panel-head"><div><span>MEAL INTELLIGENCE</span><h2>Organisational health</h2></div><Link href="/admin/meal">View →</Link></div><div className="health-ring"><strong>{stats.health}%</strong><span>approved<br />reports</span></div><p className="panel-copy">Health signal based on the proportion of submitted reports that have completed administrative approval.</p></div>

        <div className="dash-panel wide"><div className="panel-head"><div><span>PROGRAMME PERFORMANCE</span><h2>Approved activity footprint</h2></div><Link href="/admin/meal">MEAL view →</Link></div>{byProgramme.length ? <div className="programme-list">{byProgramme.map(r => <div className="programme-row" key={r.name}><div><strong>{r.name}</strong><small>{r.reports} approved report{r.reports === 1 ? '' : 's'} · {r.participants.toLocaleString()} reached</small></div><div className="programme-finance"><strong>{money(r.spent)}</strong><small>{pct(r.spent, r.budget)}% budget used</small></div></div>)}</div> : <div className="empty">No approved reports yet. Finance and MEAL intelligence will populate as reports are approved.</div>}</div>
      </section>
    </>}
  </main><style jsx>{`
    .admin-app{min-height:100vh;background:#f4f7fa;color:#17212b;display:flex;overflow-x:hidden;box-sizing:border-box}.admin-app *{box-sizing:border-box}.admin-sidebar{position:sticky;top:0;height:100vh;width:250px;min-width:250px;max-width:250px;flex:0 0 250px;overflow:hidden;background:linear-gradient(180deg,#003566 0%,#094074 58%,#082f52 100%);color:#fff;padding:20px 14px;display:flex;flex-direction:column;box-shadow:8px 0 24px rgba(0,53,102,.12)}.side-brand{width:100%;min-width:0;display:flex;align-items:center;justify-content:center;padding:4px 8px 22px;border-bottom:1px solid rgba(255,255,255,.14)}.side-logo-wrap{width:100%;height:52px;display:flex;align-items:center;justify-content:center;overflow:hidden}.side-brand img{display:block;width:auto!important;height:48px!important;max-width:205px!important;max-height:48px!important;object-fit:contain;object-position:center}.side-label{font-size:10px;font-weight:900;letter-spacing:.16em;color:rgba(255,255,255,.58);padding:20px 10px 8px}.side-label.intelligence{padding-top:22px}.admin-sidebar nav{display:flex;flex-direction:column;gap:3px;min-width:0}.admin-sidebar nav a{min-width:0;color:rgba(255,255,255,.84);text-decoration:none;padding:10px 11px;border-radius:9px;font-size:12px;font-weight:800;display:flex;align-items:center;gap:9px;white-space:nowrap;overflow:hidden;transition:.15s}.admin-sidebar nav a:hover{background:rgba(255,255,255,.09);color:#fff;transform:translateX(2px)}.admin-sidebar nav a.active{background:#ffc300;color:#003566;box-shadow:0 6px 16px rgba(0,0,0,.12)}.nav-dot{width:7px;height:7px;border-radius:50%;background:#3c6997;flex:0 0 7px}.intel-dot{background:#ffd60a}.active .nav-dot{background:#003566}.side-note{font-size:10px;line-height:1.55;color:rgba(255,255,255,.66);padding:16px 10px 0;overflow:hidden}.back-report{margin-top:auto;text-decoration:none;color:#003566;background:#ffd60a;border-radius:9px;padding:10px 11px;text-align:center;font-size:11px;font-weight:900;white-space:nowrap;overflow:hidden}.admin-main{min-width:0;max-width:100%;flex:1;padding:30px clamp(20px,3.5vw,46px) 58px;overflow:hidden}.admin-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:28px;min-width:0}.admin-header>div{min-width:0}.admin-kicker{font-size:10px;letter-spacing:.16em;color:#3c6997;font-weight:900;margin-bottom:8px}.admin-header h1{margin:0;color:#003566;font-size:clamp(28px,3vw,40px);letter-spacing:-.035em}.admin-header p{margin:8px 0 0;color:#65717d;max-width:760px;line-height:1.55;font-size:13px}.header-action,.panel-head a{white-space:nowrap;text-decoration:none;color:#094074;font-size:11px;font-weight:900}.header-action{border:1px solid #dfe5ea;background:#fff;border-radius:10px;padding:11px 14px;font-size:11px;box-shadow:0 3px 12px rgba(0,53,102,.04)}.stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px;min-width:0}.stat-link{display:block;min-width:0;text-decoration:none;color:inherit}.stat-card{min-width:0;background:#fff;border:1px solid #dfe5ea;border-radius:14px;padding:17px;box-shadow:0 4px 18px rgba(0,53,102,.045);border-top:4px solid #3c6997;transition:.15s}.stat-link:hover .stat-card{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,53,102,.09)}.stat-card.yellow{border-top-color:#ffc300}.stat-card.green{border-top-color:#2e7d52}.stat-card.navy{border-top-color:#003566}.stat-card span{display:block;font-size:9px;letter-spacing:.13em;color:#65717d;font-weight:900}.stat-card strong{display:block;color:#003566;font-size:28px;margin:7px 0 4px}.stat-card small{color:#65717d;font-size:10px;line-height:1.4}.dashboard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;min-width:0}.dash-panel{background:#fff;border:1px solid #dfe5ea;border-radius:14px;padding:21px;box-shadow:0 4px 18px rgba(0,53,102,.045);min-width:0;overflow:hidden}.dash-panel.wide{grid-column:span 2}.hero-panel{border-top:4px solid #003566;background:linear-gradient(180deg,#fff 0%,#fbfcfd 100%)}.panel-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:18px;min-width:0}.panel-head>div{min-width:0}.panel-head span{font-size:9px;letter-spacing:.13em;color:#3c6997;font-weight:900}.panel-head h2{margin:4px 0 0;color:#003566;font-size:17px;letter-spacing:-.015em}.metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;min-width:0}.metric-grid>div{background:#f6f9fb;border:1px solid #edf1f4;border-radius:10px;padding:13px;min-width:0}.metric-grid small{display:block;color:#65717d;font-size:10px}.metric-grid strong{display:block;color:#003566;font-size:23px;margin:4px 0}.metric-grid span{color:#65717d;font-size:9px}.big-number{font-size:30px;color:#003566;font-weight:900;margin:4px 0 14px;letter-spacing:-.02em}.bar{height:8px;background:#e9eef2;border-radius:99px;overflow:hidden}.bar i{display:block;height:100%;background:#ffc300;border-radius:99px}.bar-label{display:flex;justify-content:space-between;gap:10px;margin:7px 0 16px;font-size:10px;color:#65717d}.bar-label strong{color:#003566}.finance-row{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #dfe5ea;padding:9px 0;font-size:11px;color:#65717d}.finance-row strong{color:#003566}.health-ring{width:116px;height:116px;border-radius:50%;margin:2px auto 14px;background:conic-gradient(#ffc300 ${stats.health}%,#e8edf1 0);display:grid;place-content:center;text-align:center;position:relative}.health-ring:after{content:'';position:absolute;inset:9px;background:#fff;border-radius:50%}.health-ring strong,.health-ring span{position:relative;z-index:1}.health-ring strong{font-size:26px;color:#003566}.health-ring span{font-size:8px;color:#65717d;text-transform:uppercase;letter-spacing:.08em}.panel-copy{text-align:center;color:#65717d;font-size:11px;line-height:1.5;max-width:330px;margin:auto}.programme-list{display:flex;flex-direction:column;min-width:0}.programme-row{display:flex;justify-content:space-between;gap:18px;padding:12px 0;border-top:1px solid #dfe5ea;min-width:0}.programme-row>div:first-child{min-width:0}.programme-row strong{display:block;color:#003566;font-size:12px}.programme-row small{display:block;color:#65717d;font-size:9px;margin-top:3px}.programme-finance{text-align:right;flex:0 0 auto}.empty,.admin-notice,.admin-error{padding:14px;border-radius:9px;font-size:12px}.empty,.admin-notice{background:#f5f8fa;color:#65717d}.admin-error{background:#fff0f0;border:1px solid #efb6b6;color:#9a2525;margin-bottom:16px}@media(max-width:1050px){.admin-sidebar{width:225px;min-width:225px;flex-basis:225px}.stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.admin-app{display:block}.admin-sidebar{position:relative;width:100%;min-width:0;max-width:none;height:auto;padding:10px;overflow:visible}.side-brand{padding-bottom:11px}.side-logo-wrap{height:42px}.side-brand img{height:39px!important;max-height:39px!important}.admin-sidebar nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.side-label,.side-note,.back-report{display:none}.admin-main{padding:20px 13px 36px;overflow:visible}.admin-header{display:block}.header-action{display:inline-block;margin-top:13px}.dashboard-grid{grid-template-columns:1fr}.dash-panel.wide{grid-column:auto}.stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:430px){.stat-grid,.metric-grid{grid-template-columns:1fr}.admin-sidebar nav{grid-template-columns:1fr}.panel-head{display:block}.panel-head a{display:inline-block;margin-top:8px}.programme-row{display:block}.programme-finance{text-align:left;margin-top:8px}.admin-header h1{font-size:28px}}
  `}</style></div>;
}
