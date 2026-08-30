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

function unique(values) { return [...new Set(values.filter(Boolean))]; }

export default function GeographyIntelligencePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [province, setProvince] = useState('All');

  useEffect(() => {
    fetch('/api/admin/activity-reports/intelligence', { cache: 'no-store' })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Unable to load geographic intelligence.'); setReports(d.reports || []); })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const provinces = useMemo(() => ['All', ...unique(reports.map(r => r.province))], [reports]);
  const rows = useMemo(() => province === 'All' ? reports : reports.filter(r => r.province === province), [reports, province]);
  const geo = useMemo(() => {
    const count = key => unique(rows.map(r => r[key])).length;
    return { provinces: count('province'), districts: count('district'), constituencies: count('constituency'), wards: count('ward_community'), participants: rows.reduce((n,r) => n + Number(r.participant_total || 0), 0) };
  }, [rows]);

  const provinceBreakdown = useMemo(() => unique(rows.map(r => r.province)).map(p => {
    const items = rows.filter(r => r.province === p);
    return { name:p, activities:items.length, participants:items.reduce((n,r)=>n+Number(r.participant_total||0),0), districts:unique(items.map(r=>r.district)).length };
  }).sort((a,b)=>b.activities-a.activities), [rows]);

  return <div className="geo-app">
    <aside className="admin-sidebar">
      <div className="side-brand"><div className="side-logo-wrap"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" /></div><div><strong>VSI IMS</strong><small>ADMINISTRATION</small></div></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{nav.slice(0,4).map(([label,href])=><Link key={label} href={href} className={label==='Activity Reports'?'active':''}><span className="nav-dot"/>{label}</Link>)}</nav>
      <div className="side-label">INTELLIGENCE</div>
      <nav>{nav.slice(4).map(([label,href])=><Link key={label} href={href}><span className="nav-dot intel-dot"/>{label}</Link>)}</nav>
      <div className="side-note">Geographic intelligence is derived from submitted activity reports and does not alter the reporting workflow.</div>
      <Link className="back-report" href="/admin/reports/intelligence">← Activity Intelligence</Link>
    </aside>

    <main className="main">
      <header className="header"><div><div className="kicker">VSI ADMINISTRATION · PHASE 02 · GEOGRAPHIC INTELLIGENCE</div><h1>Delivery Footprint</h1><p>Where VSI activities are being delivered, from Province to Ward.</p></div><Link className="action" href="/admin/reports/intelligence">Activity Intelligence →</Link></header>

      <section className="hero"><strong>Geographic operational view</strong><span>Use the reporting record to understand coverage, reach and activity concentration without changing the approved report workflow.</span></section>

      <section className="stats">
        <div><span>PROVINCES</span><b>{geo.provinces}</b><small>In current view</small></div>
        <div><span>DISTRICTS</span><b>{geo.districts}</b><small>Distinct districts</small></div>
        <div><span>CONSTITUENCIES</span><b>{geo.constituencies}</b><small>Distinct constituencies</small></div>
        <div><span>WARDS / COMMUNITIES</span><b>{geo.wards}</b><small>Distinct delivery areas</small></div>
        <div><span>PARTICIPANT REACH</span><b>{geo.participants.toLocaleString()}</b><small>Reported participants</small></div>
      </section>

      <section className="panel"><div className="panel-head"><div><div className="section-kicker">01 · COVERAGE</div><h2>Geographic coverage by province</h2><p>Activity count, participant reach and district spread.</p></div><select value={province} onChange={e=>setProvince(e.target.value)} aria-label="Filter province">{provinces.map(p=><option key={p}>{p}</option>)}</select></div>
        {loading && <div className="empty">Loading geographic intelligence…</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && <div className="breakdown">{provinceBreakdown.map(x=><div className="bar-row" key={x.name}><div className="bar-label"><strong>{x.name}</strong><span>{x.activities} activit{x.activities===1?'y':'ies'} · {x.districts} district{x.districts===1?'':'s'} · {x.participants.toLocaleString()} participants</span></div><div className="track"><i style={{width:`${Math.max(4,(x.activities / Math.max(1, rows.length))*100)}%`}}/></div></div>)}{provinceBreakdown.length===0&&<div className="empty">No geographic records are available in this view.</div>}</div>}
      </section>

      <section className="panel"><div className="panel-head"><div><div className="section-kicker">02 · DELIVERY LOCATIONS</div><h2>Activity-level geographic register</h2><p>Province → District → Constituency → Ward / Community → Venue.</p></div></div>
        {!loading && !error && <div className="table-wrap"><table><thead><tr><th>Activity</th><th>Province</th><th>District</th><th>Constituency</th><th>Ward / Community</th><th>Venue</th><th>Reach</th></tr></thead><tbody>{rows.map(r=><tr key={r.reference}><td><strong>{r.activity_title || 'Untitled activity'}</strong><small>{r.reference}</small></td><td>{r.province||'—'}</td><td>{r.district||'—'}</td><td>{r.constituency||'—'}</td><td>{r.ward_community||'—'}</td><td>{r.venue||'—'}</td><td><strong>{Number(r.participant_total||0).toLocaleString()}</strong></td></tr>)}{rows.length===0&&<tr><td colSpan="7" className="empty-cell">No activities found.</td></tr>}</tbody></table></div>}
      </section>

      <section className="panel note"><div><div className="section-kicker">03 · DATA GOVERNANCE</div><h2>Authoritative source</h2><p>This view reads the existing activity-report record. Review, approval, return, rejection, submission and soft-delete behaviour remain unchanged.</p></div></section>
    </main>

    <style jsx>{`
      .geo-app{min-height:100vh;display:flex;background:#f4f7fa;color:#17212b;overflow-x:hidden}.admin-sidebar{position:sticky;top:0;width:250px;flex:0 0 250px;height:100vh;box-sizing:border-box;background:linear-gradient(180deg,#003566,#094074 58%,#082f52);color:#fff;padding:20px 14px;display:flex;flex-direction:column;box-shadow:8px 0 24px rgba(0,53,102,.12)}.side-brand{display:flex;align-items:center;gap:10px;padding:4px 8px 20px;border-bottom:1px solid rgba(255,255,255,.14)}.side-logo-wrap{width:48px;height:34px;flex:0 0 48px;display:flex;align-items:center;justify-content:center;overflow:hidden}.side-brand img{max-width:48px;max-height:30px;width:auto;height:auto;object-fit:contain;display:block}.side-brand strong{display:block;font-size:16px;line-height:1.2;letter-spacing:.07em}.side-brand small{display:block;font-size:9px;letter-spacing:.14em;color:#ffd60a;margin-top:3px;font-weight:900}.side-label{font-size:10px;font-weight:900;letter-spacing:.16em;color:rgba(255,255,255,.58);padding:20px 10px 8px}.admin-sidebar nav{display:flex;flex-direction:column;gap:3px}.admin-sidebar nav a{display:flex;align-items:center;gap:9px;color:rgba(255,255,255,.84);text-decoration:none;padding:10px 11px;border-radius:9px;font-size:12px;font-weight:800;white-space:nowrap;overflow:hidden}.admin-sidebar nav a.active{background:#ffc300;color:#003566}.nav-dot{width:7px;height:7px;border-radius:50%;background:#3c6997;flex:0 0 7px}.intel-dot{background:#ffd60a}.active .nav-dot{background:#003566}.side-note{font-size:10px;line-height:1.55;color:rgba(255,255,255,.64);padding:15px 10px 0}.back-report{margin-top:auto;text-align:center;background:#ffd60a;color:#003566;text-decoration:none;border-radius:9px;padding:10px 11px;font-size:11px;font-weight:900}.main{min-width:0;flex:1;padding:28px clamp(18px,3.5vw,42px) 55px;box-sizing:border-box}.header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:18px}.kicker,.section-kicker{font-size:10px;letter-spacing:.13em;color:#3c6997;font-weight:900}.header h1{margin:6px 0 0;color:#003566;font-size:clamp(28px,3vw,38px);line-height:1.05;letter-spacing:-.03em}.header p{margin:8px 0;color:#65717d;font-size:13px}.action{background:#fff;border:1px solid #dfe5ea;border-radius:9px;padding:9px 13px;color:#003566;text-decoration:none;font-size:11px;font-weight:900;white-space:nowrap}.hero{display:flex;gap:12px;align-items:center;background:#003566;color:#fff;border-radius:12px;padding:14px 17px;margin-bottom:14px}.hero strong{font-size:12px;white-space:nowrap}.hero span{font-size:11px;color:rgba(255,255,255,.78)}.stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:16px}.stats>div{background:#fff;border:1px solid #dfe5ea;border-top:3px solid #3c6997;border-radius:11px;padding:13px;min-width:0}.stats span{display:block;color:#65717d;font-size:8px;font-weight:900;letter-spacing:.08em}.stats b{display:block;color:#003566;font-size:25px;margin:6px 0}.stats small{color:#65717d;font-size:10px}.panel{background:#fff;border:1px solid #dfe5ea;border-radius:14px;margin-bottom:16px;overflow:hidden;box-shadow:0 4px 18px rgba(0,53,102,.045)}.panel-head{padding:16px 19px;border-bottom:1px solid #e7edf1;display:flex;justify-content:space-between;gap:15px;align-items:flex-start}.panel-head h2{margin:4px 0;color:#003566;font-size:18px}.panel-head p{margin:4px 0;color:#65717d;font-size:11px;line-height:1.5}.panel-head select{height:36px;border:1px solid #cbd5e1;border-radius:8px;padding:7px 10px;background:#fff;font-size:11px;color:#17212b}.breakdown{padding:18px 20px}.bar-row{margin-bottom:18px}.bar-row:last-child{margin-bottom:0}.bar-label{display:flex;justify-content:space-between;gap:15px;margin-bottom:7px}.bar-label strong{font-size:11px;color:#17212b}.bar-label span{font-size:9px;color:#65717d;text-align:right}.track{height:9px;background:#e8edf2;border-radius:999px;overflow:hidden}.track i{display:block;height:100%;background:#ffc300;border-radius:999px}.table-wrap{overflow:auto}table{width:100%;min-width:900px;border-collapse:collapse;table-layout:fixed}th{background:#f4f7fa;color:#52606d;text-transform:uppercase;font-size:8px;letter-spacing:.05em;text-align:left;padding:10px;border-bottom:1px solid #dfe5ea}td{padding:11px 10px;border-bottom:1px solid #e7edf1;font-size:10px;vertical-align:top;overflow-wrap:anywhere}td strong{display:block;color:#17212b}td small{display:block;color:#7a8793;margin-top:3px}.empty,.error{padding:24px 18px;color:#65717d;font-size:12px}.error{color:#b42318}.empty-cell{text-align:center;color:#65717d;padding:28px}.note .panel-head{border-bottom:0}.note>div{padding:16px 19px}.note h2{margin:4px 0;color:#003566;font-size:18px}.note p{margin:5px 0;color:#65717d;font-size:11px;line-height:1.55}@media(max-width:1000px){.stats{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.geo-app{display:block}.admin-sidebar{position:relative;width:100%;height:auto;min-height:0;flex-basis:auto}.header{flex-direction:column}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.hero{align-items:flex-start;flex-direction:column}.panel-head{flex-direction:column}.panel-head select{width:100%}}
    `}</style>
  </div>;
}
