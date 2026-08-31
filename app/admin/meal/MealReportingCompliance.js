'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

const num = (v) => Number(v ?? 0) || 0;
const first = (o, keys, fallback = '') => keys.map(k => o?.[k]).find(v => v !== undefined && v !== null && v !== '') ?? fallback;
const json = (v, fallback = {}) => { if (!v) return fallback; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return fallback; } };

function breakdown(report) {
  const attachments = json(report.attachments, []);
  const item = attachments.find(x => x?.category === 'participant-breakdown');
  const b = item?.breakdown || {};
  const g = (k) => num(b[`reached${k}`]);
  return {
    children: g('MaleChildren') + g('FemaleChildren'),
    youth: g('MaleYouth') + g('FemaleYouth'),
    adults: g('MaleAdult') + g('FemaleAdult'),
    pwd: g('PwdMaleChildren') + g('PwdFemaleChildren') + g('PwdMaleYouth') + g('PwdFemaleYouth') + g('PwdMaleAdult') + g('PwdFemaleAdult'),
    hasBreakdown: Boolean(item?.breakdown),
  };
}

function compliance(report) {
  const b = breakdown(report);
  const planned = num(first(report, ['planned_participant_total', 'participant_target', 'target_participants'])) ||
    num(b.children) + num(b.youth) + num(b.adults);
  const reached = num(first(report, ['reached_participant_total', 'participant_total', 'participants_reached'])) ||
    num(b.children) + num(b.youth) + num(b.adults);

  const missing = [];
  if (!first(report, ['activity_code', 'activityCode', 'code'])) missing.push('Activity code');
  if (!first(report, ['activity_title', 'activity_name', 'activityName'])) missing.push('Activity name');
  if (!first(report, ['directorate', 'directorate_name', 'directorateName'])) missing.push('Directorate');
  if (!b.hasBreakdown) missing.push('Participant disaggregation');
  if (!first(report, ['province', 'province_name', 'provinceName'])) missing.push('Province');
  if (!first(report, ['district', 'district_name', 'districtName'])) missing.push('District');
  if (!(report.immediate_outcomes || report.notable_achievements)) missing.push('Outcome / results');
  if (!(report.results_evidence || report.evidence_uploaded)) missing.push('Evidence');

  if (missing.length) return { state: 'non', label: 'NON-COMPLIANT', description: 'Required reporting information is missing or incomplete.', missing, planned, reached, variance: reached - planned };
  if (reached !== planned) return { state: 'variance', label: 'VARIANCE IDENTIFIED', description: 'Reporting is complete, but the participant target differs from actual reach.', missing: [], planned, reached, variance: reached - planned };
  return { state: 'ok', label: 'COMPLIANT', description: 'All required reporting information is complete and consistent.', missing: [], planned, reached, variance: 0 };
}

export default function MealReportingCompliance() {
  const [host, setHost] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const find = () => [...document.querySelectorAll('.phase1-card')].find(el => el.textContent.includes('IMPLEMENTATION AUDIT'));
    const apply = () => { const el = find(); if (el) { el.classList.add('meal-compliance-host'); setHost(el); } };
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
    <div className="meal-reporting-compliance">
      <div className="meal-compliance-head">
        <div><span>REPORTING COMPLIANCE</span><h2>Compliance status</h2><p>Reporting requirements across approved activities.</p></div>
      </div>
      <div className="meal-compliance-legend">
        <div className="ok"><b>✓</b><strong>COMPLIANT</strong><span>All required reporting information is complete and consistent.</span></div>
        <div className="variance"><b>!</b><strong>VARIANCE IDENTIFIED</strong><span>Reporting is complete, but actual reach differs from the target.</span></div>
        <div className="non"><b>×</b><strong>NON-COMPLIANT</strong><span>One or more required reporting elements are missing or incomplete.</span></div>
      </div>
      <div className="meal-compliance-list">
        {activities.map((r, i) => {
          const c = compliance(r);
          const name = first(r, ['activity_title','activity_name','activityName'], 'Approved activity');
          const code = first(r, ['activity_code','activityCode','code'], first(r, ['reference'], '—'));
          const directorate = first(r, ['directorate','directorate_name','directorateName'], first(r, ['programme','programme_name','programmeName'], '—'));
          const href = `/admin/reports/${encodeURIComponent(r.reference)}`;
          return <Link href={href} className={`meal-compliance-row ${c.state}`} key={r.reference || i}>
            <div className="meal-compliance-icon">▣</div>
            <div className="meal-compliance-activity"><small>ACTIVITY · {code}</small><strong>{name}</strong><span>{directorate}</span></div>
            <div className="meal-compliance-status"><b>{c.state === 'ok' ? '✓' : c.state === 'variance' ? '!' : '×'}</b><strong>{c.label}</strong><span>{c.description}</span></div>
            <div className="meal-compliance-variance"><small>REACH / TARGET</small><strong>{c.reached.toLocaleString()} / {c.planned.toLocaleString()}</strong><span>Variance: {c.variance > 0 ? '+' : ''}{c.variance.toLocaleString()}</span>{c.missing.length > 0 && <em>Outstanding: {c.missing.join(', ')}</em>}</div>
            <span className="meal-compliance-link">View approved report →</span>
          </Link>;
        })}
        {!activities.length && <div className="phase1-empty">No approved activities available for compliance review.</div>}
      </div>
    </div>, host
  );
}
