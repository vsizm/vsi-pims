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

        const updateCards = () => {
          const grid = document.querySelector('.phase1-kpis');
          if (!grid || grid.children.length < 3) return false;

          const locationCard = grid.children[2];
          locationCard.dataset.mealKpi = 'locations';
          locationCard.innerHTML = `
            <span>LOCATIONS</span>
            <strong>${locations.length.toLocaleString()}</strong>
            <small>Province · District coverage</small>
            <div class="kpi-footer"><span>⌖</span><b>${locations.length ? locations.join(' · ') : 'Not specified'}</b></div>
          `;

          let directorateCard = grid.querySelector('[data-meal-kpi="directorate"]');
          if (!directorateCard) {
            directorateCard = document.createElement('div');
            directorateCard.dataset.mealKpi = 'directorate';
            grid.appendChild(directorateCard);
          }
          directorateCard.innerHTML = `
            <span>DIRECTORATE</span>
            <strong>${directorates.length.toLocaleString()}</strong>
            <small>Approved report coverage</small>
            <div class="kpi-footer"><span>⌘</span><b>${directorates.length ? directorates.join(' · ') : 'Not specified'}</b></div>
          `;

          grid.classList.add('meal-four-kpis');
          return true;
        };

        if (!updateCards()) {
          observer = new MutationObserver(() => { if (updateCards()) observer?.disconnect(); });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      } catch {
        // Keep the base MEAL dashboard functional if the enhancement cannot load.
      }
    };

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* MEAL KPI row: four equal-width cards, balanced left-to-right. */
        .phase1-kpis.meal-four-kpis{
          display:grid!important;
          grid-template-columns:repeat(4,minmax(0,1fr))!important;
          gap:14px!important;
          width:100%!important;
          max-width:none!important;
          align-items:stretch!important;
        }
        .phase1-kpis.meal-four-kpis>div{
          min-width:0!important;
          width:auto!important;
          max-width:none!important;
          height:100%!important;
          min-height:142px!important;
          margin:0!important;
        }
        .phase1-kpis.meal-four-kpis>div:nth-child(3)::before{background:#d9a400}
        .phase1-kpis.meal-four-kpis>div:nth-child(4)::before{background:#7657a8}
        .phase1-kpis.meal-four-kpis>div:nth-child(3) .kpi-footer b,
        .phase1-kpis.meal-four-kpis>div:nth-child(4) .kpi-footer b{color:#094074}
        @media (max-width:1100px){
          .phase1-kpis.meal-four-kpis{grid-template-columns:repeat(4,minmax(0,1fr))!important}
        }
        @media (max-width:720px){
          .phase1-kpis.meal-four-kpis{grid-template-columns:1fr!important}
        }
      `;
      document.head.appendChild(style);
    }

    inject();
    return () => {
      cancelled = true;
      observer?.disconnect();
      document.getElementById(styleId)?.remove();
      document.querySelectorAll('[data-meal-kpi="locations"],[data-meal-kpi="directorate"]').forEach(el => el.remove());
    };
  }, []);

  return null;
}
