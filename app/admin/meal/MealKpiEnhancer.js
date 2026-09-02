'use client';

import { useEffect } from 'react';

function collectByKey(value, matcher, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) { value.forEach(v => collectByKey(v, matcher, out)); return out; }
  Object.entries(value).forEach(([key, val]) => {
    if (matcher.test(key) && (typeof val === 'string' || typeof val === 'number')) out.push(String(val));
    collectByKey(val, matcher, out);
  });
  return out;
}

function unique(values) {
  return [...new Set(values.map(v => String(v).trim()).filter(Boolean))];
}

export default function MealKpiEnhancer() {
  useEffect(() => {
    let cancelled = false;
    let observer;
    const styleId = 'meal-kpi-layout-style';

    const inject = async () => {
      try {
        const res = await fetch('/api/admin/activity-reports', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok || cancelled) return;
        const approved = (data.reports || []).filter(r => r.review_status === 'APPROVED');
        const full = await Promise.all(approved.map(async r => {
          try {
            const d = await fetch(`/api/admin/activity-reports/${encodeURIComponent(r.reference)}`, { cache: 'no-store' });
            const x = await d.json();
            return x.report || r;
          } catch { return r; }
        }));
        if (cancelled) return;

        const directorates = unique(full.flatMap(r => collectByKey(r, /^(directorate|directorate_name|directorateName)$/i)));
        const locations = unique(full.flatMap(r => {
          const p = collectByKey(r, /^(province|province_name|provinceName)$/i)[0] || '';
          const d = collectByKey(r, /^(district|district_name|districtName)$/i)[0] || '';
          return p && d ? [`${p} · ${d}`] : p ? [p] : d ? [d] : [];
        }));

        const updateCard = () => {
          const grid = document.querySelector('.phase1-kpis');
          if (!grid || grid.children.length < 3) return false;
          const card = grid.children[2];
          card.dataset.mealKpi = 'locations-directorate';
          card.innerHTML = `
            <span>LOCATIONS · DIRECTORATE</span>
            <strong>${locations.length.toLocaleString()}</strong>
            <small>${directorates.length.toLocaleString()} directorates covered</small>
            <div class="kpi-footer"><span>⌖</span><b>${locations.length ? locations.join(' · ') : 'Not specified'}</b></div>
          `;
          grid.classList.add('meal-three-kpis');
          return true;
        };

        if (!updateCard()) {
          observer = new MutationObserver(() => { if (updateCard()) observer?.disconnect(); });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      } catch {
        // Keep the base MEAL dashboard functional if location/directorate enhancement cannot load.
      }
    };

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* MEAL KPI row: three equal-width cards, always horizontal on desktop/tablet. */
        .phase1-kpis.meal-three-kpis{
          display:grid!important;
          grid-template-columns:repeat(3,minmax(0,1fr))!important;
          gap:14px!important;
          width:100%!important;
          max-width:none!important;
          align-items:stretch!important;
        }
        .phase1-kpis.meal-three-kpis>div{
          min-width:0!important;
          width:auto!important;
          max-width:none!important;
          height:100%!important;
          min-height:142px!important;
          margin:0!important;
        }
        .phase1-kpis.meal-three-kpis>div:nth-child(3)::before{background:#d9a400}
        .phase1-kpis.meal-three-kpis>div:nth-child(3) .kpi-footer b{color:#094074}
        @media (max-width:900px){
          .phase1-kpis.meal-three-kpis{grid-template-columns:repeat(3,minmax(0,1fr))!important}
        }
        @media (max-width:720px){
          .phase1-kpis.meal-three-kpis{grid-template-columns:1fr!important}
        }
      `;
      document.head.appendChild(style);
    }

    inject();
    return () => {
      cancelled = true;
      observer?.disconnect();
      document.getElementById(styleId)?.remove();
      document.querySelectorAll('[data-meal-kpi="locations-directorate"]').forEach(el => el.removeAttribute('data-meal-kpi'));
    };
  }, []);

  return null;
}
