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

const num = (v) => Number(v ?? 0) || 0;
const first = (o, keys, fallback = '') => keys.map(k => o?.[k]).find(v => v !== undefined && v !== null && v !== '') ?? fallback;
const json = (v, fallback = {}) => { if (!v) return fallback; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return fallback; } };
const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;

function Sidebar() {
  return <aside className="admin-sidebar">
    <div className="side-brand"><div className="side-logo-wrap"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" /></div><div><strong>VSI IMS</strong><small>ADMINISTRATION</small></div></div>
    <div className="side-label">WORKSPACE</div>
    <nav>{NAV.slice(0,4).map(([label,href]) => <Link key={label} href={href}><span className="nav-dot" />{label}</Link>)}</nav>
    <div className="side-label intelligence">INTELLIGENCE</div>
    <nav>{NAV.slice(4).map(([label,href]) => <Link key={label} href={href} className={label === 'MEAL Intelligence' ? 'active' : ''}><span className="nav-dot intel-dot" />{label}</Link>)}</nav>
    <div className="side-note">Approved reports are the trusted layer for organisational performance, finance and MEAL intelligence.</div>
    <Link className="back-report" href="/activity-report">Open Activity Report ↗</Link>
  </aside>;
}

function breakdown(report) {
  const a = json(report.attachments, []);
  const b = a.find(x => x?.category === 'participant-breakdown')?.breakdown || {};
  const r = k => num(b[`reached${k}`]);
  return {
    children: r('MaleChildren') + r('FemaleChildren'),
    youth: r('MaleYouth') + r('FemaleYouth'),
    adult: r('MaleAdult') + r('FemaleAdult'),
    male: r('MaleChildren') + r('MaleYouth') + r('MaleAdult'),
    female: r('FemaleChildren') + r('FemaleYouth') + r('FemaleAdult'),
    pwdMale: r('PwdMaleChildren') + r('PwdMaleYouth') + r('PwdMaleAdult'),
    pwdFemale: r('PwdFemaleChildren') + r('PwdFemaleYouth') + r('PwdFemaleAdult'),
  };
}

function strings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach(v => strings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(v => strings(v, out));
  return out;
}

