'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const num = (v) => Number(v ?? 0) || 0;
const first = (o, keys, fallback = '') => keys.map(k => o?.[k]).find(v => v !== undefined && v !== null && v !== '') ?? fallback;
const json = (v, fallback = {}) => { if (!v) return fallback; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return fallback; } };
const breakdown = (report) => {
  const a = json(report.attachments, []);
  const b = a.find(x => x?.category === 'participant-breakdown')?.breakdown || {};
  const r = k => num(b[`reached${k}`]);
  return r('MaleChildren') + r('FemaleChildren') + r('MaleYouth') + r('FemaleYouth') + r('MaleAdult') + r('FemaleAdult');
};

export default function MealDemographicBar() {
  const [host, setHost] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const findHost = () => document.querySelector('.demographic-donut');
    setHost(findHost());
    const observer = new MutationObserver(() => { const next = findHost(); if (next) setHost(next); });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/activity-reports', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) return;
        const approved = (data.reports || []).filter(r => r.review_status === 'APPROVED');
        const full = await Promise.all(approved.map(async r => {
          try {
            const d = await fetch(`/api/admin/activity-reports/${encodeURIComponent(r.reference)}`, { cache: 'no-store' });
            const x = await d.json();
            return x.report || r;
          } catch { return r; }
        }));
        const next = full.map((r, i) => ({
          name: first(r, ['activity_title','activity_name','activityName'], `Activity ${i + 1}`),
          reached: num(first(r, ['reached_participant_total','participant_total','participants_reached'])) || breakdown(r),
        }));
        if (!cancelled) setActivities(next);
      } catch { /* existing dashboard remains the source of truth */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const max = useMemo(() => Math.max(1, ...activities.map(a => a.reached)), [activities]);
  const total = useMemo(() => activities.reduce((s, a) => s + a.reached, 0), [activities]);
  if (!host) return null;

  return createPortal(
    <div className="meal-demographic-bar" aria-label="Reach by approved activity">
      <div className="meal-bar-total"><strong>{total.toLocaleString()}</strong><span>TOTAL REACHED</span></div>
      <div className="meal-activity-bars">
        {activities.length ? activities.map((activity, index) => (
          <div className="meal-activity-bar" key={`${activity.name}-${index}`}>
            <div className="meal-activity-value">{activity.reached.toLocaleString()}</div>
            <div className="meal-activity-track"><i style={{ height: `${Math.max(4, (activity.reached / max) * 100)}%` }} /></div>
            <div className="meal-activity-name" title={activity.name}>{activity.name}</div>
          </div>
        )) : <div className="phase1-empty">No approved activity reach recorded.</div>}
      </div>
    </div>, host
  );
}
