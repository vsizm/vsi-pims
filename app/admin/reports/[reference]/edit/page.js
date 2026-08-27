'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const groups = [
  ['Report Overview', ['activity_title','activity_type','activity_date','directorate','programme','project','activity_code','venue','province','district','activity_description']],
  ['Reporter & Supervision', ['reporter_full_name','reporter_position','reporter_phone','reporter_email','supervisor_full_name','supervisor_position']],
  ['Activity & Results', ['target_group','participant_total','participant_female','participant_male','participant_other','objectives','activity_delivered','implementation_status','implementation_change','knowledge_skills','key_issues','participant_feedback','immediate_outcomes','notable_achievements','results_evidence','overall_assessment','assessment_explanation']],
  ['Finance & Follow-up', ['funding_source','donor_name','grant_title','grant_reference','approved_budget','actual_spent','budget_status','overspend_cause','challenges','challenges_addressed','lessons_learned','future_improvements','safeguarding_status']]
];
const labels = Object.fromEntries(groups.flatMap(([, fields]) => fields.map((x) => [x, x.replaceAll('_',' ').replace(/\b\w/g, (m) => m.toUpperCase())])));
const longFields = new Set(['activity_description','objectives','activity_delivered','implementation_change','knowledge_skills','key_issues','participant_feedback','immediate_outcomes','notable_achievements','results_evidence','assessment_explanation','challenges','challenges_addressed','lessons_learned','future_improvements']);
const dateFields = new Set(['activity_date']);
const numberFields = new Set(['participant_total','participant_female','participant_male','participant_other','approved_budget','actual_spent']);

export default function EditReport({ params }) {
  const [reference, setReference] = useState(''); const [form, setForm] = useState({}); const [meta, setMeta] = useState({}); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  useEffect(() => { Promise.resolve(params).then((p) => { const ref = decodeURIComponent(p.reference); setReference(ref); return fetch(`/api/admin/activity-reports/${encodeURIComponent(ref)}`, { cache: 'no-store' }); }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Unable to load report.'); return d.report; }).then((r) => { const next = {}; groups.flatMap(([, fs]) => fs).forEach((key) => { next[key] = r[key] ?? ''; }); setForm(next); setMeta(r); }).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);
  const change = (key, value) => setForm((x) => ({ ...x, [key]: value }));
  async function save(e) { e.preventDefault(); setSaving(true); setMessage(''); setError(''); try { const response = await fetch('/api/admin/activity-reports/manage', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, fields: form, actor: 'Administrator' }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to save changes.'); setMessage('Changes saved successfully.'); setMeta((x) => ({ ...x, ...form, updated_at: new Date().toISOString(), last_edited_by: 'Administrator' })); } catch (e) { setError(e.message); } finally { setSaving(false); } }
  if (loading) return <main className="page"><div className="shell"><div className="vsi-document-empty">Loading report…</div></div></main>;
  if (error && !reference) return <main className="page"><div className="shell"><div className="error">{error}</div></div></main>;
  return <main className="page">
    <div className="topbar"><div className="topbar-inner"><div className="brand"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" className="vsi-logo" /></div><span>ACTIVITY REPORT</span><div className="social-links"><a href="https://web.facebook.com/vsizambia" target="_blank" rel="noreferrer">f</a><a href="https://www.linkedin.com/in/visionary-students-initiative-vsi-0a447238/" target="_blank" rel="noreferrer">in</a><a href="https://www.instagram.com/vsizambia" target="_blank" rel="noreferrer">◎</a><a href="https://www.youtube.com/@vsizambia" target="_blank" rel="noreferrer">▶</a><a href="https://www.vsizambia.org" target="_blank" rel="noreferrer">↗</a><Link href="/admin/reports" className="small-btn" style={{ marginLeft: 6, color: '#fff', borderColor: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Reports</Link></div></div></div>
    <div className="shell"><header className="form-intro"><p><strong>VSI ADMINISTRATION · EDIT ACTIVITY REPORT</strong><br />Edit the submitted record and save changes. The original report reference remains unchanged.</p></header>
      <div style={{ display:'flex', justifyContent:'space-between', gap:16, alignItems:'center', flexWrap:'wrap', marginBottom:18 }}><div><p className="kicker">EDIT REPORT</p><h1 style={{ margin:0, color:'var(--regal-navy)' }}>{reference}</h1><p style={{ color:'var(--muted)', marginBottom:0 }}>Received: {meta.received_at ? new Date(meta.received_at).toLocaleString() : '—'} · Last edited: {meta.updated_at ? new Date(meta.updated_at).toLocaleString() : '—'}{meta.last_edited_by ? ` by ${meta.last_edited_by}` : ''}</p></div><Link href={`/admin/reports/${encodeURIComponent(reference)}`} className="small-btn" style={{ textDecoration:'none' }}>← Review</Link></div>
      {error && <div className="error" style={{ marginBottom:16 }}>{error}</div>}{message && <div className="notice" style={{ marginBottom:16 }}>{message}</div>}
      <form onSubmit={save}>{groups.map(([title, fields], gi) => <section className="section" key={title}><div className="section-head"><span className="number">{String(gi+1).padStart(2,'0')}</span><div><h2>{title}</h2><p>Administrative editing of submitted information.</p></div></div><div className="section-body"><div className="grid">{fields.map((key) => <label key={key}>{labels[key]}{longFields.has(key) ? <textarea rows={4} value={form[key] ?? ''} onChange={(e) => change(key, e.target.value)} /> : <input type={dateFields.has(key) ? 'date' : numberFields.has(key) ? 'number' : 'text'} value={form[key] ?? ''} onChange={(e) => change(key, e.target.value)} />}</label>)}</div></div></section>)}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', margin:'22px 0 40px' }}><Link href={`/admin/reports/${encodeURIComponent(reference)}`} className="small-btn" style={{ textDecoration:'none' }}>Cancel</Link><button className="primary-btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button></div>
      </form>
    </div>
  </main>;
}
