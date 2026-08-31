'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

const num = (v) => Number(v ?? 0) || 0;
const first = (o, keys, fallback = '') => keys.map(k => o?.[k]).find(v => v !== undefined && v !== null && v !== '') ?? fallback;
const json = (v, fallback = {}) => { if (!v) return fallback; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return fallback; } };
const breakdown = (r) => {
  const a = json(r.attachments, []);
  const b = a.find(x => x?.category === 'participant-breakdown')?.breakdown || {};
  const g = (k) => num(b[`reached${k}`]);
  return { children:g('MaleChildren')+g('FemaleChildren'), youth:g('MaleYouth')+g('FemaleYouth'), adults:g('MaleAdult')+g('FemaleAdult'), pwd:g('PwdMaleChildren')+g('PwdFemaleChildren')+g('PwdMaleYouth')+g('PwdFemaleYouth')+g('PwdMaleAdult')+g('PwdFemaleAdult') };
};

export default function MealProgrammePerformance() {
  const [host, setHost] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const find = () => [...document.querySelectorAll('.phase1-card')].find(el => el.textContent.includes('PROGRAMME PERFORMANCE'));
    const apply = () => { const el = find(); if (el) { el.classList.add('meal-programme-host'); setHost(el); } };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/activity-reports', { cache: 'no-store' });
        const data = await res.json();
        const approved = (data.reports || []).filter(r => r.review_status === 'APPROVED');
        const full = await Promise.all(approved.map(async r => {
          try { const d = await fetch(`/api/admin/activity-reports/${encodeURIComponent(r.reference)}`, { cache: 'no-store' }); const x = await d.json(); return x.report || r; } catch { return r; }
        }));
        if (!cancelled) setActivities(full);
      } catch { if (!cancelled) setActivities([]); }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!host) return null;
  return createPortal(
    <div className="meal-programme-performance">
      <div className="meal-pp-head">
        <div><span>PROGRAMME PERFORMANCE</span><h2>Approved activity reach</h2><p>Participant footprint across approved activities.</p></div>
        <b>{activities.length}</b>
      </div>
      <div className="meal-pp-list">
        {activities.map((r, i) => {
          const b = breakdown(r);
          const name = first(r, ['activity_title','activity_name','activityName'], 'Approved activity');
          const code = first(r, ['activity_code','activityCode','code'], first(r, ['reference'], '—'));
          const directorate = first(r, ['directorate','directorate_name','directorateName'], first(r, ['programme','programme_name','programmeName'], '—'));
          const province = first(r, ['province','province_name','provinceName'], '—');
          const district = first(r, ['district','district_name','districtName'], '—');
          const href = `/admin/reports/${encodeURIComponent(r.reference)}`;
          return <Link href={href} className="meal-pp-row" key={r.reference || i}>
            <div className="meal-pp-icon">▣</div>
            <div className="meal-pp-activity"><small>ACTIVITY · {code}</small><strong>{name}</strong><span>{directorate}</span></div>
            <div className="meal-pp-reach"><div><small>CHILDREN</small><strong>{b.children}</strong></div><div><small>YOUTH</small><strong>{b.youth}</strong></div><div><small>ADULTS</small><strong>{b.adults}</strong></div><div><small>PWDS</small><strong>{b.pwd}</strong></div></div>
            <div className="meal-pp-location"><small>LOCATION</small><strong>{province}</strong><span>{district}</span></div>
            <span className="meal-pp-link">View approved report →</span>
          </Link>;
        })}
        {!activities.length && <div className="phase1-empty">No approved activity reach recorded.</div>}
      </div>
    </div>, host
  );
}
