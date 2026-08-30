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
const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;
const first = (obj, keys, fallback = '') => keys.map(k => obj?.[k]).find(v => v !== undefined && v !== null && v !== '') ?? fallback;
const json = (v, fallback = {}) => { if (!v) return fallback; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return fallback; } };

function flattenStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach(v => flattenStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(v => flattenStrings(v, out));
  return out;
}

function findAssessment(value) {
  const values = [];
  const walk = (v, key = '') => {
    if (typeof v === 'number' && v >= 0 && v <= 100 && /assessment|effectiveness|performance|score|rating/i.test(key)) values.push(v);
    if (typeof v === 'string' && /assessment|effectiveness|performance|score|rating/i.test(key)) {
      const m = v.match(/(?:^|\s)(\d{1,3})(?:\s*%|\/100)?(?:\s|$)/);
      if (m) values.push(Number(m[1]));
    }
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${key}.${i}`));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, k));
  };
  walk(value);
  return values.filter(v => v >= 0 && v <= 100);
}

function participantBreakdown(report) {
  const attachments = json(report.attachments, []);
  const item = attachments.find(x => x?.category === 'participant-breakdown');
  const b = item?.breakdown || {};
  const reached = (key) => num(b[`reached${key}`]);
  return {
    children: reached('MaleChildren') + reached('FemaleChildren'),
    youth: reached('MaleYouth') + reached('FemaleYouth'),
    adult: reached('MaleAdult') + reached('FemaleAdult'),
    male: reached('MaleChildren') + reached('MaleYouth') + reached('MaleAdult'),
    female: reached('FemaleChildren') + reached('FemaleYouth') + reached('FemaleAdult'),
    pwdMale: reached('PwdMaleChildren') + reached('PwdMaleYouth') + reached('PwdMaleAdult'),
    pwdFemale: reached('PwdFemaleChildren') + reached('PwdFemaleYouth') + reached('PwdFemaleAdult'),
  };
}

function concerns(value) {
  return flattenStrings(value).filter(s => /concern identified|concern requires follow[- ]?up/i.test(s));
}

function Sidebar() {
  return <aside className="admin-sidebar">
    <div className="side-brand"><div className="side-logo-wrap"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" /></div><div><strong>VSI IMS</strong><small>ADMINISTRATION</small></div></div>
    <div className="side-label">WORKSPACE</div>
    <nav>{NAV.slice(0, 4).map(([label, href]) => <Link key={label} href={href} className={label === 'Dashboard' ? 'active' : ''}><span className="nav-dot" />{label}</Link>)}</nav>
    <div className="side-label intelligence">INTELLIGENCE</div>
    <nav>{NAV.slice(4).map(([label, href]) => <Link key={label} href={href}><span className="nav-dot intel-dot" />{label}</Link>)}</nav>
    <div className="side-note">Approved reports are the trusted layer for organisational performance, finance and MEAL intelligence.</div>
    <Link className="back-report" href="/activity-report">Open Activity Report ↗</Link>
  </aside>;
}

export default function Phase1Dashboard() {
  const [reports, setReports] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/api/admin/activity-reports', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load management intelligence.');
        const list = data.reports || [];
        const full = await Promise.all(list.map(async r => {
          try {
            const detailResponse = await fetch(`/api/admin/activity-reports/${encodeURIComponent(r.reference)}`, { cache: 'no-store' });
            const detailData = await detailResponse.json();
            return detailData.report || r;
          } catch { return r; }
        }));
        if (!cancelled) { setReports(list); setDetails(full); }
      } catch (e) { if (!cancelled) setError(e.message); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const approvedDetails = useMemo(() => details.filter(r => r.review_status === 'APPROVED'), [details]);
  const stats = useMemo(() => {
    const pending = reports.filter(r => (r.review_status || 'PENDING_REVIEW') === 'PENDING_REVIEW').length;
    const approved = reports.filter(r => r.review_status === 'APPROVED').length;
    const returned = reports.filter(r => r.review_status === 'RETURNED').length;
    const rejected = reports.filter(r => r.review_status === 'REJECTED').length;
    const planned = approvedDetails.reduce((s, r) => s + num(first(r, ['planned_participant_total','plannedParticipantTotal','participant_target','target_participants'])), 0);
    const reached = approvedDetails.reduce((s, r) => s + num(first(r, ['reached_participant_total','reachedParticipantTotal','participant_total','total_participants','participants_reached'])), 0);
    const budget = approvedDetails.reduce((s, r) => s + num(first(r, ['approved_budget','approvedBudget','budget_total','total_budget'])), 0);
    const spent = approvedDetails.reduce((s, r) => s + num(first(r, ['actual_spent','actualSpent','total_actual_spend','actual_total'])), 0);
    const assessments = approvedDetails.flatMap(findAssessment);
    const assessment = assessments.length ? Math.round(assessments.reduce((a,b) => a+b, 0) / assessments.length) : 0;
    const concernStrings = details.flatMap(concerns);
    return { total: reports.length, pending, approved, returned, rejected, planned, reached, budget, spent, assessment, identified: concernStrings.filter(s => /concern identified/i.test(s)).length, followUp: concernStrings.filter(s => /requires follow[- ]?up/i.test(s)).length, health: reports.length ? Math.round(approved / reports.length * 100) : 0, achievement: pct(reached, planned) };
  }, [reports, details, approvedDetails]);

  const demographics = useMemo(() => approvedDetails.reduce((totals, report) => {
    const b = participantBreakdown(report);
    Object.keys(totals).forEach(k => { totals[k] += b[k]; });
    return totals;
  }, { children: 0, youth: 0, adult: 0, male: 0, female: 0, pwdMale: 0, pwdFemale: 0 }), [approvedDetails]);

  const feed = useMemo(() => [...reports].sort((a,b) => new Date(first(b,['received_at','submitted_at','created_at','date_time_received'],0)) - new Date(first(a,['received_at','submitted_at','created_at','date_time_received'],0))).slice(0,6), [reports]);

  return <div className="phase1-app">
    <Sidebar />
    <main className="phase1-main">
      <header className="phase1-header"><div><div className="phase1-kicker">VSI ADMINISTRATION · MANAGEMENT INTELLIGENCE</div><h1>Administration Dashboard</h1><p>Executive overview of reporting performance, reach, assessment and safeguarding signals.</p></div><Link href="/admin/reports" className="phase1-action">Reports Inbox →</Link></header>
      {loading && <div className="phase1-message">Loading live management intelligence…</div>}
      {error && <div className="phase1-message error">{error}</div>}
      {!loading && !error && <>
        <section className="phase1-kpis">
          <Link href="/admin/reports"><span>Total Reports</span><strong>{stats.total}</strong><small>Active submitted reports</small></Link>
          <Link href="/admin/reports?status=PENDING_REVIEW"><span>Pending Review</span><strong>{stats.pending}</strong><small>Awaiting decision</small></Link>
          <Link href="/admin/reports?status=APPROVED"><span>Approved</span><strong>{stats.approved}</strong><small>Trusted verified reports</small></Link>
          <div><span>Org Health</span><strong>{stats.health}%</strong><small>Approved report coverage</small></div>
          <div><span>Assessment</span><strong>{stats.assessment ? `${stats.assessment}%` : '—'}</strong><small>Overall assessment signal</small></div>
        </section>
        <section className="phase1-grid">
          <article className="phase1-card wide"><div className="phase1-card-head"><div><span>ACTIVITY REPORT INTELLIGENCE</span><h2>Organisation-wide performance</h2></div><Link href="/admin/reports">Open register →</Link></div><div className="phase1-metrics"><div><small>Approved reach</small><strong>{stats.reached.toLocaleString()}</strong><em>participants</em></div><div><small>Target achievement</small><strong>{stats.planned ? `${stats.achievement}%` : '—'}</strong><em>{stats.planned ? `${stats.reached.toLocaleString()} of ${stats.planned.toLocaleString()}` : 'No target data'}</em></div><div><small>Returned</small><strong>{stats.returned}</strong><em>require correction</em></div><div><small>Rejected</small><strong>{stats.rejected}</strong><em>not accepted</em></div></div></article>
          <article className="phase1-card"><div className="phase1-card-head"><div><span>LIVE SUBMISSION FEED</span><h2>Reporting queue</h2></div><Link href="/admin/reports">View all →</Link></div><div className="phase1-feed">{feed.length ? feed.map(r => { const status=(r.review_status||'PENDING_REVIEW').toUpperCase(); return <div className="phase1-feed-row" key={r.reference}><div><strong>{first(r,['reference'],'Report')}</strong><small>{first(r,['activity_name','activityName','activity_title','activity'],'Activity report')}</small></div><b className={`feed-status ${status.toLowerCase()}`}>{status.replace('_',' ')}</b></div>; }) : <div className="phase1-empty">No submitted reports yet.</div>}</div></article>
          <article className="phase1-card"><div className="phase1-card-head"><div><span>OVERALL ASSESSMENT</span><h2>Operational effectiveness</h2></div></div><div className="assessment"><div className="assessment-score">{stats.assessment ? `${stats.assessment}%` : '—'}</div><div className="assessment-track"><i style={{width:`${stats.assessment}%`}} /></div><p>Calculated from approved Section 12 assessment information.</p></div></article>
          <article className="phase1-card"><div className="phase1-card-head"><div><span>SAFEGUARDING</span><h2>Attention signals</h2></div><span className="phase1-alert-label">LIVE</span></div><div className="alert-grid"><div className={stats.identified?'alert hot':'alert'}><strong>{stats.identified}</strong><small>Concern identified</small></div><div className={stats.followUp?'alert hot':'alert'}><strong>{stats.followUp}</strong><small>Requires follow-up</small></div></div>{!stats.identified&&!stats.followUp&&<p className="phase1-safe">No safeguarding concerns detected in active report data.</p>}</article>
          <article className="phase1-card"><div className="phase1-card-head"><div><span>REACH & TARGETS</span><h2>Approved activity reach</h2></div></div><div className="reach-value"><strong>{stats.reached.toLocaleString()}</strong><span>participants reached</span></div><div className="reach-track"><i style={{width:`${Math.min(100,stats.achievement)}%`}} /></div><div className="reach-label"><span>{stats.planned?`${stats.achievement}% of approved target`:'Target data not yet available'}</span></div></article>
          <article className="phase1-card wide"><div className="phase1-card-head"><div><span>SECTION 05 · PARTICIPANTS & ATTENDANCE</span><h2>Disaggregated approved reach</h2></div><Link href="/admin/meal">MEAL view →</Link></div><div className="phase1-metrics phase1-demographics"><div><small>Children</small><strong>{demographics.children.toLocaleString()}</strong><em>reached</em></div><div><small>Youth</small><strong>{demographics.youth.toLocaleString()}</strong><em>reached</em></div><div><small>Adults</small><strong>{demographics.adult.toLocaleString()}</strong><em>reached</em></div><div><small>PWD</small><strong>{(demographics.pwdMale+demographics.pwdFemale).toLocaleString()}</strong><em>{demographics.pwdMale.toLocaleString()} male · {demographics.pwdFemale.toLocaleString()} female</em></div></div><div className="phase1-footprint" style={{marginTop:10}}><div><strong>Male</strong><span>All age groups</span><b>{demographics.male.toLocaleString()} reached</b></div><div><strong>Female</strong><span>All age groups</span><b>{demographics.female.toLocaleString()} reached</b></div></div></article>
          <article className="phase1-card wide"><div className="phase1-card-head"><div><span>PROGRAMME FOOTPRINT</span><h2>Approved reporting by programme</h2></div><Link href="/admin/meal">MEAL view →</Link></div><div className="phase1-footprint">{approvedDetails.length?approvedDetails.map(r=><div key={first(r,['reference'],'report')}><strong>{first(r,['programme','programme_name','programmeName'],'Unspecified')}</strong><span>{first(r,['activity_name','activityName','activity_title','activity'],'Activity')}</span><b>{num(first(r,['reached_participant_total','reachedParticipantTotal','participant_total','total_participants'])).toLocaleString()} reached</b></div>):<div className="phase1-empty">Approved activity footprint will appear here after reports are approved.</div>}</div></article>
        </section>
      </>}
    </main>
  </div>;
}
