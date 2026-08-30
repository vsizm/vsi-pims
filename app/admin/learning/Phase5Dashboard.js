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
  ['Learning & Follow-up', '/admin/learning'],
];

const num = (v) => Number(v ?? 0) || 0;
const first = (o, keys, fallback = '') => keys.map(k => o?.[k]).find(v => v !== undefined && v !== null && v !== '') ?? fallback;
const json = (v, fallback = []) => { if (!v) return fallback; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return fallback; } };
const dateOnly = (v) => v ? new Date(v).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const daysUntil = (v) => { if (!v) return null; const d = new Date(v); if (Number.isNaN(d.getTime())) return null; return Math.ceil((d.getTime() - Date.now()) / 86400000); };

function Sidebar() {
  return <aside className="p5-sidebar">
    <div className="p5-brand"><div className="p5-logo"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" /></div><div><strong>VSI IMS</strong><small>ADMINISTRATION</small></div></div>
    <div className="p5-label">WORKSPACE</div>
    <nav>{NAV.slice(0,4).map(([label,href]) => <Link key={label} href={href}><span className="p5-dot" />{label}</Link>)}</nav>
    <div className="p5-label">INTELLIGENCE</div>
    <nav>{NAV.slice(4).map(([label,href]) => <Link key={label} href={href} className={label === 'Learning & Follow-up' ? 'active' : ''}><span className="p5-dot gold" />{label}</Link>)}</nav>
    <div className="p5-note">Institutional learning turns completed activity reporting into practical follow-up and programme improvement.</div>
    <Link className="p5-back" href="/activity-report">Open Activity Report ↗</Link>
  </aside>;
}

function normaliseActions(report) {
  const raw = first(report, ['follow_up_actions', 'followUpActions'], []);
  const list = json(raw, []);
  return Array.isArray(list) ? list.map((x, i) => ({
    id: `${report.reference}-${i}`,
    action: x?.action || x?.description || x?.task || '',
    responsible: x?.responsible || x?.assignee || x?.assignedTo || '',
    deadline: x?.deadline || x?.dueDate || x?.due_date || '',
    status: x?.status || 'Pending',
    reference: report.reference,
    activity: first(report, ['activity_title', 'activityTitle'], 'Activity'),
  })).filter(x => x.action || x.responsible || x.deadline) : [];
}

function text(value) {
  if (value === null || value === undefined || value === '') return 'Not recorded';
  return String(value);
}

