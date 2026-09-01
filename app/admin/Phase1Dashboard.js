'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const nav = [
  ['Executive Dashboard', '/admin'],
  ['Reports', '/admin/reports'],
  ['Finance', '/admin/finance'],
  ['MEAL', '/admin/meal'],
  ['Activities', '/admin/reports'],
  ['Participants', '/admin/reports/intelligence'],
  ['Donors', '/admin/finance'],
  ['Compliance', '/admin/reports'],
  ['Safeguarding', '/admin/reports/intelligence'],
  ['Learning', '/admin/learning'],
  ['Settings', '/admin'],
];

const num = (v) => Number(v ?? 0) || 0;
const first = (o, keys) => keys.map((k) => o?.[k]).find((v) => v !== undefined && v !== null && v !== '');
const money = (v) => `ZMW ${num(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const pct = (v) => `${Math.round(num(v))}%`;
const list = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { const parsed = typeof value === 'string' ? JSON.parse(value) : value; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};
const text = (value) => typeof value === 'string' ? value : (value?.action || value?.description || value?.task || value?.title || '');

function Icon({ type }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (type === 'people') return <svg {...p}><circle cx="9" cy="8" r="3"/><path d="M3.5 20v-1.5A3.5 3.5 0 0 1 7 15h4a3.5 3.5 0 0 1 3.5 3.5V20"/><path d="M15 5.5a3 3 0 0 1 0 5.8M18 15.2a3.5 3.5 0 0 1 3 3.5V20"/></svg>;
  if (type === 'money') return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 6v12M15.5 8.5c-.6-1-1.8-1.5-3.5-1.5-2 0-3.2 1-3.2 2.3 0 1.5 1.3 2.2 3.2 2.7 1.9.5 3.2 1.2 3.2 2.7 0 1.4-1.3 2.3-3.2 2.3-1.7 0-2.9-.5-3.5-1.5"/></svg>;
  if (type === 'target') return <svg {...p}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>;
  if (type === 'shield') return <svg {...p}><path d="M12 3l7 3v5c0 4.5-2.8 7.7-7 10-4.2-2.3-7-5.5-7-10V6l7-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>;
  if (type === 'report') return <svg {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
  return <svg {...p}><path d="M12 3v18M17 7.5c0-1.9-2.1-3.5-5-3.5S7 5.1 7 7.2 8.7 10.5 12 11c3.3.5 5 1.8 5 4s-2.1 4-5 4-5-1.6-5-3.5"/></svg>;
}

function Donut({ parts, total }) {
  const gradient = parts.length ? parts.map((x) => `${x.color} ${x.start}deg ${x.end}deg`).join(', ') : '#dce5ec 0deg 360deg';
  return <div className="donut" style={{ background: `conic-gradient(${gradient})` }}><div className="donut-hole"><strong>{total.toLocaleString()}</strong><span>Total Reached</span></div></div>;
}

function Progress({ value, tone = 'blue' }) { return <div className={`progress ${tone}`}><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>; }
function Empty({ text }) { return <div className="empty">{text}</div>; }

export default function Phase1Dashboard() {
  const [reports, setReports] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ directorate: 'All', programme: 'All', project: 'All', donor: 'All', status: 'All' });

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const response = await fetch('/api/admin/activity-reports', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load the activities register.');
        const rows = data.reports || [];
        const approved = rows.filter((r) => r.review_status === 'APPROVED');
        const full = await Promise.all(approved.map(async (r) => {
          try {
            const rr = await fetch(`/api/admin/activity-reports/${encodeURIComponent(r.reference)}`, { cache: 'no-store' });
            const dd = await rr.json();
            return dd.report || r;
          } catch { return r; }
        }));
        if (!dead) { setReports(rows); setDetails(full); }
      } catch (e) { if (!dead) setError(e.message); }
      finally { if (!dead) setLoading(false); }
    })();
    return () => { dead = true; };
  }, []);

  const approved = useMemo(() => details.filter((r) => r.review_status === 'APPROVED'), [details]);
  const filtered = useMemo(() => approved.filter((r) => {
    if (filters.directorate !== 'All' && (r.directorate || 'Unspecified') !== filters.directorate) return false;
    if (filters.programme !== 'All' && (r.programme || 'Unspecified') !== filters.programme) return false;
    if (filters.project !== 'All' && (r.project || 'Unspecified') !== filters.project) return false;
    if (filters.donor !== 'All' && (r.donor_name || r.funding_source || 'Unspecified') !== filters.donor) return false;
    if (filters.status !== 'All' && (r.review_status || 'PENDING_REVIEW') !== filters.status) return false;
    return true;
  }), [approved, filters]);

  const totals = useMemo(() => filtered.reduce((a, r) => {
    a.reach += num(first(r, ['reached_participant_total', 'reachedParticipantTotal', 'participant_total']));
    a.budget += num(first(r, ['approved_budget', 'approvedBudget']));
    a.spent += num(first(r, ['actual_spent', 'actualSpent']));
    a.male += num(first(r, ['participant_male', 'reached_participant_male', 'male']));
    a.female += num(first(r, ['participant_female', 'reached_participant_female', 'female']));
    a.pwd += num(first(r, ['participants_with_disabilities', 'participant_pwd', 'pwd_total']));
    return a;
  }, { reach: 0, budget: 0, spent: 0, male: 0, female: 0, pwd: 0 }), [filtered]);

  const programmeBreakdown = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const name = r.programme || 'Unspecified';
      const x = map.get(name) || { name, reach: 0, budget: 0 };
      x.reach += num(first(r, ['reached_participant_total', 'reachedParticipantTotal', 'participant_total']));
      x.budget += num(first(r, ['approved_budget', 'approvedBudget']));
      map.set(name, x);
    });
    return [...map.values()].sort((a, b) => b.reach - a.reach);
  }, [filtered]);

  const donorBreakdown = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const name = r.donor_name || r.funding_source || 'Unspecified donor';
      const x = map.get(name) || { name, activities: 0, budget: 0, spent: 0, projects: new Set() };
      x.activities += 1; x.budget += num(first(r, ['approved_budget', 'approvedBudget'])); x.spent += num(first(r, ['actual_spent', 'actualSpent']));
      if (r.project) x.projects.add(r.project);
      map.set(name, x);
    });
    return [...map.values()].sort((a, b) => b.budget - a.budget).map((x) => ({ ...x, projects: [...x.projects] }));
  }, [filtered]);

  const geo = useMemo(() => {
    const provinces = [...new Set(filtered.map((r) => r.province).filter(Boolean))];
    const districts = [...new Set(filtered.map((r) => r.district).filter(Boolean))];
    return { provinces, districts };
  }, [filtered]);

  const attention = useMemo(() => {
    const actions = filtered.flatMap((r) => list(r.follow_up_actions).map((item) => ({ r, item })));
    const open = actions.filter(({ item }) => !['complete', 'completed', 'done'].includes(String(item?.status || item?.progress || item?.state || '').toLowerCase())).slice(0, 3);
    return { open, count: open.length, safeguarding: filtered.filter((r) => String(r.safeguarding_status || '').toLowerCase() && !['clear', 'cleared', 'none', 'no issues'].includes(String(r.safeguarding_status).toLowerCase())).length };
  }, [filtered]);

  const compliance = useMemo(() => {
    const reporting = filtered.length ? filtered.filter((r) => r.review_status === 'APPROVED').length / filtered.length * 100 : 0;
    const safeguarding = filtered.length ? filtered.filter((r) => ['clear', 'cleared', 'none', 'no issues', ''].includes(String(r.safeguarding_status || '').toLowerCase())).length / filtered.length * 100 : 0;
    const reachTarget = filtered.length ? filtered.filter((r) => {
      const score = num(first(r, ['assessment_score', 'target_achievement', 'achievement_percent']));
      return score >= 100;
    }).length / filtered.length * 100 : 0;
    const finance = totals.budget ? Math.min(100, totals.spent / totals.budget * 100) : 0;
    return { reporting, finance, safeguarding, reachTarget, overall: filtered.length ? Math.round((reporting + finance + safeguarding + reachTarget) / 4) : 0 };
  }, [filtered, totals]);

  const learning = useMemo(() => ({
    lessons: filtered.reduce((n, r) => n + (r.lessons_learned ? 1 : 0), 0),
    challenges: filtered.reduce((n, r) => n + (r.challenges ? 1 : 0), 0),
    improvements: filtered.reduce((n, r) => n + (r.future_improvements ? 1 : 0), 0),
    latest: filtered.flatMap((r) => [r.lessons_learned, r.future_improvements]).filter(Boolean).slice(0, 2),
  }), [filtered]);

  const programmes = useMemo(() => ['All', ...new Set(approved.map((r) => r.programme || 'Unspecified'))], [approved]);
  const directorates = useMemo(() => ['All', ...new Set(approved.map((r) => r.directorate || 'Unspecified'))], [approved]);
  const projects = useMemo(() => ['All', ...new Set(approved.map((r) => r.project || 'Unspecified'))], [approved]);
  const donors = useMemo(() => ['All', ...new Set(approved.map((r) => r.donor_name || r.funding_source || 'Unspecified'))], [approved]);
  const utilisation = totals.budget ? Math.round(totals.spent / totals.budget * 100) : 0;
  const genderTotal = totals.male + totals.female;
  const malePct = genderTotal ? Math.round(totals.male / genderTotal * 100) : 0;
  const femalePct = genderTotal ? 100 - malePct : 0;

  const parts = useMemo(() => {
    let cursor = 0;
    const colors = ['#1677C8', '#7B3FE4', '#F4A900', '#159E9A', '#063B73'];
    return programmeBreakdown.map((x, i) => { const share = totals.reach ? x.reach / totals.reach * 360 : 0; const part = { ...x, color: colors[i % colors.length], start: cursor, end: cursor + share }; cursor += share; return part; });
  }, [programmeBreakdown, totals.reach]);

  const dateLabel = new Intl.DateTimeFormat(undefined, { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date());

  return <div className="exec-app">
    <aside className="exec-sidebar">
      <div className="brand"><div className="logo-wrap"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" /></div><span>Intelligence Behind Our Work</span></div>
      <nav>{nav.map(([label, href]) => <Link key={label} href={href} className={label === 'Executive Dashboard' ? 'active' : ''}><span className="nav-icon">{label === 'Executive Dashboard' ? '◆' : '•'}</span>{label}</Link>)}</nav>
    </aside>

    <main className="exec-main">
      <header className="exec-header"><div><div className="breadcrumb">VSI ADMINISTRATION · MANAGEMENT INTELLIGENCE</div><h1>Executive Dashboard</h1><p>Real-time overview of VSI programmes, activities, finance, reach, compliance and learning.</p></div><div className="header-right"><div className="updated"><span>LAST UPDATED</span><strong>{dateLabel}</strong></div><div className="profile"><div className="avatar">MB</div><div><strong>Mary Banda</strong><span>Executive Director</span></div></div><Link href="/admin/reports" className="reports-btn">View All Reports →</Link></div></header>
      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading-banner">Loading approved activity intelligence from the Activities Register…</div>}
      <section className="kpi-grid">
        <Kpi icon="report" label="Approved Activities" value={approved.length} link="/admin/reports?status=APPROVED" note="View activities →" tone="blue" />
        <Kpi icon="people" label="Participants Reached" value={totals.reach.toLocaleString()} link="/admin/reports/intelligence" note="View details →" tone="green" />
        <Kpi icon="money" label="Approved Budget" value={money(totals.budget)} link="/admin/finance" note="View finance →" tone="blue" />
        <Kpi icon="money" label="Actual Expenditure" value={money(totals.spent)} link="/admin/finance" note="View finance →" tone="purple" />
        <Kpi label="Budget Utilisation" value={pct(utilisation)} link="/admin/finance" note="View finance →" tone="teal" />
        <Kpi icon="target" label="Target Achievement" value={filtered.length ? pct(Math.round(filtered.reduce((s, r) => s + num(first(r, ['assessment_score', 'target_achievement', 'achievement_percent'])), 0) / filtered.length)) : '0%'} link="/admin/meal" note="View MEAL →" tone="blue" />
        <Kpi icon="shield" label="Safeguarding Status" value={`${Math.round(compliance.safeguarding)}% Clear`} link="/admin/reports/intelligence" note="View safeguarding →" tone="green" />
        <Kpi icon="report" label="Reporting Compliance" value={pct(Math.round(compliance.reporting))} link="/admin/reports" note="View reports →" tone="blue" />
      </section>
      <section className="two-col top-intelligence">
        <article className="card programme-card"><CardHead title="Programme Performance" subtitle="Where VSI is delivering" /><div className="programme-content"><div><h3>Participants Reached by Programme</h3><div className="donut-row"><Donut parts={parts} total={totals.reach} /><div className="legend">{parts.map((x) => <div className="legend-row" key={x.name}><i style={{ background: x.color }} /><span>{x.name}</span><strong>{x.reach.toLocaleString()} / {totals.reach ? Math.round(x.reach / totals.reach * 100) : 0}%</strong></div>)}</div></div></div><div><h3>Budget by Programme</h3>{programmeBreakdown.map((x, i) => <div className="budget-row" key={x.name}><div><strong>{x.name}</strong><span>{money(x.budget)} · {totals.budget ? Math.round(x.budget / totals.budget * 100) : 0}%</span></div><Progress value={totals.budget ? x.budget / totals.budget * 100 : 0} tone={i % 2 ? 'gold' : 'purple'} /></div>)}{!programmeBreakdown.length && <div className="empty">No approved programme data.</div>}</div></div></article>
        <article className="card finance-card"><CardHead title="Financial Intelligence" subtitle="Approved financial performance across VSI activity reports." /><div className="approved-banner">✓ <strong>Approved data only</strong></div><div className="finance-metrics"><Metric title="Approved Budget" value={money(totals.budget)} icon="money"/><Metric title="Actual Spend" value={money(totals.spent)} icon="money"/><Metric title="Balance" value={money(totals.budget - totals.spent)} icon="money"/></div><table className="mini-table"><thead><tr><th>Programme</th><th>Approved</th><th>Spent</th><th>Balance</th><th>Util.</th></tr></thead><tbody>{programmeBreakdown.map((x) => { const spent = filtered.filter((r) => (r.programme || 'Unspecified') === x.name).reduce((s, r) => s + num(first(r, ['actual_spent', 'actualSpent'])), 0); return <tr key={x.name}><td>{x.name}</td><td>{money(x.budget)}</td><td>{money(spent)}</td><td>{money(x.budget - spent)}</td><td><span className="util-pill">{pct(x.budget ? spent / x.budget * 100 : 0)}</span></td></tr>; })}</tbody></table></article>
      </section>
      <section className="three-col impact-grid"><article className="card"><CardHead title="Reach & Impact" subtitle="Who are we reaching?"/><div className="demographic-list"><Demo label="Children" value={num(first(totals, ['children'])) || filtered.reduce((s,r)=>s+num(first(r,['children_total','participant_children','children'])),0)} total={totals.reach}/><Demo label="Youth" value={filtered.reduce((s,r)=>s+num(first(r,['youth_total','participant_youth','youth'])),0)} total={totals.reach}/><Demo label="Adults" value={filtered.reduce((s,r)=>s+num(first(r,['adult_total','participant_adult','adults'])),0)} total={totals.reach}/><Demo label="Persons with Disability (PWD)" value={totals.pwd} total={totals.reach}/></div><div className="reach-total">Total Reached <strong>{totals.reach.toLocaleString()}</strong></div><div className="mini-reach"><span>PAR — {programmeBreakdown.find(x=>/policy|par/i.test(x.name))?.reach || 0}</span><span>MHRP — {programmeBreakdown.find(x=>/mental|mhrp/i.test(x.name))?.reach || 0}</span></div></article><article className="card"><CardHead title="Gender" subtitle="Participant gender distribution"/><div className="gender-stat"><div><strong>{totals.male.toLocaleString()}</strong><span>Male</span></div><b>{malePct}%</b></div><Progress value={malePct} tone="blue"/><div className="gender-stat"><div><strong>{totals.female.toLocaleString()}</strong><span>Female</span></div><b>{femalePct}%</b></div><Progress value={femalePct} tone="purple"/><div className="gender-foot">{genderTotal ? `${genderTotal.toLocaleString()} participants with gender recorded` : 'Gender data not yet recorded'}</div></article><article className="card"><CardHead title="Geographic Footprint" subtitle="Where VSI is working"/><div className="zambia-map"><div className="map-shape"><span className="pin lusaka">●</span><span className="pin copperbelt">●</span><span className="map-label lusaka-label">Lusaka</span><span className="map-label copperbelt-label">Copperbelt</span></div></div><div className="geo-cols"><div><small>PROVINCES</small>{(geo.provinces.length ? geo.provinces : ['No province recorded']).slice(0,4).map(x=><span key={x}>{x}</span>)}</div><div><small>DISTRICTS</small>{(geo.districts.length ? geo.districts : ['No district recorded']).slice(0,4).map(x=><span key={x}>{x}</span>)}</div></div></article></section>
      <section className="three-col portfolio-grid"><article className="card donor-card"><CardHead title="Donor Portfolio" subtitle="Projects and activities supported by each donor."/>{donorBreakdown.map((d)=><div className="donor" key={d.name}><div className="donor-head"><div><strong>{d.name}</strong><span>{d.projects.join(' · ') || 'Project not recorded'} · {d.activities} {d.activities === 1 ? 'activity' : 'activities'}</span></div><b>{money(d.budget)}</b></div><div className="donor-values"><span>Approved <strong>{money(d.budget)}</strong></span><span>Spent <strong>{money(d.spent)}</strong></span><span>Balance <strong>{money(d.budget-d.spent)}</strong></span></div><Progress value={d.budget ? d.spent / d.budget * 100 : 0} tone="green"/><small>{d.budget ? Math.round(d.spent / d.budget * 100) : 0}% utilised</small></div>)}<div className="portfolio-summary">{donorBreakdown.length} Donors · {filtered.length} Activities · {money(totals.budget)}</div>{!donorBreakdown.length && <Empty text="No approved donor information is available."/>}</article><article className="card attention-card"><CardHead title="Management Attention" subtitle="Items requiring management visibility." action="View all →"/><Attention title="Critical Issues" count="0" text="No critical issues identified." tone="red"/><Attention title="Follow-up Required" count={attention.count} text={attention.open.map(({r,item}) => text(item) || r.activity_title).join(' · ') || 'No open follow-up actions recorded.'} tone="amber"/><Attention title="Safeguarding" count={attention.safeguarding} text={attention.safeguarding ? 'Safeguarding items require review.' : 'All safeguarding reports clear.'} tone="green"/></article><article className="card compliance-card"><CardHead title="Compliance Health" subtitle="MEAL reporting, budget and safeguarding compliance."/><div className="compliance-rings">{[['Reporting',compliance.reporting],['Finance',compliance.finance],['Reach / Target',compliance.reachTarget],['Safeguarding',compliance.safeguarding]].map(([label,value])=><Ring key={label} label={label} value={value}/>)}</div><div className="health-gauge"><div><strong>{compliance.overall}%</strong><span>VSI COMPLIANCE HEALTH</span></div><b>{compliance.overall >= 90 ? 'Excellent' : compliance.overall >= 70 ? 'Good' : 'Attention'}</b></div></article></section>
      <section className="card performance"><CardHead title="Programme & Activity Performance" subtitle="Approved activity performance across VSI."/><div className="filters">{[['directorate','All Directorates',directorates],['programme','All Programmes',programmes],['project','All Projects',projects],['donor','All Donors',donors],['status','All Status',['All','APPROVED']]].map(([key,label,values])=><select key={key} value={filters[key]} onChange={(e)=>setFilters({...filters,[key]:e.target.value})}><option value="All">{label}</option>{values.filter(x=>x!=='All').map(x=><option key={x} value={x}>{x}</option>)}</select>)}</div><div className="table-scroll"><table className="performance-table"><thead><tr><th>Activity</th><th>Directorate</th><th>Programme</th><th>Reach</th><th>Budget</th><th>Spend</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map((r)=><tr key={r.reference}><td><strong>{r.activity_title || 'Untitled activity'}</strong><small>{r.reference}</small></td><td>{r.directorate || '—'}</td><td>{r.programme || '—'}</td><td>{num(first(r,['reached_participant_total','reachedParticipantTotal','participant_total'])).toLocaleString()}</td><td>{money(first(r,['approved_budget','approvedBudget']))}</td><td>{money(first(r,['actual_spent','actualSpent']))}</td><td><span className="status-approved">Approved</span></td><td><Link href={`/admin/reports/${encodeURIComponent(r.reference)}`}>View →</Link></td></tr>)}{!filtered.length && <tr><td colSpan="8" className="empty-cell">No approved activities match the selected filters.</td></tr>}</tbody></table></div></section>
      <section className="three-col bottom-grid"><article className="card learning"><CardHead title="Learning & Adaptive Programming" subtitle="Turning evidence into better decisions."/><div className="learning-metrics"><Metric title="Lessons Captured" value={learning.lessons} icon="target"/><Metric title="Challenges Captured" value={learning.challenges} icon="target"/><Metric title="Improvements Recorded" value={learning.improvements} icon="target"/></div><h3>Latest Learning Signals</h3><ul>{(learning.latest.length ? learning.latest : ['No learning signals recorded yet.']).map((x,i)=><li key={i}>{String(x).slice(0,180)}</li>)}</ul><Link href="/admin/learning" className="learning-btn">View Learning Intelligence →</Link></article><article className="card snapshot"><CardHead title="Management Snapshot" subtitle="Current approved portfolio in one view."/><p>VSI has delivered <strong>{approved.length} approved activities</strong> reaching <strong>{totals.reach.toLocaleString()} participants</strong> across {geo.provinces.length ? geo.provinces.join(' and ') : 'the recorded delivery footprint'}. Approved expenditure stands at <strong>{money(totals.spent)}</strong>, with <strong>{utilisation}% budget utilisation</strong>. {compliance.overall >= 90 ? 'Approved activities currently present a strong compliance position.' : 'The approved portfolio contains compliance signals requiring management review.'} {attention.count ? `${attention.count} follow-up action${attention.count === 1 ? '' : 's'} require management attention.` : 'No open follow-up actions are currently recorded.'}</p><div className="snapshot-line"/></article></section>
    </main>
    <style jsx>{`*{box-sizing:border-box}.exec-app{min-height:100vh;background:#F5F8FC;color:#17212B;display:flex;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.exec-sidebar{position:sticky;top:0;height:100vh;width:190px;flex:0 0 190px;background:linear-gradient(180deg,#063B73 0%,#052F5B 100%);color:#fff;padding:20px 11px;box-shadow:8px 0 24px rgba(6,59,115,.12)}.brand{padding:4px 8px 18px;border-bottom:1px solid rgba(255,255,255,.12);margin-bottom:16px}.logo-wrap{height:52px;display:flex;align-items:center;justify-content:center}.logo-wrap img{max-width:158px;max-height:48px;width:auto;height:auto;object-fit:contain}.brand>span{display:block;color:#DCEAF6;font-size:8px;line-height:1.45;margin-top:9px;letter-spacing:.025em;text-align:center;text-transform:uppercase}.exec-sidebar nav{display:flex;flex-direction:column;gap:4px}.exec-sidebar nav a{display:flex;align-items:center;gap:9px;min-height:34px;padding:8px 9px;border-radius:8px;color:rgba(255,255,255,.78);font-size:10px;font-weight:700;text-decoration:none;white-space:nowrap;transition:background .15s ease,color .15s ease,transform .15s ease}.exec-sidebar nav a:hover{background:rgba(255,255,255,.08);color:#fff;transform:translateX(1px)}.exec-sidebar nav a.active{background:#FFC300;color:#063B73;font-weight:900;box-shadow:0 3px 10px rgba(0,0,0,.12)}.nav-icon{font-size:7px;width:10px;text-align:center;opacity:.95}.exec-main{flex:1;min-width:0;padding:28px 30px 48px;max-width:1700px}.exec-header{display:flex;justify-content:space-between;gap:28px;align-items:flex-start;margin-bottom:22px}.breadcrumb{font-size:8px;letter-spacing:.15em;color:#1677C8;font-weight:900}.exec-header h1{margin:7px 0 0;color:#063B73;font-size:32px;line-height:1.05;letter-spacing:-.04em;font-weight:900}.exec-header p{margin:8px 0 0;color:#69798A;font-size:11px;line-height:1.5}.header-right{display:flex;align-items:center;gap:14px;padding-top:2px}.updated{background:#fff;border:1px solid #DCE5EE;padding:9px 11px;border-radius:9px;min-width:150px;box-shadow:0 2px 8px rgba(6,59,115,.025)}.updated span{display:block;color:#8795A2;font-size:7px;font-weight:900;letter-spacing:.11em}.updated strong{display:block;color:#17324D;font-size:9px;margin-top:4px}.profile{display:flex;align-items:center;gap:9px}.avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#DCEAF7;color:#063B73;font-size:9px;font-weight:900;border:2px solid #fff;box-shadow:0 2px 8px rgba(6,59,115,.08)}.profile strong,.profile span{display:block}.profile strong{font-size:9.5px;color:#17324D}.profile span{font-size:8px;color:#7A8997;margin-top:2px}.reports-btn,.learning-btn{background:#1677C8;color:#fff;text-decoration:none;border-radius:8px;padding:10px 13px;font-size:9px;font-weight:900;white-space:nowrap;box-shadow:0 3px 10px rgba(22,119,200,.16);transition:transform .15s ease,box-shadow .15s ease}.reports-btn:hover,.learning-btn:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(22,119,200,.2)}.error-banner,.loading-banner{padding:10px 12px;border-radius:8px;margin-bottom:13px;font-size:9px}.error-banner{background:#FFF1F1;color:#B42318;border:1px solid #F2C7C7}.loading-banner{background:#EAF3FC;color:#145B92;border:1px solid #CFE3F5}.kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}.kpi{position:relative;background:#fff;border:1px solid #DCE5EE;border-top:3px solid #1677C8;border-radius:10px;padding:14px 15px 13px;min-height:108px;box-shadow:0 3px 12px rgba(6,59,115,.035);transition:transform .15s ease,box-shadow .15s ease}.kpi:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(6,59,115,.07)}.kpi.green{border-top-color:#16A66A}.kpi.purple{border-top-color:#7B3FE4}.kpi.teal{border-top-color:#159E9A}.kpi-label{font-size:8px;letter-spacing:.055em;color:#6B7B8B;font-weight:900;text-transform:uppercase}.kpi-value{display:block;color:#063B73;font-size:24px;line-height:1.08;margin:8px 0 7px;font-weight:900;letter-spacing:-.025em}.kpi-note{color:#1677C8;font-size:8px;font-weight:900;text-decoration:none}.kpi-note:hover{text-decoration:underline}.kpi-icon{position:absolute;right:12px;top:12px;color:#7C9BB8;width:27px;height:27px;border-radius:7px;background:#F1F6FB;display:grid;place-items:center}.two-col{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.95fr);gap:15px}.three-col{display:grid;grid-template-columns:1.05fr .9fr 1fr;gap:15px}.card{background:#fff;border:1px solid #DCE5EE;border-radius:11px;box-shadow:0 3px 16px rgba(6,59,115,.045);min-width:0;overflow:hidden}.card-head{padding:15px 16px 12px;border-bottom:1px solid #E8EEF4;display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.card-head h2{margin:2px 0 0;color:#063B73;font-size:14px;line-height:1.25;font-weight:900;letter-spacing:-.015em}.card-head p{margin:5px 0 0;color:#718091;font-size:8.5px;line-height:1.5}.card-action{font-size:8px;color:#1677C8;font-weight:900;white-space:nowrap}.programme-content{display:grid;grid-template-columns:1.05fr .95fr;gap:20px;padding:16px}.programme-content h3{margin:0 0 13px;color:#30465A;font-size:9px;font-weight:900;letter-spacing:.01em}.donut-row{display:flex;align-items:center;gap:17px}.donut{width:136px;height:136px;border-radius:50%;display:grid;place-items:center;flex:0 0 136px;box-shadow:0 2px 10px rgba(6,59,115,.06)}.donut-hole{width:84px;height:84px;border-radius:50%;background:#fff;display:grid;place-items:center;align-content:center;box-shadow:0 1px 5px rgba(6,59,115,.06)}.donut-hole strong{color:#063B73;font-size:21px;line-height:1;font-weight:900}.donut-hole span{font-size:7px;color:#7A8997;margin-top:4px}.legend{min-width:0;display:grid;gap:9px}.legend-row{display:grid;grid-template-columns:8px minmax(0,1fr) auto;gap:7px;align-items:center;font-size:8px}.legend-row i{width:7px;height:7px;border-radius:50%}.legend-row span{color:#516274;overflow-wrap:anywhere;line-height:1.35}.legend-row strong{color:#063B73;font-size:8px;white-space:nowrap}.budget-row{margin-bottom:15px}.budget-row>div{display:flex;justify-content:space-between;gap:10px;margin-bottom:6px;font-size:8px}.budget-row strong{color:#334C62;font-weight:800}.budget-row span{color:#788898}.progress{height:6px;border-radius:6px;background:#E8EEF4;overflow:hidden}.progress i{height:100%;display:block;border-radius:inherit;background:#1677C8;transition:width .3s ease}.progress.green i{background:#16A66A}.progress.purple i{background:#7B3FE4}.progress.gold i{background:#F4A900}.approved-banner{margin:13px 15px 0;padding:8px 10px;border-radius:7px;background:#EFFAF5;border:1px solid #D1F0E0;color:#13794E;font-size:8px}.finance-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:13px 15px}.metric-box{background:#F7FAFD;border:1px solid #E2EAF2;border-radius:8px;padding:9px 10px}.metric-box span{display:block;color:#718091;font-size:7.5px;font-weight:800}.metric-box strong{display:block;color:#063B73;font-size:11px;margin-top:5px;font-weight:900}.mini-table{width:calc(100% - 30px);margin:0 15px 15px;border-collapse:collapse;font-size:8px}.mini-table th{text-align:left;background:#F5F8FC;color:#718091;padding:7px;border-bottom:1px solid #E1E8EF;font-size:7px;text-transform:uppercase;letter-spacing:.04em}.mini-table td{padding:8px 7px;border-bottom:1px solid #EDF1F5;color:#40566A}.util-pill,.status-approved{display:inline-block;background:#E9F8F1;color:#13794E;border-radius:999px;padding:3px 7px;font-size:7px;font-weight:900}.impact-grid,.portfolio-grid,.bottom-grid{margin-top:15px}.demographic-list{padding:13px 16px 4px;display:grid;gap:10px}.demo{display:grid;grid-template-columns:1fr;gap:5px;font-size:8px}.demo-head{display:flex;justify-content:space-between;color:#52677A;margin-bottom:4px}.demo-head strong{color:#063B73}.reach-total{border-top:1px solid #E7EDF3;margin:6px 16px 0;padding:11px 0;color:#647487;font-size:8px;display:flex;justify-content:space-between}.reach-total strong{color:#063B73;font-size:14px}.mini-reach{display:flex;gap:7px;padding:0 16px 14px}.mini-reach span{background:#F4F8FC;border:1px solid #E1E9F1;border-radius:6px;padding:6px 8px;color:#516274;font-size:7.5px}.gender-stat{display:flex;align-items:flex-end;justify-content:space-between;padding:17px 16px 7px}.gender-stat div strong,.gender-stat div span{display:block}.gender-stat div strong{color:#063B73;font-size:23px;font-weight:900}.gender-stat div span{color:#6C7B8A;font-size:8px;margin-top:2px}.gender-stat>b{color:#1677C8;font-size:13px}.gender-stat:nth-of-type(2)>b{color:#7B3FE4}.gender-foot{padding:16px;color:#7A8997;font-size:7.5px}.zambia-map{height:132px;margin:14px 16px 9px;background:#F1F6FB;border:1px solid #DFE9F2;border-radius:9px;display:grid;place-items:center;overflow:hidden}.map-shape{width:155px;height:108px;background:#DCEAF6;clip-path:polygon(22% 5%,45% 0,65% 10%,84% 25%,92% 45%,80% 61%,88% 76%,68% 92%,45% 84%,26% 98%,8% 79%,17% 61%,7% 43%,16% 26%);position:relative}.pin{position:absolute;color:#E5484D;font-size:14px;text-shadow:0 1px 2px #fff}.lusaka{left:54%;top:56%}.copperbelt{left:38%;top:25%}.map-label{position:absolute;font-size:7px;color:#315873;font-weight:900;background:#fff;padding:3px 5px;border-radius:4px;box-shadow:0 1px 4px rgba(6,59,115,.08)}.lusaka-label{left:61%;top:58%}.copperbelt-label{left:23%;top:27%}.geo-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px 15px}.geo-cols small,.geo-cols span{display:block}.geo-cols small{color:#8A98A6;font-size:6.5px;font-weight:900;letter-spacing:.08em;margin-bottom:5px}.geo-cols span{color:#40566A;font-size:8px;margin:3px 0}.donor{margin:11px 15px;padding:12px;border:1px solid #E0E8F0;border-radius:8px;background:#FCFDFE}.donor-head{display:flex;justify-content:space-between;gap:10px}.donor-head strong{display:block;color:#063B73;font-size:10px;font-weight:900}.donor-head span{display:block;color:#778696;font-size:7.5px;margin-top:3px;line-height:1.4}.donor-head>b{color:#063B73;font-size:10px;white-space:nowrap}.donor-values{display:flex;justify-content:space-between;gap:7px;margin:10px 0;color:#718091;font-size:7px}.donor-values strong{color:#40566A}.donor small{display:block;text-align:right;color:#16A66A;font-size:7.5px;font-weight:900;margin-top:4px}.portfolio-summary{margin:3px 15px 15px;padding-top:11px;border-top:1px solid #E6EDF3;color:#52687A;font-size:8px;font-weight:900}.attention-card .card-head{padding-bottom:11px}.attention{display:grid;grid-template-columns:48px 1fr;gap:11px;margin:10px 15px;padding:11px;border:1px solid #E3EAF1;border-radius:8px;background:#FBFCFE}.attention-count{font-size:23px;font-weight:900;line-height:1;color:#063B73}.attention-count.red{color:#E5484D}.attention-count.amber{color:#D18A00}.attention-count.green{color:#16A66A}.attention-body strong{display:block;color:#31495E;font-size:8.5px}.attention-body span{display:block;color:#718091;font-size:7.5px;line-height:1.5;margin-top:3px}.compliance-rings{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:16px}.ring{display:grid;justify-items:center;gap:6px}.ring-circle{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#16A66A calc(var(--value) * 1%),#E7EEF4 0);position:relative}.ring-circle:after{content:"";width:38px;height:38px;border-radius:50%;background:#fff;position:absolute}.ring-circle strong{position:relative;z-index:1;color:#063B73;font-size:9px}.ring span{font-size:7px;color:#697A8A;text-align:center}.health-gauge{margin:0 16px 16px;padding:12px;background:#EFFAF5;border:1px solid #D5F0E1;border-radius:8px;display:flex;align-items:center;justify-content:space-between}.health-gauge strong{display:block;color:#063B73;font-size:22px}.health-gauge span{display:block;color:#6F7F8E;font-size:6.5px;letter-spacing:.08em;margin-top:2px}.health-gauge>b{color:#16A66A;font-size:9px}.performance{margin-top:15px}.filters{display:flex;gap:8px;padding:12px 15px;border-bottom:1px solid #E6EDF3;flex-wrap:wrap;background:#FCFDFE}.filters select{height:32px;border:1px solid #D6E0E9;background:#fff;color:#40566A;border-radius:7px;padding:0 10px;font-size:8px;min-width:130px;outline:none}.filters select:focus{border-color:#1677C8;box-shadow:0 0 0 2px rgba(22,119,200,.08)}.table-scroll{overflow:auto}.performance-table{width:100%;min-width:920px;border-collapse:collapse}.performance-table th{background:#F5F8FC;color:#718091;padding:9px 11px;text-align:left;font-size:7px;text-transform:uppercase;letter-spacing:.06em}.performance-table td{padding:11px;border-top:1px solid #E8EEF3;color:#526679;font-size:8.5px;vertical-align:top}.performance-table tbody tr:hover{background:#FAFCFE}.performance-table td strong{display:block;color:#253E53;font-size:9px;font-weight:900;line-height:1.35}.performance-table td small{display:block;color:#8997A5;font-size:7px;margin-top:3px}.performance-table td a{color:#1677C8;text-decoration:none;font-weight:900}.performance-table td a:hover{text-decoration:underline}.learning{padding-bottom:15px}.learning-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:13px 15px}.learning .metric-box strong{font-size:17px}.learning h3{font-size:8.5px;color:#31495E;margin:1px 16px 8px}.learning ul{margin:0 16px 13px;padding-left:15px;color:#5F7182;font-size:8px;line-height:1.6}.snapshot{background:#FFFBEF;border-color:#F0E1AF}.snapshot .card-head{border-bottom-color:#F1E5C4}.snapshot p{margin:17px;color:#5B5C57;font-size:9.5px;line-height:1.75}.snapshot p strong{color:#063B73}.snapshot-line{height:3px;background:#16A66A;margin:0 17px 15px;border-radius:3px}.empty-cell{text-align:center!important;color:#8997A5!important;padding:24px!important}.empty{padding:26px 16px;color:#7B8997;font-size:8.5px}.error{padding:15px;color:#B42318;font-size:9px}.error-banner{grid-column:1/-1}.loading-banner{grid-column:1/-1}@media(max-width:1180px){.exec-main{padding:22px}.header-right{flex-wrap:wrap;justify-content:flex-end}.three-col{grid-template-columns:1fr 1fr}.portfolio-grid .donor-card{grid-column:span 2}.bottom-grid{grid-template-columns:1fr 1fr}.kpi-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:800px){.exec-sidebar{position:relative;width:100%;height:auto;flex:none}.exec-app{display:block}.exec-sidebar nav{display:grid;grid-template-columns:repeat(2,1fr)}.exec-main{padding:15px}.exec-header{display:block}.header-right{justify-content:flex-start;margin-top:13px}.two-col,.three-col,.programme-content{grid-template-columns:1fr}.portfolio-grid .donor-card{grid-column:auto}.kpi-grid{grid-template-columns:1fr 1fr}.finance-metrics{grid-template-columns:1fr}.donut-row{justify-content:center;flex-wrap:wrap}.donut{width:118px;height:118px}.exec-sidebar nav a{font-size:9px}}@media(max-width:520px){.kpi-grid{grid-template-columns:1fr}.header-right{display:grid;grid-template-columns:1fr 1fr}.reports-btn{grid-column:1/-1;text-align:center}.updated{min-width:0}.profile{min-width:0}.exec-sidebar nav{grid-template-columns:1fr}.exec-header h1{font-size:27px}.exec-main{padding:12px}.programme-content{padding:14px}.card-head{padding:13px 14px 11px}}`}</style>
  </div>;
}

