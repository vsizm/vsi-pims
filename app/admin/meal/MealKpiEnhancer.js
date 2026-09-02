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

const num = (v) => Number(v ?? 0) || 0;
const money = (v) => `ZMW ${num(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

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
        const financials = full.reduce((totals, r) => {
          totals.budget += num(r.approved_budget ?? r.approvedBudget);
          totals.spent += num(r.actual_spent ?? r.actualSpent);
          return totals;
        }, { budget: 0, spent: 0 });
        const utilisation = financials.budget ? Math.round((financials.spent / financials.budget) * 100) : 0;

        const updateCards = () => {
          const grid = document.querySelector('.phase1-kpis');
          if (!grid || grid.children.length < 3) return false;

          const financialCard = grid.children[1];
          financialCard.dataset.mealKpi = 'financial';
          financialCard.innerHTML = `
            <span>FINANCIAL FOOTPRINT</span>
            <strong>${money(financials.spent)}</strong>
            <small>Approved expenditure across activities</small>
            <div class="kpi-footer"><span>◉ ${full.length} activities</span><b>${utilisation}% of approved budget</b></div>
          `;

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

          const links = {
            financial: '/admin/finance',
            locations: '/admin/reports',
            directorate: '/admin/reports',
          };
          [
            ['financial', links.financial],
            ['locations', links.locations],
            ['directorate', links.directorate],
          ].forEach(([key, href]) => {
            const card = grid.querySelector(`[data-meal-kpi="${key}"]`);
            if (!card) return;
            card.setAttribute('role', 'link');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Open ${key} intelligence`);
            card.dataset.kpiHref = href;
            card.onclick = () => { window.location.href = href; };
            card.onkeydown = (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                window.location.href = href;
              }
            };
          });

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
        .phase1-kpis.meal-four-kpis{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:14px!important;width:100%!important;max-width:none!important;align-items:stretch!important}
        .phase1-kpis.meal-four-kpis>div{min-width:0!important;width:auto!important;max-width:none!important;height:100%!important;min-height:142px!important;margin:0!important;cursor:pointer!important}
        .phase1-kpis.meal-four-kpis>div:focus-visible{outline:3px solid rgba(255,195,0,.9)!important;outline-offset:3px!important}
        .phase1-kpis.meal-four-kpis>div:nth-child(1){background:linear-gradient(135deg,#0a9fd4,#1477b4)!important;border-color:transparent!important;color:#fff!important}
        .phase1-kpis.meal-four-kpis>div:nth-child(2){background:linear-gradient(135deg,#245e96,#183f6f)!important;border-color:transparent!important;color:#fff!important}
        .phase1-kpis.meal-four-kpis>div:nth-child(3){background:linear-gradient(135deg,#c99b16,#80610a)!important;border-color:transparent!important;color:#fff!important}
        .phase1-kpis.meal-four-kpis>div:nth-child(4){background:linear-gradient(135deg,#0a9fd4,#1477b4)!important;border-color:transparent!important;color:#fff!important}
        .phase1-kpis.meal-four-kpis>div::before{background:rgba(255,255,255,.22)!important}
        .phase1-kpis.meal-four-kpis>div::after{border-color:rgba(255,255,255,.18);box-shadow:0 0 0 17px rgba(255,255,255,.04),0 0 0 34px rgba(255,255,255,.035)}
        .phase1-kpis.meal-four-kpis span,.phase1-kpis.meal-four-kpis strong,.phase1-kpis.meal-four-kpis small{color:#fff!important}
        .phase1-kpis.meal-four-kpis .kpi-footer{border-top-color:rgba(255,255,255,.2)}
        .phase1-kpis.meal-four-kpis .kpi-footer span,.phase1-kpis.meal-four-kpis .kpi-footer b{color:rgba(255,255,255,.82)!important}
        @media (max-width:1100px){.phase1-kpis.meal-four-kpis{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
        @media (max-width:720px){.phase1-kpis.meal-four-kpis{grid-template-columns:1fr!important}}
      `;
      document.head.appendChild(style);
    }

    inject();
    return () => {
      cancelled = true;
      observer?.disconnect();
      document.getElementById(styleId)?.remove();
      document.querySelectorAll('[data-meal-kpi="locations"],[data-meal-kpi="directorate"],[data-meal-kpi="financial"]').forEach(el => el.remove());
    };
  }, []);

  return null;
}
