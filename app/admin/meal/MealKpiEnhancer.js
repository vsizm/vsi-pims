'use client';

import { useEffect } from 'react';

const first = (o, keys) => keys.map(k => o?.[k]).find(v => v !== undefined && v !== null && v !== '') || '';
const json = (v, fallback = {}) => { if (!v) return fallback; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return fallback; } };

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

function detailsFromReport(report) {
  const breakdown = json(report.attachments, []).find(x => x?.category === 'participant-breakdown')?.breakdown || {};
  return { breakdown };
}

export default function MealKpiEnhancer() {
  useEffect(() => {
    let cancelled = false;
    let observer;
    const styleId = 'meal-five-kpi-style';

    const inject = async () => {
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
        if (cancelled) return;

        const directorates = unique(full.flatMap(r => collectByKey(r, /^(directorate|directorate_name|directorateName)$/i)));
        const provinces = unique(full.flatMap(r => collectByKey(r, /^(province|province_name|provinceName)$/i)));
        const districts = unique(full.flatMap(r => collectByKey(r, /^(district|district_name|districtName)$/i)));
        const locations = [...new Set(full.flatMap(r => {
          const p = collectByKey(r, /^(province|province_name|provinceName)$/i)[0] || '';
          const d = collectByKey(r, /^(district|district_name|districtName)$/i)[0] || '';
          return p && d ? [`${p} · ${d}`] : p ? [p] : d ? [d] : [];
        }))];
        const directorateText = directorates.length ? directorates.join(' · ') : 'Not specified';
        const locationText = locations.length ? locations.join(' · ') : (provinces.length || districts.length ? [...provinces, ...districts].join(' · ') : 'Not specified');

        const addCards = () => {
          const grid = document.querySelector('.phase1-kpis');
          if (!grid || grid.querySelector('[data-meal-kpi="directorate"]')) return false;
          const cards = [
            { key: 'directorate', label: 'DIRECTORATE', value: directorates.length.toLocaleString(), sub: 'Approved report coverage', icon: '⌘', footer: directorateText },
            { key: 'location', label: 'LOCATIONS', value: (locations.length || Math.max(provinces.length, districts.length)).toLocaleString(), sub: 'Province · District coverage', icon: '⌖', footer: locationText },
          ];
          cards.forEach(card => {
            const el = document.createElement('div');
            el.dataset.mealKpi = card.key;
            el.innerHTML = `<span>${card.label}</span><strong>${card.value}</strong><small>${card.sub}</small><div class="kpi-footer"><span>${card.icon}</span><b>${card.footer}</b></div>`;
            grid.appendChild(el);
          });
          grid.classList.add('meal-five-kpis');
          return true;
        };

        if (!addCards()) {
          observer = new MutationObserver(() => { if (addCards()) observer?.disconnect(); });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      } catch {
        // The existing MEAL dashboard remains fully functional if the enhancement cannot load.
      }
    };

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .phase1-kpis.meal-five-kpis{grid-template-columns:repeat(5,minmax(0,1fr))}
        .phase1-kpis.meal-five-kpis>div:nth-child(4)::before{background:#d9a400}
        .phase1-kpis.meal-five-kpis>div:nth-child(5)::before{background:#7657a8}
        .phase1-kpis.meal-five-kpis>div:nth-child(4) .kpi-footer b,.phase1-kpis.meal-five-kpis>div:nth-child(5) .kpi-footer b{color:#094074}
        @media (max-width:1100px){.phase1-kpis.meal-five-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media (max-width:720px){.phase1-kpis.meal-five-kpis{grid-template-columns:1fr}}
      `;
      document.head.appendChild(style);
    }
    inject();
    return () => { cancelled = true; observer?.disconnect(); document.getElementById(styleId)?.remove(); document.querySelectorAll('[data-meal-kpi]').forEach(el => el.remove()); };
  }, []);

  return null;
}