export default function Phase5Dashboard() {
  const [reports, setReports] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/admin/activity-reports', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load institutional learning intelligence.');
        const approved = (data.reports || []).filter(r => r.review_status === 'APPROVED');
        const details = await Promise.all(approved.map(async r => {
          try {
            const response = await fetch(`/api/admin/activity-reports/${encodeURIComponent(r.reference)}`, { cache: 'no-store' });
            const data = await response.json();
            return data.report || r;
          } catch { return r; }
        }));
        if (!cancelled) setReports(details);
      } catch (e) { if (!cancelled) setError(e.message); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const actions = useMemo(() => reports.flatMap(normaliseActions), [reports]);
  const actionStats = useMemo(() => {
    const pending = actions.filter(a => String(a.status).toLowerCase() === 'pending').length;
    const progress = actions.filter(a => /in.?progress/i.test(String(a.status))).length;
    const complete = actions.filter(a => /complete/i.test(String(a.status))).length;
    const overdue = actions.filter(a => { const d = daysUntil(a.deadline); return d !== null && d < 0 && !/complete/i.test(String(a.status)); }).length;
    return { total: actions.length, pending, progress, complete, overdue };
  }, [actions]);

  const learning = useMemo(() => {
    const withChallenges = reports.filter(r => text(first(r, ['challenges'])).toLowerCase() !== 'not recorded');
    const withLessons = reports.filter(r => text(first(r, ['lessons_learned', 'lessonsLearned'])).toLowerCase() !== 'not recorded');
    const withImprovements = reports.filter(r => text(first(r, ['future_improvements', 'futureImprovements'])).toLowerCase() !== 'not recorded');
    const addressed = reports.filter(r => text(first(r, ['challenges_addressed', 'challengesAddressed'])).toLowerCase() !== 'not recorded');
    return { withChallenges, withLessons, withImprovements, addressed };
  }, [reports]);

  const programmeLearning = useMemo(() => {
    const map = new Map();
    reports.forEach(r => {
      const programme = first(r, ['programme', 'programme_name', 'programmeName'], 'Unspecified');
      const row = map.get(programme) || { programme, reports: 0, challenges: 0, lessons: 0, improvements: 0 };
      row.reports += 1;
      if (text(first(r, ['challenges'])).toLowerCase() !== 'not recorded') row.challenges += 1;
      if (text(first(r, ['lessons_learned', 'lessonsLearned'])).toLowerCase() !== 'not recorded') row.lessons += 1;
      if (text(first(r, ['future_improvements', 'futureImprovements'])).toLowerCase() !== 'not recorded') row.improvements += 1;
      map.set(programme, row);
    });
    return [...map.values()].sort((a,b) => b.reports - a.reports);
  }, [reports]);

  return <div className="p5-app"><Sidebar/><main className="p5-main">
    <header className="p5-header"><div><div className="p5-kicker">VSI ADMINISTRATION · PHASE 5</div><h1>Learning &amp; Follow-up Intelligence</h1><p>Turn approved activity reports into accountable follow-up, institutional learning and practical programme improvement.</p></div><Link href="/admin/reports?status=APPROVED" className="p5-action">Approved Reports →</Link></header>
    {loading && <div className="p5-message">Loading institutional learning intelligence…</div>}
    {error && <div className="p5-message error">{error}</div>}
    {!loading && !error && <>
      <section className="p5-kpis">
        <div><span>APPROVED REPORTS</span><strong>{reports.length}</strong><small>Trusted learning dataset</small></div>
        <div><span>FOLLOW-UP ACTIONS</span><strong>{actionStats.total}</strong><small>{actionStats.overdue} overdue</small></div>
        <div><span>ACTIONS COMPLETE</span><strong>{actionStats.complete}</strong><small>Closed follow-up items</small></div>
        <div><span>LESSONS CAPTURED</span><strong>{learning.withLessons.length}</strong><small>Reports with lessons learned</small></div>
        <div><span>IMPROVEMENTS</span><strong>{learning.withImprovements.length}</strong><small>Future improvements recorded</small></div>
      </section>

      <section className="p5-grid">
        <article className="p5-card wide"><div className="p5-card-head"><div><span>SECTION 10 · FOLLOW-UP ACTIONS</span><h2>Operational follow-up tracker</h2></div><span className="p5-count">{actionStats.total} actions</span></div>
          <div className="p5-action-summary"><div><strong>{actionStats.pending}</strong><small>Pending</small></div><div><strong>{actionStats.progress}</strong><small>In Progress</small></div><div><strong>{actionStats.complete}</strong><small>Complete</small></div><div className={actionStats.overdue ? 'hot' : ''}><strong>{actionStats.overdue}</strong><small>Overdue</small></div></div>
          {actions.length ? <div className="p5-table-wrap"><table><thead><tr><th>Activity</th><th>Follow-up action</th><th>Responsible</th><th>Deadline</th><th>Status</th></tr></thead><tbody>{actions.slice(0,30).map(a => { const d = daysUntil(a.deadline); const overdue = d !== null && d < 0 && !/complete/i.test(String(a.status)); return <tr key={a.id}><td><strong>{a.activity}</strong><small>{a.reference}</small></td><td>{text(a.action)}</td><td>{text(a.responsible)}</td><td className={overdue ? 'overdue' : ''}>{dateOnly(a.deadline)}{overdue && <small>Overdue</small>}</td><td><span className={`p5-status ${String(a.status).toLowerCase().replace(/\s+/g,'-')}`}>{a.status}</span></td></tr>; })}</tbody></table></div> : <div className="p5-empty">No follow-up actions have been recorded in approved reports yet. As Section 10 actions are submitted and reports are approved, they will appear here.</div>}
        </article>

        <article className="p5-card"><div className="p5-card-head"><div><span>SECTION 08 · RESULTS &amp; LESSONS</span><h2>Institutional learning coverage</h2></div></div><div className="p5-coverage"><div><span>Challenges captured</span><strong>{learning.withChallenges.length}</strong><i style={{width:`${reports.length ? Math.round(learning.withChallenges.length/reports.length*100) : 0}%`}}/></div><div><span>Challenges addressed</span><strong>{learning.addressed.length}</strong><i style={{width:`${reports.length ? Math.round(learning.addressed.length/reports.length*100) : 0}%`}}/></div><div><span>Lessons learned</span><strong>{learning.withLessons.length}</strong><i style={{width:`${reports.length ? Math.round(learning.withLessons.length/reports.length*100) : 0}%`}}/></div><div><span>Future improvements</span><strong>{learning.withImprovements.length}</strong><i style={{width:`${reports.length ? Math.round(learning.withImprovements.length/reports.length*100) : 0}%`}}/></div></div></article>

        <article className="p5-card"><div className="p5-card-head"><div><span>LEARNING SIGNALS</span><h2>Recent lessons learned</h2></div></div><div className="p5-feed">{learning.withLessons.length ? learning.withLessons.slice(0,6).map(r => <div className="p5-feed-row" key={`lesson-${r.reference}`}><strong>{first(r,['activity_title','activityTitle'],'Activity')}</strong><p>{text(first(r,['lessons_learned','lessonsLearned']))}</p><small>{first(r,['programme','programme_name'],'Unspecified')} · {r.reference}</small></div>) : <div className="p5-empty">Lessons learned will appear here as approved reports capture Section 08 learning.</div>}</div></article>

        <article className="p5-card wide"><div className="p5-card-head"><div><span>ADAPTIVE PROGRAMMING</span><h2>Future improvements recorded by officers</h2></div></div><div className="p5-feed p5-feed-grid">{learning.withImprovements.length ? learning.withImprovements.slice(0,8).map(r => <div className="p5-feed-row" key={`improve-${r.reference}`}><strong>{first(r,['activity_title','activityTitle'],'Activity')}</strong><p>{text(first(r,['future_improvements','futureImprovements']))}</p><small>Programme: {first(r,['programme','programme_name'],'Unspecified')}</small></div>) : <div className="p5-empty">Future improvements will appear here after officers record Section 08 recommendations.</div>}</div></article>

        <article className="p5-card wide"><div className="p5-card-head"><div><span>PROGRAMME LEARNING PROFILE</span><h2>Where learning is being captured</h2></div></div>{programmeLearning.length ? <div className="p5-programmes">{programmeLearning.map(p => <div className="p5-programme" key={p.programme}><div><strong>{p.programme}</strong><small>{p.reports} approved report{p.reports === 1 ? '' : 's'}</small></div><div className="p5-programme-metrics"><span>Challenges <b>{p.challenges}</b></span><span>Lessons <b>{p.lessons}</b></span><span>Improvements <b>{p.improvements}</b></span></div></div>)}</div> : <div className="p5-empty">Programme learning profiles will populate as approved reports are available.</div>}</article>

        <article className="p5-card wide"><div className="p5-card-head"><div><span>MANAGEMENT INTERPRETATION</span><h2>Learning-to-action signal</h2></div></div><div className="p5-callout"><strong>{actionStats.overdue ? `${actionStats.overdue} follow-up ${actionStats.overdue === 1 ? 'action is' : 'actions are'} overdue.` : 'No overdue follow-up actions.'}</strong><p>{learning.withLessons.length ? `${learning.withLessons.length} approved report${learning.withLessons.length === 1 ? '' : 's'} contain lessons learned, providing an evidence base for future programme decisions.` : 'Institutional learning will strengthen as officers record lessons learned and future improvements in Section 08.'}</p><Link href="/admin/reports?status=APPROVED">Open approved reports →</Link></div></article>
      </section>
    </>}
  </main><style jsx>{`
.p5-app{min-height:100vh;width:100%;display:flex;background:#f4f7fa;color:#17212b;font-family:Arial,Helvetica,sans-serif;overflow-x:hidden}.p5-app *{box-sizing:border-box}.p5-sidebar{position:sticky;top:0;width:250px;min-width:250px;height:100vh;padding:20px 14px;display:flex;flex-direction:column;background:linear-gradient(180deg,#003566 0%,#094074 58%,#082f52 100%);color:#fff;box-shadow:8px 0 24px rgba(0,53,102,.12);overflow:hidden}.p5-brand{display:flex;align-items:center;gap:10px;height:56px;padding:2px 8px 14px;border-bottom:1px solid rgba(255,255,255,.14);min-width:0}.p5-logo{width:40px;height:34px;min-width:40px;display:flex;align-items:center;justify-content:center;overflow:hidden}.p5-logo img{display:block;width:40px;height:28px;max-width:40px;max-height:28px;object-fit:contain}.p5-brand strong{display:block;font-size:16px;line-height:1.15;letter-spacing:.06em;white-space:nowrap}.p5-brand small{display:block;margin-top:3px;color:#ffd60a;font-size:9px;font-weight:900;letter-spacing:.13em;white-space:nowrap}.p5-label{padding:20px 10px 8px;color:rgba(255,255,255,.58);font-size:10px;font-weight:900;letter-spacing:.16em}.p5-sidebar nav{display:flex;flex-direction:column;gap:3px}.p5-sidebar nav a{display:flex;align-items:center;gap:9px;min-height:36px;padding:10px 11px;border-radius:9px;color:rgba(255,255,255,.84);text-decoration:none;font-size:12px;font-weight:800;white-space:nowrap;overflow:hidden}.p5-sidebar nav a:hover{background:rgba(255,255,255,.09);color:#fff}.p5-sidebar nav a.active{background:#ffc300;color:#003566}.p5-dot{width:7px;height:7px;min-width:7px;border-radius:50%;background:#3c6997}.p5-dot.gold{background:#ffd60a}.active .p5-dot{background:#003566}.p5-note{padding:16px 10px 0;color:rgba(255,255,255,.66);font-size:10px;line-height:1.55}.p5-back{margin-top:auto;padding:10px 11px;border-radius:9px;background:#ffd60a;color:#003566;text-align:center;text-decoration:none;font-size:11px;font-weight:900;white-space:nowrap}.p5-main{min-width:0;flex:1;padding:30px clamp(20px,3.5vw,44px) 56px;overflow:hidden}.p5-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:24px}.p5-kicker{margin-bottom:7px;color:#3c6997;font-size:10px;font-weight:900;letter-spacing:.14em}.p5-header h1{margin:0;color:#003566;font-size:clamp(27px,3vw,38px);line-height:1.05;letter-spacing:-.03em}.p5-header p{margin:8px 0 0;color:#65717d;max-width:760px;font-size:13px;line-height:1.55}.p5-action{padding:10px 13px;border:1px solid #dfe5ea;border-radius:9px;background:#fff;color:#003566;text-decoration:none;font-size:11px;font-weight:900;white-space:nowrap}.p5-message{padding:16px;border:1px solid #dfe5ea;border-radius:10px;background:#fff;color:#65717d}.p5-message.error{color:#9a2525}.p5-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:16px}.p5-kpis>div{min-width:0;padding:14px;background:#fff;border:1px solid #dfe5ea;border-top:3px solid #3c6997;border-radius:11px}.p5-kpis>div:nth-child(2){border-top-color:#ffc300}.p5-kpis>div:nth-child(3){border-top-color:#2e7d52}.p5-kpis>div:nth-child(4){border-top-color:#094074}.p5-kpis>div:nth-child(5){border-top-color:#ffd60a}.p5-kpis span{display:block;color:#65717d;font-size:8px;font-weight:900;letter-spacing:.1em}.p5-kpis strong{display:block;margin:6px 0 3px;color:#003566;font-size:25px}.p5-kpis small{color:#65717d;font-size:10px}.p5-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.p5-card{min-width:0;background:#fff;border:1px solid #dfe5ea;border-radius:14px;padding:20px;box-shadow:0 4px 18px rgba(0,53,102,.045);overflow:hidden}.p5-card.wide{grid-column:span 2}.p5-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px}.p5-card-head span:first-child{color:#3c6997;font-size:9px;font-weight:900;letter-spacing:.13em}.p5-card-head h2{margin:4px 0 0;color:#003566;font-size:17px;line-height:1.25}.p5-count{color:#65717d!important;font-size:10px!important;letter-spacing:0!important;white-space:nowrap}.p5-action-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:16px}.p5-action-summary>div{padding:12px;border-radius:9px;background:#f6f9fb}.p5-action-summary strong{display:block;color:#003566;font-size:21px}.p5-action-summary small{color:#65717d;font-size:10px}.p5-action-summary .hot strong{color:#b42318}.p5-table-wrap{overflow:auto;border:1px solid #dfe5ea;border-radius:10px}.p5-table-wrap table{width:100%;min-width:850px;border-collapse:collapse;table-layout:fixed}.p5-table-wrap th{padding:10px;text-align:left;background:#f4f7fa;color:#52606d;font-size:9px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}.p5-table-wrap td{padding:11px 10px;border-top:1px solid #e7edf1;color:#36434f;font-size:11px;vertical-align:top}.p5-table-wrap td strong{display:block;color:#003566}.p5-table-wrap td small{display:block;margin-top:3px;color:#65717d;font-size:9px}.p5-table-wrap .overdue{color:#b42318;font-weight:800}.p5-status{display:inline-flex;padding:5px 9px;border-radius:999px;background:#fff4cc;color:#8a5a00;font-size:9px;font-weight:900;white-space:nowrap}.p5-status.in-progress{background:#e0efff;color:#094074}.p5-status.complete{background:#dcfce7;color:#15803d}.p5-coverage{display:flex;flex-direction:column;gap:13px}.p5-coverage>div{position:relative}.p5-coverage span{display:block;color:#52606d;font-size:10px}.p5-coverage strong{position:absolute;right:0;top:0;color:#003566;font-size:12px}.p5-coverage i{display:block;height:7px;margin-top:6px;border-radius:5px;background:#ffc300}.p5-feed{display:flex;flex-direction:column}.p5-feed-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.p5-feed-row{padding:12px 0;border-bottom:1px solid #e7edf1}.p5-feed-grid .p5-feed-row{padding:13px;background:#f6f9fb;border-radius:9px;border:0}.p5-feed-row:last-child{border-bottom:0}.p5-feed-row strong{display:block;color:#003566;font-size:11px}.p5-feed-row p{margin:5px 0;color:#36434f;font-size:11px;line-height:1.55}.p5-feed-row small{color:#65717d;font-size:9px}.p5-empty{padding:15px;border-radius:9px;background:#f6f9fb;color:#65717d;font-size:11px;line-height:1.55}.p5-programmes{display:flex;flex-direction:column}.p5-programme{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:13px 0;border-bottom:1px solid #e7edf1}.p5-programme:last-child{border-bottom:0}.p5-programme strong{display:block;color:#003566;font-size:12px}.p5-programme small{display:block;margin-top:3px;color:#65717d;font-size:10px}.p5-programme-metrics{display:flex;gap:16px;flex-wrap:wrap;justify-content:flex-end}.p5-programme-metrics span{color:#65717d;font-size:10px}.p5-programme-metrics b{color:#003566;margin-left:4px}.p5-callout{padding:18px;border-left:4px solid #ffc300;background:#f6f9fb;border-radius:0 10px 10px 0}.p5-callout strong{display:block;color:#003566;font-size:16px}.p5-callout p{margin:7px 0 12px;color:#65717d;font-size:11px;line-height:1.55}.p5-callout a{color:#094074;text-decoration:none;font-size:11px;font-weight:900}@media(max-width:1100px){.p5-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:900px){.p5-sidebar{width:210px;min-width:210px}.p5-grid{grid-template-columns:1fr}.p5-card.wide{grid-column:span 1}.p5-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.p5-header{flex-direction:column}.p5-feed-grid{grid-template-columns:1fr}}@media(max-width:650px){.p5-app{display:block}.p5-sidebar{position:relative;width:100%;height:auto;min-width:0;max-height:none}.p5-note{display:none}.p5-sidebar nav{display:flex;flex-direction:row;overflow:auto}.p5-sidebar nav a{flex:0 0 auto}.p5-main{padding:22px 14px 40px}.p5-kpis{grid-template-columns:1fr}.p5-action-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.p5-programme{align-items:flex-start;flex-direction:column}.p5-programme-metrics{justify-content:flex-start}}
`}</style></div>;
