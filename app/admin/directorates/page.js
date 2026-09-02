'use client';

import { useEffect, useMemo, useState } from 'react';

const money = (v) => `ZMW ${(Number(v ?? 0) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function findValue(value, keys) {
  if (!value || typeof value !== 'object') return '';
  if (Array.isArray(value)) return value.map(v => findValue(v, keys)).find(Boolean) || '';
  for (const [key, val] of Object.entries(value)) {
    if (keys.some(k => key.toLowerCase() === k.toLowerCase()) && (typeof val === 'string' || typeof val === 'number')) return String(val);
    const nested = findValue(val, keys);
    if (nested) return nested;
  }
  return '';
}

function formatAlignment(value) {
  if (!value) return '—';
  if (Array.isArray(value)) return value.join(', ');
  return String(value).replace(/\s*;\s*/g, ', ');
}

export default function DirectoratesPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await fetch('/api/admin/activity-reports', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load activity reports.');
        const approved = (data.reports || []).filter(r => r.review_status === 'APPROVED');
        const full = await Promise.all(approved.map(async r => {
          try {
            const detail = await fetch(`/api/admin/activity-reports/${encodeURIComponent(r.reference)}`, { cache: 'no-store' });
            const body = await detail.json();
            return body.report || r;
          } catch { return r; }
        }));
        if (alive) setReports(full);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const rows = useMemo(() => reports.map((r) => ({
    reference: findValue(r, ['reference', 'report_reference']),
    directorate: findValue(r, ['directorate', 'directorate_name', 'directorateName']) || 'Not specified',
    activity: findValue(r, ['activity_title', 'activity_name', 'activityName']) || 'Untitled activity',
    location: (() => {
      const province = findValue(r, ['province', 'province_name', 'provinceName']);
      const district = findValue(r, ['district', 'district_name', 'districtName']);
      return province && district ? `${province} · ${district}` : province || district || 'Not specified';
    })(),
    budget: Number(findValue(r, ['approved_budget', 'approvedBudget', 'budget'])) || 0,
    un: formatAlignment(findValue(r, ['un_sdgs_alignment', 'unSdgsAlignment', 'un_sdg_alignment', 'sdg_alignment', 'sdgs_alignment', 'un_alignment'])),
    au: formatAlignment(findValue(r, ['au_agenda_2063_alignment', 'auAgenda2063Alignment', 'agenda_2063_alignment', 'au_alignment'])),
  })), [reports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter(r => Object.values(r).join(' ').toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const directorateCount = new Set(rows.map(r => r.directorate)).size;
  const activityCount = rows.length;
  const totalBudget = rows.reduce((sum, r) => sum + r.budget, 0);

  return <div className="directorates-page">
    <header className="directorates-header">
      <div>
        <div className="directorates-kicker">VSI ADMINISTRATION · DIRECTORATES</div>
        <h1>Directorates</h1>
        <p>Approved activity implementation by directorate, location, budget and strategic alignment.</p>
      </div>
    </header>

    <section className="directorates-kpis">
      <div><span>DIRECTORATES</span><strong>{directorateCount}</strong><small>Directorates represented in approved reports</small></div>
      <div><span>ACTIVITIES</span><strong>{activityCount}</strong><small>Approved activities implemented</small></div>
      <div><span>LOCATIONS</span><strong>{new Set(rows.map(r => r.location).filter(v => v !== 'Not specified')).size}</strong><small>Province · District coverage</small></div>
      <div><span>BUDGET</span><strong>{money(totalBudget)}</strong><small>Approved activity budgets</small></div>
    </section>

    <section className="directorates-section">
      <div className="directorates-section-head">
        <div><h2>Directorate Activity Register</h2><p>Each row represents an approved activity and its organisational and strategic footprint.</p></div>
      </div>
      <div className="directorates-body">
        <div className="toolbar"><label>Search activities<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Directorate, activity, location, UN or AU alignment…" /></label><span>{filtered.length} activities</span></div>
        {loading && <div className="empty">Loading directorate intelligence…</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && <div className="table-wrap"><table><thead><tr><th>Directorate</th><th>Activity</th><th>Location</th><th>Budget</th><th>UN SDG Alignment</th><th>AU Agenda 2063 Alignment</th></tr></thead><tbody>{filtered.map(r => <tr key={r.reference || `${r.directorate}-${r.activity}`}><td><strong>{r.directorate}</strong></td><td>{r.activity}</td><td>{r.location}</td><td className="budget">{money(r.budget)}</td><td>{r.un}</td><td>{r.au}</td></tr>)}{filtered.length === 0 && <tr><td colSpan="6" className="empty-cell">No approved activities match this view.</td></tr>}</tbody></table></div>}
      </div>
    </section>

    <style jsx>{`
      .directorates-page{min-height:100vh;background:#f4f7fa;padding:28px clamp(18px,3.5vw,42px) 55px;box-sizing:border-box;color:#17212b}
      .directorates-header{position:relative;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:18px;padding:22px 24px;background:linear-gradient(135deg,#fff 0%,#f8fbff 65%,#eef5fc 100%);border:1px solid #dbe5ef;border-radius:22px;box-shadow:0 10px 28px rgba(9,64,116,.08);overflow:hidden}
      .directorates-header:after{content:"";position:absolute;right:-70px;top:-95px;width:260px;height:260px;border:1px solid rgba(9,64,116,.1);border-radius:50%;box-shadow:0 0 0 22px rgba(9,64,116,.025),0 0 0 44px rgba(9,64,116,.018);pointer-events:none}
      .directorates-header>div{position:relative;z-index:1}.directorates-kicker{margin-bottom:7px;color:#001f3f;font:900 10px/1.2 Arial,sans-serif;letter-spacing:.14em}.directorates-header h1{margin:0;color:#001f3f;font:700 clamp(30px,3.2vw,43px)/1.05 Arial,sans-serif;letter-spacing:-.045em}.directorates-header p{margin:8px 0 0;color:#001f3f;max-width:760px;font:400 13px/1.55 Arial,sans-serif}
      .directorates-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}.directorates-kpis>div{min-height:130px;padding:18px;border-radius:16px;box-sizing:border-box;color:#fff;box-shadow:0 8px 22px rgba(9,64,116,.1)}.directorates-kpis>div:nth-child(1){background:linear-gradient(135deg,#0a9fd4,#1477b4)}.directorates-kpis>div:nth-child(2){background:linear-gradient(135deg,#245e96,#183f6f)}.directorates-kpis>div:nth-child(3){background:linear-gradient(135deg,#c99b16,#80610a)}.directorates-kpis>div:nth-child(4){background:linear-gradient(135deg,#0a9fd4,#1477b4)}.directorates-kpis span{display:block;font-size:9px;font-weight:900;letter-spacing:.12em;color:rgba(255,255,255,.8)}.directorates-kpis strong{display:block;margin:7px 0;font-size:27px;line-height:1.1}.directorates-kpis small{display:block;color:rgba(255,255,255,.82);font-size:10px;line-height:1.4}
      .directorates-section{background:#fff;border:1px solid #dfe5ea;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px rgba(0,53,102,.045)}.directorates-section-head{min-height:78px;padding:20px 24px;background:#002d62;box-sizing:border-box}.directorates-section-head h2{margin:0;color:#fff;font-size:20px;line-height:1.2}.directorates-section-head p{margin:4px 0 0;color:#cbd5e1;font-size:12px;line-height:1.45}.directorates-body{padding:18px}.toolbar{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:16px}.toolbar label{display:block;max-width:520px;width:100%;color:#003566;font-size:11px;font-weight:900}.toolbar input{display:block;width:100%;height:40px;margin-top:6px;padding:9px 13px;border:1px solid #cbd5e1;border-radius:9px;box-sizing:border-box;font:inherit;font-size:12px;outline:none}.toolbar input:focus{border-color:#3c6997;box-shadow:0 0 0 3px rgba(60,105,151,.12)}.toolbar>span{color:#65717d;font-size:11px;font-weight:800}.table-wrap{overflow:auto;border:1px solid #dfe5ea;border-radius:10px}table{width:100%;min-width:1050px;border-collapse:separate;border-spacing:0;font-size:11px}th{padding:12px 13px;background:#f1f5f9;color:#003566;text-align:left;font-size:9px;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid #dfe5ea;white-space:nowrap}td{padding:13px;border-bottom:1px solid #edf1f4;color:#334155;vertical-align:top;line-height:1.45}tbody tr:last-child td{border-bottom:0}tbody tr:hover{background:#f8fbff}td strong{color:#003566}.budget{white-space:nowrap;font-weight:800;color:#003566}.empty,.error,.empty-cell{padding:35px;text-align:center;color:#64748b;font-size:12px}.error{color:#b42318}
      @media(max-width:900px){.directorates-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.directorates-page{padding:18px 14px 40px}.directorates-header{padding:18px;border-radius:18px}.directorates-kpis{grid-template-columns:1fr}.directorates-section-head{padding:18px}.toolbar{display:block}.toolbar>span{display:block;margin-top:8px}}
    `}</style>
  </div>;
}
