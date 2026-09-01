'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const NAV=[['Dashboard','/admin'],['Activity Reports','/admin/reports'],['Pending Review','/admin/reports?status=PENDING_REVIEW'],['Approved Reports','/admin/reports?status=APPROVED'],['Finance Intelligence','/admin/finance'],['MEAL Intelligence','/admin/meal'],['Accountability and Learning','/admin/learning']];
const first=(o,keys,fallback='')=>keys.map(k=>o?.[k]).find(v=>v!==undefined&&v!==null&&v!=='')??fallback;
const text=v=>v===null||v===undefined||v===''?'Not recorded':String(v);

function Sidebar(){return <aside className="admin-sidebar"><div className="side-brand"><div className="side-logo-wrap"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative"/></div><div className="side-brand-copy"><strong>VSI IMS</strong><small>ADMINISTRATION</small></div></div><div className="side-label">WORKSPACE</div><nav>{NAV.slice(0,4).map(([label,href])=><Link key={label} href={href}><span className="nav-dot"/>{label}</Link>)}</nav><div className="side-label intelligence">INTELLIGENCE</div><nav>{NAV.slice(4).map(([label,href])=><Link key={label} href={href} className={label==='Accountability and Learning'?'active':''}><span className="nav-dot intel-dot"/>{label}</Link>)}</nav><div className="side-note">Institutional learning turns completed activity reporting into practical accountability, learning and programme improvement.</div><Link className="back-report" href="/activity-report">Open Activity Report ↗</Link></aside>}

export default function Phase5Dashboard(){
 const [reports,setReports]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let dead=false;(async()=>{try{const r=await fetch('/api/admin/activity-reports',{cache:'no-store'}),d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to load accountability and learning intelligence.');const approved=(d.reports||[]).filter(x=>x.review_status==='APPROVED');const full=await Promise.all(approved.map(async x=>{try{const rr=await fetch(`/api/admin/activity-reports/${encodeURIComponent(x.reference)}`,{cache:'no-store'}),dd=await rr.json();return dd.report||x}catch{return x}}));if(!dead)setReports(full)}catch(e){if(!dead)setError(e.message)}finally{if(!dead)setLoading(false)}})();return()=>{dead=true}},[]);
 const learning=useMemo(()=>({challenges:reports.filter(r=>first(r,['challenges'])).length,addressed:reports.filter(r=>first(r,['challenges_addressed','challengesAddressed'])).length,lessons:reports.filter(r=>first(r,['lessons_learned','lessonsLearned'])).length,improvements:reports.filter(r=>first(r,['future_improvements','futureImprovements'])).length}),[reports]);
 const programmeLearning=useMemo(()=>{const m=new Map();reports.forEach(r=>{const name=first(r,['programme','programme_name','programmeName'],'Unspecified');const x=m.get(name)||{name,reports:0,challenges:0,lessons:0,improvements:0};x.reports++;if(first(r,['challenges']))x.challenges++;if(first(r,['lessons_learned','lessonsLearned']))x.lessons++;if(first(r,['future_improvements','futureImprovements']))x.improvements++;m.set(name,x)});return[...m.values()]},[reports]);
 const coverage=v=>reports.length?Math.round(v/reports.length*100):0;
 const lessonReports=reports.filter(r=>first(r,['lessons_learned','lessonsLearned']));
 const improvementReports=reports.filter(r=>first(r,['future_improvements','futureImprovements']));
 return <div className="admin-app"><Sidebar/><main className="admin-main learning-page">
   <header className="admin-header"><div><div className="admin-kicker">VSI ADMINISTRATION · PHASE 5</div><h1>Accountability &amp; Learning Intelligence</h1><p>Turn approved activity reports into accountable learning and practical programme improvement.</p></div><Link href="/admin/reports?status=APPROVED" className="header-action">Approved Reports →</Link></header>
   {loading&&<div className="admin-notice">Loading accountability and learning intelligence…</div>}
   {error&&<div className="admin-error">{error}</div>}
   {!loading&&!error&&<>
    <section className="stat-grid p5-stat-grid">
      <Link className="stat-link" href="/admin/reports?status=APPROVED"><div className="stat-card navy"><span>APPROVED REPORTS</span><strong>{reports.length}</strong><small>Trusted learning dataset</small></div></Link>
      <div className="stat-card green"><span>LESSONS CAPTURED</span><strong>{learning.lessons}</strong><small>Reports with lessons learned</small></div>
      <div className="stat-card"><span>CHALLENGES CAPTURED</span><strong>{learning.challenges}</strong><small>Reports recording challenges</small></div>
      <div className="stat-card"><span>IMPROVEMENTS RECORDED</span><strong>{learning.improvements}</strong><small>Future improvements captured</small></div>
    </section>

    <section className="dashboard-grid">
      <article className="dash-panel wide learning-panel"><div className="panel-head learning-head"><div><span>PROGRAMME LEARNING PROFILE</span><h2>Where learning is being captured</h2></div></div>{programmeLearning.length?<div className="programme-list learning-body">{programmeLearning.map(p=><div className="programme-row" key={p.name}><div><strong>{p.name}</strong><small>{p.reports} approved report{p.reports===1?'':'s'}</small></div><div className="p5-programme-metrics"><span>Challenges <b>{p.challenges}</b></span><span>Lessons <b>{p.lessons}</b></span><span>Improvements <b>{p.improvements}</b></span></div></div>)}</div>:<div className="empty learning-body">Programme learning profiles will populate as approved reports are available.</div>}</article>

      <article className="dash-panel learning-panel"><div className="panel-head learning-head"><div><span>SECTION 08 · RESULTS &amp; LESSONS</span><h2>Institutional learning coverage</h2></div></div><div className="p5-bars learning-body">{[['Challenges captured',learning.challenges],['Challenges addressed',learning.addressed],['Lessons learned',learning.lessons],['Future improvements',learning.improvements]].map(([label,value])=><div key={label}><div><span>{label}</span><strong>{value}</strong></div><div className="p5-bar"><i style={{width:`${coverage(value)}%`}}/></div></div>)}</div></article>

      <article className="dash-panel learning-panel"><div className="panel-head learning-head"><div><span>LEARNING SIGNALS</span><h2>Recent lessons learned</h2></div></div>{lessonReports.length?<div className="p5-feed learning-body">{lessonReports.slice(0,6).map(r=><div className="p5-feed-row" key={r.reference}><strong>{first(r,['activity_title','activityTitle'],'Activity')}</strong><p>{text(first(r,['lessons_learned','lessonsLearned']))}</p><small>{first(r,['programme','programme_name'],'Unspecified')} · {r.reference}</small></div>)}</div>:<div className="empty learning-body">Lessons learned will appear here as approved reports capture Section 08 learning.</div>}</article>

      <article className="dash-panel wide learning-panel"><div className="panel-head learning-head"><div><span>ADAPTIVE PROGRAMMING</span><h2>Future improvements recorded by officers</h2></div></div>{improvementReports.length?<div className="p5-improvement-grid learning-body">{improvementReports.slice(0,8).map(r=><div className="p5-improvement" key={r.reference}><strong>{first(r,['activity_title','activityTitle'],'Activity')}</strong><p>{text(first(r,['future_improvements','futureImprovements']))}</p><small>Programme: {first(r,['programme','programme_name'],'Unspecified')}</small></div>)}</div>:<div className="empty learning-body">Future improvements will appear here after officers record Section 08 recommendations.</div>}</article>

      <article className="dash-panel wide learning-panel"><div className="panel-head learning-head"><div><span>MANAGEMENT INTERPRETATION</span><h2>Learning-to-action signal</h2></div></div><div className="p5-callout learning-body"><strong>{learning.lessons?`${learning.lessons} approved report${learning.lessons===1?'':'s'} contain lessons learned.`:'No lessons learned have been captured yet.'}</strong><p>{learning.lessons?`These lessons provide an evidence base for future programme decisions and accountability.`:'Institutional learning will strengthen as officers record lessons learned and future improvements in Section 08.'}</p><Link href="/admin/reports?status=APPROVED">Open approved reports →</Link></div></article>
    </section>
   </>}
 </main><style jsx>{`
.learning-page .p5-stat-grid{margin-bottom:20px}
.learning-page .learning-panel{background:#fff;border:1px solid #e2e8ee;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,45,98,.04)}
.learning-page .learning-head{position:relative;display:flex;align-items:center;gap:16px;min-height:78px;padding:20px 24px;background:#002D62;border:0;border-radius:16px 16px 0 0;color:#fff;overflow:hidden}
.learning-page .learning-head::before{content:'◆';width:40px;height:40px;flex:0 0 40px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#FFC107;color:#002D62;font-size:12px;font-weight:900;line-height:1}
.learning-page .learning-head>div{min-width:0;display:flex;flex-direction:column;gap:4px}
.learning-page .learning-head span{color:#fff;font-size:11px;font-weight:800;letter-spacing:.1em}
.learning-page .learning-head h2{margin:0;color:#fff;font-size:20px;font-weight:700;letter-spacing:.01em}
.learning-page .learning-body{padding:20px 24px}
.learning-page .programme-list.learning-body{padding-top:6px;padding-bottom:6px}
.learning-page .programme-row{padding:16px 0;border-bottom:1px solid #e7edf1}
.learning-page .programme-row:last-child{border-bottom:0}
.learning-page .p5-bars.learning-body{gap:18px}
.learning-page .p5-feed.learning-body{padding-top:8px;padding-bottom:8px}
.learning-page .p5-feed-row{padding:14px 0;border-bottom:1px solid #e7edf1}
.learning-page .p5-improvement-grid.learning-body{padding-top:20px}
.learning-page .p5-improvement{background:#f6f9fb;border:1px solid #e8eef3;border-radius:10px}
.learning-page .p5-callout.learning-body{margin:20px 24px;padding:18px;border-left:4px solid #FFC107;background:#f6f9fb;border-radius:0 10px 10px 0}
.learning-page .p5-callout.learning-body{padding-left:18px}
.learning-page .p5-bar{background:#edf1f4;height:8px}
.learning-page .p5-bar i{background:#FFC107}
.learning-page .p5-programme-metrics b{color:#002D62}
@media(max-width:700px){.learning-page .learning-head{padding:16px 18px;gap:12px}.learning-page .learning-head::before{width:36px;height:36px;flex-basis:36px}.learning-page .learning-body{padding:16px 18px}.learning-page .p5-callout.learning-body{margin:16px 18px}}
`}</style></div>;
}
