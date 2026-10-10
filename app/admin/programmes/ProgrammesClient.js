'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const EMPTY_PROGRAMME = { code: '', name: '', description: '', directorate: '', lead_name: '', objectives: '', target_groups: '', start_date: '', end_date: '', status: 'Draft' };
const EMPTY_PROJECT = { programme_id: '', code: '', name: '', description: '', project_lead: '', objectives: '', indicators: '', target_groups: '', start_date: '', end_date: '', status: 'Draft' };
const PROGRAMME_STATUSES = ['Draft', 'Active', 'On Hold', 'Completed'];
const PROJECT_STATUSES = ['Draft', 'Planned', 'Active', 'On Hold', 'Completed'];

function dateLabel(value) {
  if (!value) return 'Not set';
  const date = new Date(value + 'T00:00:00');
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
function Field({ label, value, onChange, type = 'text', required = false, placeholder = '', wide = false, options }) {
  return <label className={`pm-field ${wide ? 'wide' : ''}`}><span>{label}{required ? ' *' : ''}</span>
    {options ? <select value={value ?? ''} onChange={e => onChange(e.target.value)} required={required}><option value="">Select…</option>{options.map(option => <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>)}</select>
      : type === 'textarea' ? <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
      : <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} />}</label>;
}

export default function ProgrammesClient() {
  const [tab, setTab] = useState('programmes');
  const [programmes, setProgrammes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(EMPTY_PROGRAMME);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/programme-register', { cache: 'no-store', credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load the programme register.');
      setProgrammes(data.programmes || []); setProjects(data.projects || []);
    } catch (e) { setError(e.message || 'Unable to load records.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const activeRows = tab === 'programmes' ? programmes : projects;
  const filtered = useMemo(() => activeRows.filter(row => {
    const text = [row.code, row.name, row.description, row.directorate, row.lead_name, row.project_lead, row.programme_name, row.status].join(' ').toLowerCase();
    return text.includes(search.toLowerCase());
  }), [activeRows, search, tab]);

  function startNew() {
    setEditing(null);
    setForm(tab === 'programmes' ? { ...EMPTY_PROGRAMME } : { ...EMPTY_PROJECT, programme_id: programmes[0]?.id ? String(programmes[0].id) : '' });
    setError(''); setNotice(''); setShowForm(true);
  }
  function startEdit(row) {
    setEditing({ entity: tab === 'programmes' ? 'programme' : 'project', id: row.id });
    const copy = { ...row };
    if (tab === 'projects') copy.programme_id = String(row.programme_id);
    delete copy.created_at; delete copy.updated_at; delete copy.created_by; delete copy.updated_by; delete copy.programme_code; delete copy.programme_name;
    setForm(copy); setError(''); setNotice(''); setShowForm(true);
  }
  function update(key, value) { setForm(current => ({ ...current, [key]: value })); }

  async function save(e) {
    e.preventDefault(); setSaving(true); setError(''); setNotice('');
    const entity = tab === 'programmes' ? 'programme' : 'project';
    try {
      const response = await fetch('/api/admin/programme-register', {
        method: editing ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, entity, ...(editing ? { id: editing.id } : {}) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save this record.');
      setShowForm(false); setEditing(null); setNotice(editing ? 'Record updated successfully.' : 'Record created successfully.');
      await load();
    } catch (e) { setError(e.message || 'Unable to save this record.'); }
    finally { setSaving(false); }
  }

  async function archive(row) {
    const entity = tab === 'programmes' ? 'programme' : 'project';
    if (!window.confirm(`Archive “${row.name}”? This will hide it from active registers but preserve the record.`)) return;
    setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/programme-register?entity=${entity}&id=${row.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to archive this record.');
      setNotice('Record archived. Historical data has been preserved.');
      await load();
    } catch (e) { setError(e.message || 'Unable to archive this record.'); }
  }

  const counts = { programmes: programmes.length, projects: projects.length, active: [...programmes, ...projects].filter(x => x.status === 'Active').length, drafts: [...programmes, ...projects].filter(x => x.status === 'Draft').length };

  return <div className="pm-page">
    <header className="pm-header"><div><div className="pm-eyebrow">VSI ADMINISTRATION · PROGRAMME OPERATIONS</div><h1>Programme &amp; Project Register</h1><p>Establish a clear programme structure before planning activities, assigning officers and reporting results.</p></div><button className="pm-primary" onClick={startNew}>＋ Add {tab === 'programmes' ? 'Programme' : 'Project'}</button></header>
    <section className="pm-stats">
      <div className="pm-stat"><span>PROGRAMMES</span><strong>{counts.programmes}</strong><small>Active register records</small></div>
      <div className="pm-stat"><span>PROJECTS</span><strong>{counts.projects}</strong><small>Linked to programmes</small></div>
      <div className="pm-stat"><span>ACTIVE</span><strong>{counts.active}</strong><small>Currently active records</small></div>
      <div className="pm-stat"><span>DRAFTS</span><strong>{counts.drafts}</strong><small>Not yet active</small></div>
    </section>
    <section className="pm-panel">
      <div className="pm-panel-top"><div><h2>Register</h2><p>Codes must be unique. Archive instead of permanently deleting records.</p></div><input className="pm-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search codes, names, leads…" /></div>
      <div className="pm-tabs"><button className={tab === 'programmes' ? 'selected' : ''} onClick={() => { setTab('programmes'); setSearch(''); setShowForm(false); setError(''); }}>Programmes <span>{programmes.length}</span></button><button className={tab === 'projects' ? 'selected' : ''} onClick={() => { setTab('projects'); setSearch(''); setShowForm(false); setError(''); }}>Projects <span>{projects.length}</span></button></div>
      {error && <div className="pm-alert error" role="alert">{error}</div>}
      {notice && <div className="pm-alert success" role="status">{notice}</div>}
      {showForm && <form className="pm-form" onSubmit={save}>
        <div className="pm-form-head"><div><h3>{editing ? 'Edit' : 'New'} {tab === 'programmes' ? 'programme' : 'project'}</h3><p>Fields marked * are required.</p></div><button type="button" className="pm-close" onClick={() => setShowForm(false)} aria-label="Close form">×</button></div>
        <div className="pm-form-grid">
          {tab === 'projects' && <Field label="Parent programme" value={form.programme_id} onChange={v => update('programme_id', v)} required options={programmes.map(p => ({ value: String(p.id), label: `${p.code} — ${p.name}` }))} />}
          <Field label="Unique code" value={form.code} onChange={v => update('code', v.toUpperCase())} required placeholder={tab === 'programmes' ? 'e.g. MHSW' : 'e.g. MHSW-001'} />
          <Field label={tab === 'programmes' ? 'Programme name' : 'Project name'} value={form.name} onChange={v => update('name', v)} required placeholder="Enter a clear name" />
          <Field label={tab === 'programmes' ? 'Responsible directorate' : 'Project lead'} value={tab === 'programmes' ? form.directorate : form.project_lead} onChange={v => update(tab === 'programmes' ? 'directorate' : 'project_lead', v)} />
          {tab === 'programmes' && <Field label="Programme lead" value={form.lead_name} onChange={v => update('lead_name', v)} />}
          <Field label="Start date" type="date" value={form.start_date || ''} onChange={v => update('start_date', v)} />
          <Field label="End date" type="date" value={form.end_date || ''} onChange={v => update('end_date', v)} />
          <Field label="Status" value={form.status} onChange={v => update('status', v)} options={(tab === 'programmes' ? PROGRAMME_STATUSES : PROJECT_STATUSES)} />
          <Field label="Description" type="textarea" wide value={form.description} onChange={v => update('description', v)} placeholder="Purpose, scope and intended change" />
          <Field label="Objectives" type="textarea" wide value={form.objectives} onChange={v => update('objectives', v)} placeholder="Main objectives and expected results" />
          {tab === 'projects' && <Field label="Indicators / deliverables" type="textarea" wide value={form.indicators} onChange={v => update('indicators', v)} placeholder="How project progress and outputs will be measured" />}
          <Field label="Target groups" type="textarea" wide value={form.target_groups} onChange={v => update('target_groups', v)} placeholder="Who the programme or project is intended to reach" />
        </div>
        <div className="pm-form-actions"><button type="button" className="pm-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="pm-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create record'}</button></div>
      </form>}
      {loading ? <div className="pm-empty">Loading programme records…</div> : filtered.length === 0 ? <div className="pm-empty"><div className="pm-empty-icon">⌕</div><strong>{activeRows.length ? 'No matching records' : `No ${tab} registered yet`}</strong><p>{activeRows.length ? 'Try a different search term.' : `Create the first ${tab === 'programmes' ? 'programme' : 'project'} to establish the programme structure.`}</p>{!activeRows.length && <button className="pm-primary" onClick={startNew}>＋ Add {tab === 'programmes' ? 'Programme' : 'Project'}</button>}</div> : <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Code / Name</th>{tab === 'projects' && <th>Parent programme</th>}<th>Lead / Directorate</th><th>Timeline</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id}><td><strong>{row.code}</strong><div className="pm-name">{row.name}</div>{row.description && <small className="pm-desc">{row.description}</small>}</td>{tab === 'projects' && <td><span className="pm-parent">{row.programme_code} · {row.programme_name}</span></td>}<td>{(tab === 'programmes' ? row.lead_name : row.project_lead) || (tab === 'programmes' ? row.directorate : '') || 'Not assigned'}</td><td><span>{dateLabel(row.start_date)}</span><small className="pm-date-end">to {dateLabel(row.end_date)}</small></td><td><span className={`pm-status ${row.status.toLowerCase().replaceAll(' ','-')}`}>{row.status}</span></td><td><div className="pm-actions"><button onClick={() => startEdit(row)}>Edit</button><button className="archive" onClick={() => archive(row)}>Archive</button></div></td></tr>)}</tbody></table></div>}
    </section>
    <div className="pm-note"><strong>Workflow boundary:</strong> this register establishes programmes and projects. It does not approve budgets or payments, and it does not replace the central approval process. Activity planning and report verification will be connected in the next phase.</div>
    <style jsx>{`
      .pm-page{max-width:1500px;margin:0 auto;padding:30px clamp(14px,2.5vw,36px) 50px;color:#17324f;min-width:0}.pm-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding:24px 26px;margin-bottom:16px;border:1px solid #dbe5ef;border-radius:20px;background:linear-gradient(130deg,#fff,#f1f7fd);box-shadow:0 10px 26px rgba(9,64,116,.06)}.pm-eyebrow{font-size:10px;letter-spacing:.15em;font-weight:900;color:#3c6997;margin-bottom:8px}.pm-header h1{font-size:clamp(26px,3vw,38px);letter-spacing:-.04em;color:#094074;margin:0}.pm-header p{margin:8px 0 0;color:#65798d;font-size:13px;line-height:1.6;max-width:720px}.pm-primary,.pm-secondary{border:0;border-radius:10px;padding:11px 15px;font-size:12px;font-weight:850;cursor:pointer;white-space:nowrap}.pm-primary{background:#003566;color:#fff;box-shadow:0 5px 13px rgba(0,53,102,.14)}.pm-primary:hover{background:#094b83}.pm-primary:disabled{opacity:.6;cursor:wait}.pm-secondary{background:#fff;color:#274864;border:1px solid #ccd9e5}.pm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}.pm-stat{background:#fff;border:1px solid #dce5ee;border-radius:14px;padding:18px;min-width:0}.pm-stat span{display:block;font-size:10px;font-weight:900;letter-spacing:.1em;color:#73869a}.pm-stat strong{display:block;font-size:30px;color:#094074;margin:7px 0 3px}.pm-stat small{font-size:11px;color:#718297}.pm-panel{background:#fff;border:1px solid #dce5ee;border-radius:18px;overflow:hidden;box-shadow:0 8px 22px rgba(9,64,116,.04)}.pm-panel-top{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px 22px 14px}.pm-panel-top h2{margin:0;color:#094074;font-size:20px}.pm-panel-top p{margin:5px 0 0;color:#75869a;font-size:12px}.pm-search{width:min(100%,320px);padding:11px 13px;border:1px solid #d3dfe9;border-radius:10px;font:inherit;font-size:12px;outline:none}.pm-search:focus,.pm-field input:focus,.pm-field select:focus,.pm-field textarea:focus{border-color:#4d8cbe;box-shadow:0 0 0 3px rgba(77,140,190,.12)}.pm-tabs{display:flex;gap:6px;padding:0 22px;border-bottom:1px solid #e6edf3}.pm-tabs button{display:flex;align-items:center;gap:8px;border:0;border-bottom:3px solid transparent;padding:12px 13px;background:transparent;color:#6d8094;font-weight:800;font-size:12px;cursor:pointer}.pm-tabs button.selected{color:#094074;border-bottom-color:#ffc300}.pm-tabs span{background:#edf3f8;border-radius:20px;padding:3px 7px;font-size:10px}.pm-alert{margin:14px 20px 0;border-radius:9px;padding:11px 13px;font-size:12px}.pm-alert.error{background:#fff0ef;color:#9a2d25;border:1px solid #f2c5c1}.pm-alert.success{background:#eef9f1;color:#246b3d;border:1px solid #cbe9d2}.pm-form{margin:18px 20px;padding:18px;border:1px solid #d8e4ee;border-radius:14px;background:#f8fbfe}.pm-form-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}.pm-form-head h3{margin:0;color:#094074;font-size:17px;text-transform:capitalize}.pm-form-head p{margin:5px 0 0;font-size:11px;color:#75869a}.pm-close{border:1px solid #d4e0ea;border-radius:8px;background:#fff;color:#456;font-size:22px;width:32px;height:32px;cursor:pointer}.pm-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.pm-field{display:flex;flex-direction:column;gap:6px;min-width:0}.pm-field.wide{grid-column:1/-1}.pm-field span{font-size:11px;font-weight:850;color:#4e6479}.pm-field input,.pm-field select,.pm-field textarea{width:100%;min-width:0;box-sizing:border-box;padding:10px 11px;border:1px solid #d0dce7;border-radius:8px;background:#fff;color:#203c57;font:inherit;font-size:12px;outline:none}.pm-field textarea{resize:vertical}.pm-form-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:16px}.pm-empty{padding:48px 18px;text-align:center;color:#74869a;font-size:12px}.pm-empty strong{display:block;color:#234561;font-size:15px;margin-top:10px}.pm-empty p{margin:6px 0 16px}.pm-empty-icon{margin:auto;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#eef4f9;color:#3c6997;font-size:24px}.pm-table-wrap{width:100%;overflow-x:auto}.pm-table{width:100%;border-collapse:collapse;text-align:left;font-size:12px}.pm-table th{padding:12px 15px;background:#f7fafd;color:#6f8296;text-transform:uppercase;letter-spacing:.06em;font-size:9px;white-space:nowrap}.pm-table td{padding:15px;border-top:1px solid #edf1f5;vertical-align:top;color:#52697f;max-width:280px}.pm-table td strong{color:#17466e;font-size:11px}.pm-name{color:#1d3852;font-weight:800;margin-top:4px;min-width:140px}.pm-desc{display:block;color:#8594a3;margin-top:5px;max-width:250px;line-height:1.45}.pm-date-end{display:block;color:#8998a7;margin-top:5px}.pm-parent{display:inline-block;max-width:200px;color:#426986;line-height:1.5}.pm-status{display:inline-flex;padding:5px 8px;border-radius:30px;background:#eef3f7;color:#546a7e;font-size:10px;font-weight:850;white-space:nowrap}.pm-status.active{background:#e8f7ed;color:#267045}.pm-status.completed{background:#eaf1ff;color:#315e9c}.pm-status.on-hold{background:#fff4dc;color:#8a6413}.pm-status.draft{background:#f0f2f5;color:#697786}.pm-status.planned{background:#eaf5ff;color:#24618b}.pm-actions{display:flex;gap:6px;white-space:nowrap}.pm-actions button{border:1px solid #cddce8;border-radius:7px;background:#fff;color:#174d79;padding:6px 8px;font-size:10px;font-weight:800;cursor:pointer}.pm-actions button:hover{background:#eef6fc}.pm-actions button.archive{color:#8a4d3b;border-color:#ead7d1}.pm-note{margin-top:14px;padding:13px 16px;border:1px solid #dbe5ef;border-radius:12px;background:#f8fbfe;color:#6c8093;font-size:11px;line-height:1.6}.pm-note strong{color:#284e6e}@media(max-width:850px){.pm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.pm-header,.pm-panel-top{flex-direction:column;align-items:stretch}.pm-search{width:100%;box-sizing:border-box}.pm-header .pm-primary{align-self:flex-start}}@media(max-width:520px){.pm-page{padding:18px 10px 32px}.pm-header{padding:18px}.pm-form{margin:12px;padding:12px}.pm-form-grid{grid-template-columns:1fr}.pm-field.wide{grid-column:auto}.pm-tabs{padding:0 12px}.pm-tabs button{padding:12px 8px}.pm-panel-top{padding:18px 14px 12px}.pm-stats{gap:8px}.pm-stat{padding:13px}.pm-stat strong{font-size:25px}}
    `}</style>
  </div>;
}
