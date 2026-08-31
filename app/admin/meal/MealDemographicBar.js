'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const num = (v) => Number(v ?? 0) || 0;
const json = (v, fallback = {}) => { if (!v) return fallback; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return fallback; } };
const breakdown = (report) => {
  const a = json(report.attachments, []);
  const b = a.find(x => x?.category === 'participant-breakdown')?.breakdown || {};
  const r = k => num(b[`reached${k}`]);
  return {
    children: r('MaleChildren') + r('FemaleChildren'),
    youth: r('MaleYouth') + r('FemaleYouth'),
    adult: r('MaleAdult') + r('FemaleAdult'),
  };
};

export default function MealDemographicBar() {
  const [host, setHost] = useState(null);
  const [values, setValues] = useState({ children: 0, youth: 0, adult: 0 });

  useEffect(() => {
    const findHost = () => document.querySelector('.demographic-donut');
    setHost(findHost());
    const observer = new MutationObserver(() => {
      const next = findHost();
      if (next) setHost(next);
    });
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
        if (!cancelled) setValues(full.reduce((t, r) => { const b = breakdown(r); t.children += b.children; t.youth += b.youth; t.adult += b.adult; return t; }, { children: 0, youth: 0, adult: 0 }));
      } catch { /* existing dashboard remains the source of truth */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const total = values.children + values.youth + values.adult;
  const rows = useMemo(() => [
    ['Children', values.children], ['Youth', values.youth], ['Adults', values.adult]
  ], [values]);

  if (!host) return null;
  return createPortal(
    <div className="meal-demographic-bar" aria-label="Demographic footprint bar chart">
      <div className="meal-bar-total"><strong>{total.toLocaleString()}</strong><span>TOTAL REACHED</span></div>
      <div className="meal-bars">
        {rows.map(([label, value]) => {
          const percentage = total ? Math.round((value / total) * 100) : 0;
          return <div className="meal-bar-row" key={label}>
            <div className="meal-bar-label"><span>{label}</span><b>{value.toLocaleString()}</b><small>{percentage}%</small></div>
            <div className="meal-bar-track"><i style={{ width: `${percentage}%` }} /></div>
          </div>;
        })}
      </div>
    </div>,
    host
  );
}