function Kpi({ icon, label, value, link, note, tone }) { return <div className={`kpi ${tone || ''}`}>{icon && <span className="kpi-icon"><Icon type={icon}/></span>}<span className="kpi-label">{label}</span><strong className="kpi-value">{value}</strong><Link className="kpi-note" href={link}>{note}</Link></div>; }
function CardHead({ title, subtitle, action }) { return <div className="card-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{action && <span className="card-action">{action}</span>}</div>; }
function Metric({ title, value, icon }) { return <div className="metric-box">{icon && <span style={{ color: '#7B95AD', float: 'right' }}><Icon type={icon}/></span>}<span>{title}</span><strong>{value}</strong></div>; }
function Demo({ label, value, total }) { return <div className="demo"><div><div className="demo-head"><span>{label}</span><strong>{num(value).toLocaleString()}</strong></div><Progress value={total ? num(value) / total * 100 : 0} tone="blue"/></div></div>; }
function Ring({ label, value }) { return <div className="ring"><div className="ring-circle" style={{ '--value': Math.min(100, Math.max(0, Math.round(value))) }}><strong>{Math.round(value)}%</strong></div><span>{label}</span></div>; }
function Attention({ title, count, text, tone }) { return <div className="attention"><div className={`attention-count ${tone}`}>{count}</div><div className="attention-body"><strong>{title}</strong><span>{text}</span></div></div>; }