export default function Phase4Dashboard() {
  const [reports,setReports] = useState([]), [details,setDetails] = useState([]), [loading,setLoading] = useState(true), [error,setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/activity-reports',{cache:'no-store'}); const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load MEAL intelligence.');
        const list = data.reports || [];
        const full = await Promise.all(list.filter(r => r.review_status === 'APPROVED').map(async r => {
          try { const d = await fetch(`/api/admin/activity-reports/${encodeURIComponent(r.reference)}`,{cache:'no-store'}); const x=await d.json(); return x.report || r; } catch { return r; }
        }));
        if (!cancelled) { setReports(list); setDetails(full); }
      } catch(e) { if (!cancelled) setError(e.message); } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  },[]);

  const stats = useMemo(() => {
    const reached = details.reduce((s,r)=>s+num(first(r,['reached_participant_total','participant_total','participants_reached'])),0);
    const planned = details.reduce((s,r)=>s+num(first(r,['planned_participant_total','participant_target','target_participants'])),0);
    const assessments = details.map(r => num(r.assessment_score)).filter(v=>v>0);
    const implemented = details.filter(r=>String(r.implementation_status||'').toLowerCase().includes('fully')).length;
    const partial = details.filter(r=>String(r.implementation_status||'').toLowerCase().includes('partial')).length;
    const notImplemented = details.filter(r=>String(r.implementation_status||'').toLowerCase().includes('not implemented')).length;
    const concerns = details.flatMap(r=>strings(r.safeguarding_status)).filter(s=>/concern identified|requires follow/i.test(s)).length;
    const evidence = details.filter(r=>r.results_evidence || r.evidence_uploaded).length;
    const outcomes = details.filter(r=>r.immediate_outcomes || r.notable_achievements).length;
    return { reached, planned, achievement:pct(reached,planned), assessment:assessments.length?Math.round(assessments.reduce((a,b)=>a+b,0)/assessments.length):0, implemented, partial, notImplemented, concerns, evidence, outcomes };
  },[details]);

  const demo = useMemo(()=>details.reduce((t,r)=>{ const b=breakdown(r); Object.keys(t).forEach(k=>t[k]+=b[k]); return t; },{children:0,youth:0,adult:0,male:0,female:0,pwdMale:0,pwdFemale:0}),[details]);

  const programmes = useMemo(()=>{ const m=new Map(); details.forEach(r=>{const p=first(r,['programme','programme_name','programmeName'],'Unspecified'); const x=m.get(p)||{name:p,reports:0,reached:0}; x.reports++; x.reached+=num(first(r,['reached_participant_total','participant_total','participants_reached'])); m.set(p,x);}); return [...m.values()].sort((a,b)=>b.reached-a.reached);},[details]);

  return <div className="phase1-app"><Sidebar/><main className="phase1-main">
    <header className="phase1-header"><div><div className="phase1-kicker">VSI ADMINISTRATION · MEAL INTELLIGENCE</div><h1>MEAL Intelligence</h1><p>Monitoring, evaluation, accountability and learning signals derived from approved activity reports.</p></div><Link href="/admin/reports?status=APPROVED" className="phase1-action">Approved Reports →</Link></header>
    {loading && <div className="phase1-message">Loading live MEAL intelligence…</div>}
    {error && <div className="phase1-message error">{error}</div>}
    {!loading && !error && <>
      <section className="phase1-kpis">
        <div><span>Approved Reports</span><strong>{details.length}</strong><small>Trusted MEAL dataset</small></div>
        <div><span>Reach</span><strong>{stats.reached.toLocaleString()}</strong><small>Participants reached</small></div>
        <div><span>Target Achievement</span><strong>{stats.planned?`${stats.achievement}%`:'—'}</strong><small>Approved activities</small></div>
        <div><span>Outcome Coverage</span><strong>{details.length?`${Math.round(stats.outcomes/details.length*100)}%`:'0%'}</strong><small>Reports with outcomes</small></div>
        <div><span>Evidence Coverage</span><strong>{details.length?`${Math.round(stats.evidence/details.length*100)}%`:'0%'}</strong><small>Reports with evidence</small></div>
      </section>
      <section className="phase1-grid">
        <article className="phase1-card wide"><div className="phase1-card-head"><div><span>SECTION 05 · PARTICIPANTS & ATTENDANCE</span><h2>Disaggregated demographic reach</h2></div></div><div className="phase1-metrics"><div><small>Children</small><strong>{demo.children.toLocaleString()}</strong><em>reached</em></div><div><small>Youth</small><strong>{demo.youth.toLocaleString()}</strong><em>reached</em></div><div><small>Adults</small><strong>{demo.adult.toLocaleString()}</strong><em>reached</em></div><div><small>PWD</small><strong>{(demo.pwdMale+demo.pwdFemale).toLocaleString()}</strong><em>{demo.pwdMale} male · {demo.pwdFemale} female</em></div></div><div className="phase1-footprint" style={{marginTop:10}}><div><strong>Male</strong><span>All age groups</span><b>{demo.male.toLocaleString()} reached</b></div><div><strong>Female</strong><span>All age groups</span><b>{demo.female.toLocaleString()} reached</b></div></div></article>
        <article className="phase1-card"><div className="phase1-card-head"><div><span>RESULTS & OUTCOMES</span><h2>Evidence of change</h2></div></div><div className="alert-grid"><div className="alert"><strong>{stats.outcomes}</strong><small>Reports with outcomes</small></div><div className="alert"><strong>{stats.evidence}</strong><small>Reports with evidence</small></div></div><p className="phase1-safe">Outcome and evidence coverage are calculated from approved Section 08 and Section 11 information.</p></article>
        <article className="phase1-card"><div className="phase1-card-head"><div><span>IMPLEMENTATION AUDIT</span><h2>Delivery status</h2></div></div><div className="phase1-footprint"><div><strong>Fully implemented</strong><span>Activities delivered as planned</span><b>{stats.implemented}</b></div><div><strong>Partially implemented</strong><span>Activities with deviations</span><b>{stats.partial}</b></div><div><strong>Not implemented</strong><span>Activities not delivered</span><b>{stats.notImplemented}</b></div></div></article>
        <article className="phase1-card"><div className="phase1-card-head"><div><span>STRATEGIC ALIGNMENT</span><h2>Development framework coverage</h2></div></div><div className="phase1-feed">{details.length?details.slice(0,8).map(r=><div className="phase1-feed-row" key={r.reference}><div><strong>{first(r,['activity_title','activity_name'],'Activity')}</strong><small>UN SDGs: {first(r,['activity_sdgs','un_sdgs_alignment','sdgs_alignment'],'Not recorded')}</small><small>AU Agenda 2063: {first(r,['activity_au_agenda2063','au_agenda2063_alignment'],'Not recorded')}</small></div></div>):<div className="phase1-empty">Strategic alignment will appear as approved reports are available.</div>}</div></article>
        <article className="phase1-card"><div className="phase1-card-head"><div><span>OVERALL ASSESSMENT</span><h2>Operational effectiveness</h2></div></div><div className="assessment"><div className="assessment-score">{stats.assessment?`${stats.assessment}%`:'—'}</div><div className="assessment-track"><i style={{width:`${stats.assessment}%`}}/></div><p>Average assessment score from approved Section 12 records.</p></div></article>
        <article className="phase1-card"><div className="phase1-card-head"><div><span>SAFEGUARDING</span><h2>MEAL attention signal</h2></div></div><div className={stats.concerns?'alert-grid':'alert-grid'}><div className={stats.concerns?'alert hot':'alert'}><strong>{stats.concerns}</strong><small>Safeguarding attention signals</small></div></div><p className="phase1-safe">Signals are surfaced for administrative follow-up; this view does not replace the safeguarding workflow.</p></article>
        <article className="phase1-card wide"><div className="phase1-card-head"><div><span>INSTITUTIONAL LEARNING</span><h2>Challenges, lessons and future improvement</h2></div></div><div className="phase1-feed">{details.length?details.slice(0,10).map(r=><div className="phase1-feed-row" key={`learn-${r.reference}`}><div><strong>{first(r,['activity_title'],'Activity')}</strong><small>Challenge: {first(r,['challenges'],'Not recorded')}</small><small>Lesson: {first(r,['lessons_learned'],'Not recorded')}</small><small>Future improvement: {first(r,['future_improvements'],'Not recorded')}</small></div></div>):<div className="phase1-empty">Learning signals will appear after approved reports are available.</div>}</div></article>
        <article className="phase1-card wide"><div className="phase1-card-head"><div><span>PROGRAMME PERFORMANCE</span><h2>Approved reach by programme</h2></div></div><div className="phase1-footprint">{programmes.length?programmes.map(p=><div key={p.name}><strong>{p.name}</strong><span>{p.reports} approved report{p.reports===1?'':'s'}</span><b>{p.reached.toLocaleString()} participants reached</b></div>):<div className="phase1-empty">No approved programme data yet.</div>}</div></article>
      </section>
    </>}
  </main></div>;
}
