'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const EMPTY = { project_id: '', code: '', title: '', description: '', lead_name: '', location: '', target_groups: '', expected_outputs: '', indicators: '', planned_start_date: '', planned_end_date: '', budget_estimate: '0', status: 'Draft' };
const STATUSES = ['Draft', 'Planned', 'Active', 'Completed', 'Cancelled'];
const money = value => new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', maximumFractionDigits: 2 }).format(Number(value) || 0);
function Field({ label, value, onChange, type = 'text', required = false, wide = false, placeholder = '' }) {
  return <label className={`pa-field ${wide ? 'wide' : ''}`}><span>{label}{required ? ' *' : ''}</span>{type === 'textarea' ? <textarea rows={3} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} /> : <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} />}</label>;
}
export default function ProgrammeActivitiesClient() {
  const [activities, setActivities] = useState([]), [projects, setProjects] = useState([]);
  const [form, setForm] = useState(EMPTY), [editing, setEditing] = useState(null), [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState(''), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/planned-activities', { cache: 'no-store', credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load planned activities.');
      setActivities(data.activities || []); setProjects(data.projects || []);
    } catch (e) { setError(e.message || 'Unable to load planned activities.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const filtered = useMemo(() => activities.filter(a => [a.code,a.title,a.project_name,a.programme_name,a.lead_name,a.location,a.status].join(' ').toLowerCase().includes(search.toLowerCase())), [activities, search]);
  const counts = { total: activities.length, active: activities.filter(a => a.status === 'Active').length, planned: activities.filter(a => ['Draft','Planned'].includes(a.status)).length, completed: activities.filter(a => a.status === 'Completed').length };
  function begin(row) {
    setEditing(row ? row.id : null);
    setForm(row ? { ...EMPTY, ...row, project_id: String(row.project_id), budget_estimate: String(row.budget_estimate ?? '0'), planned_start_date: row.planned_start_date || '', planned_end_date: row.planned_end_date || '' } : { ...EMPTY, project_id: projects[0]?.id ? String(projects[0].id) : '' });
    setShowForm(true); setError(''); setNotice('');
  }
  async function save(e) {
    e.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/planned-activities', { method: editing ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, ...(editing ? { id: editing } : {}) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save this activity.');
      setShowForm(false); setEditing(null); setNotice(editing ? 'Activity updated.' : 'Activity added to the plan.'); await load();
    } catch (e) { setError(e.message || 'Unable to save this activity.'); }
    finally { setSaving(false); }
  }
  async function archive(row) {
    if (!window.confirm(`Archive “${row.title}”? The historical record will be preserved.`)) return;
    setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/planned-activities?id=${row.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to archive this activity.');
      setNotice('Activity archived; historical record preserved.'); await load();
    } catch (e) { setError(e.message || 'Unable to archive this activity.'); }
  }
  return <main className="pa-page">
    <style>{`
      .pa-page{max-width:1440px;margin:0 auto;padding:28px 24px 64px;color:#102b46}.pa-header{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;flex-wrap:wrap}.pa-eyebrow{font-size:11px;font-weight:900;letter-spacing:.13em;color:#315c80}.pa-header h1{font-size:clamp(26px,3vw,36px);margin:8px 0}.pa-header p{color:#526a7d;margin:0;max-width:760px}.pa-btn{border:0;border-radius:9px;padding:11px 15px;font-weight:800;cursor:pointer}.pa-primary{background:#063b66;color:white}.pa-secondary{background:#edf2f7;color:#173b5c}.pa-btn:disabled{opacity:.6;cursor:wait}.pa-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:24px 0}.pa-stat,.pa-panel,.pa-form{border:1px solid #dbe5ed;border-radius:14px;background:#fff}.pa-stat{padding:17px}.pa-stat span{display:block;font-size:10px;letter-spacing:.1em;font-weight:900;color:#526a7d}.pa-stat strong{display:block;font-size:27px;margin:7px 0}.pa-stat small{color:#657b8d}.pa-panel{padding:18px}.pa-panel-top{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}.pa-panel h2{font-size:18px;margin:0 0 5px}.pa-panel p{color:#607589;font-size:13px;margin:0}.pa-search,.pa-field input,.pa-field textarea,.pa-field select{width:100%;border:1px solid #cbd8e2;border-radius:8px;padding:10px;font:inherit;background:#fff;color:#102b46}.pa-search{max-width:330px}.pa-alert{padding:11px 13px;border-radius:8px;margin:14px 0;font-size:13px}.pa-error{background:#fff0f0;color:#9b2525}.pa-notice{background:#edf8f0;color:#20643a}.pa-form{padding:18px;margin:16px 0}.pa-form-head,.pa-actions{display:flex;align-items:center;justify-content:space-between;gap:12px}.pa-form h3{margin:0 0 4px}.pa-form-head p{margin:0;color:#607589;font-size:13px}.pa-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin:18px 0}.pa-field{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:800}.pa-field.wide{grid-column:1/-1}.pa-field textarea{resize:vertical}.pa-table-wrap{overflow:auto;margin-top:14px}.pa-table{border-collapse:collapse;width:100%;min-width:850px;font-size:13px}.pa-table th,.pa-table td{padding:12px 10px;text-align:left;border-bottom:1px solid #e4ebf1;vertical-align:top}.pa-table th{font-size:10px;letter-spacing:.08em;color:#536a7d}.pa-table td small{display:block;color:#61788b;margin-top:4px}.pa-status{display:inline-block;padding:4px 8px;border-radius:999px;background:#eef3f7;font-size:11px;font-weight:800}.pa-row-actions{display:flex;gap:6px;flex-wrap:wrap}.pa-row-actions button{border:1px solid #d3dfe8;border-radius:7px;background:#fff;padding:6px 8px;cursor:pointer;font-weight:700;font-size:11px}.pa-empty{padding:36px 12px;text-align:center;color:#607589}.pa-empty strong{display:block;color:#173b5c;margin:8px}.pa-muted{color:#607589;font-size:12px}.pa-actions{justify-content:flex-end;margin-top:12px}.pa-project option{max-width:300px}@media(max-width:760px){.pa-page{padding:20px 13px 45px}.pa-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.pa-grid{grid-template-columns:1fr}.pa-field.wide{grid-column:auto}.pa-panel{padding:13px}}`}</style>
    <header className="pa-header"><div><div className="pa-eyebrow">VSI ADMINISTRATION · PROGRAMME OPERATIONS</div><h1>Planned Activities</h1><p>Turn approved programme and project plans into trackable activities with clear owners, timelines, outputs and budget estimates.</p></div><button className="pa-btn pa-primary" onClick={() => begin(null)} disabled={!projects.length}>＋ Add Activity</button></header>
    <section className="pa-stats"><div className="pa-stat"><span>PLANNED ACTIVITIES</span><strong>{counts.total}</strong><small>Current active register</small></div><div className="pa-stat"><span>ACTIVE</span><strong>{counts.active}</strong><small>Under implementation</small></div><div className="pa-stat"><span>PLANNED / DRAFT</span><strong>{counts.planned}</strong><small>Not yet completed</small></div><div className="pa-stat"><span>COMPLETED</span><strong>{counts.completed}</strong><small>Marked complete</small></div></section>
    <section className="pa-panel"><div className="pa-panel-top"><div><h2>Activity register</h2><p>Each activity must belong to a project. Budget figures are estimates, not financial approvals.</p></div><input className="pa-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity, project, lead…" /></div>
      {error && <div className="pa-alert pa-error" role="alert">{error}</div>}{notice && <div className="pa-alert pa-notice" role="status">{notice}</div>}
      {showForm && <form className="pa-form" onSubmit={save}><div className="pa-form-head"><div><h3>{editing ? 'Edit planned activity' : 'New planned activity'}</h3><p>Fields marked * are required.</p></div><button type="button" className="pa-btn pa-secondary" onClick={() => setShowForm(false)}>Close</button></div>
        <div className="pa-grid">
          <label className="pa-field"><span>Parent project *</span><select required value={form.project_id} onChange={e => setForm(v => ({...v,project_id:e.target.value}))}><option value="">Select project…</option>{projects.map(p => <option key={p.id} value={p.id}>{p.programme_code} · {p.project_name || p.name} ({p.code})</option>)}</select></label>
          <Field label="Unique activity code" value={form.code} onChange={v => setForm(s => ({...s,code:v.toUpperCase()}))} required placeholder="e.g. VSIYG-001" />
          <Field label="Activity title" value={form.title} onChange={v => setForm(s => ({...s,title:v}))} required placeholder="What will be delivered?" />
          <Field label="Activity lead / responsible officer" value={form.lead_name} onChange={v => setForm(s => ({...s,lead_name:v}))} />
          <Field label="Location / community" value={form.location} onChange={v => setForm(s => ({...s,location:v}))} />
          <Field label="Planned start date" type="date" value={form.planned_start_date} onChange={v => setForm(s => ({...s,planned_start_date:v}))} />
          <Field label="Planned end date" type="date" value={form.planned_end_date} onChange={v => setForm(s => ({...s,planned_end_date:v}))} />
          <Field label="Budget estimate (ZMW)" type="number" value={form.budget_estimate} onChange={v => setForm(s => ({...s,budget_estimate:v}))} />
          <label className="pa-field"><span>Status</span><select value={form.status} onChange={e => setForm(s => ({...s,status:e.target.value}))}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
          <Field label="Description / approach" type="textarea" wide value={form.description} onChange={v => setForm(s => ({...s,description:v}))} />
          <Field label="Target groups" type="textarea" wide value={form.target_groups} onChange={v => setForm(s => ({...s,target_groups:v}))} placeholder="Who should benefit?" />
          <Field label="Expected outputs" type="textarea" wide value={form.expected_outputs} onChange={v => setForm(s => ({...s,expected_outputs:v}))} placeholder="Specific deliverables expected from this activity" />
          <Field label="Indicators / evidence of completion" type="textarea" wide value={form.indicators} onChange={v => setForm(s => ({...s,indicators:v}))} placeholder="How completion and results will be measured" />
        </div>
        <div className="pa-actions"><button type="button" className="pa-btn pa-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="pa-btn pa-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create activity'}</button></div>
      </form>}
      {loading ? <div className="pa-empty">Loading activities…</div> : filtered.length === 0 ? <div className="pa-empty"><strong>{activities.length ? 'No matching activities' : 'No activities planned yet'}</strong><span>{activities.length ? 'Try another search.' : projects.length ? 'Add the first planned activity to a project.' : 'Create a programme and project first, then return here to plan activities.'}</span></div> : <div className="pa-table-wrap"><table className="pa-table"><thead><tr><th>ACTIVITY</th><th>PROGRAMME / PROJECT</th><th>OWNER &amp; LOCATION</th><th>TIMELINE</th><th>BUDGET ESTIMATE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{filtered.map(a => <tr key={a.id}><td><strong>{a.title}</strong><small>{a.code}</small></td><td>{a.programme_name}<small>{a.project_code} · {a.project_name}</small></td><td>{a.lead_name || 'Not assigned'}<small>{a.location || 'Location not set'}</small></td><td>{a.planned_start_date || '—'}<small>to {a.planned_end_date || '—'}</small></td><td>{money(a.budget_estimate)}</td><td><span className="pa-status">{a.status}</span></td><td><div className="pa-row-actions"><button onClick={() => begin(a)}>Edit</button><button onClick={() => archive(a)}>Archive</button></div></td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}
