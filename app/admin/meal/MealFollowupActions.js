'use client';

import { useEffect } from 'react';

const text = (v) => typeof v === 'string' ? v.trim() : '';
const first = (o, keys) => keys.map((k) => o?.[k]).find((v) => v !== undefined && v !== null && v !== '') ?? '';
const normal = (v) => text(v).toLowerCase().replace(/[_-]+/g, ' ');
const openStatus = (v) => /^(pending|in progress|in-progress|pending action|open|outstanding|awaiting)/i.test(normal(v));
const statusLabel = (v) => /^in progress|in-progress/i.test(normal(v)) ? 'IN PROGRESS' : 'PENDING';

function actionCandidates(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) value.forEach((v) => actionCandidates(v, out));
  else {
    const action = first(value, ['action', 'action_item', 'actionItem', 'follow_up_action', 'followUpAction', 'task', 'next_step', 'nextStep', 'description', 'title']);
    const status = first(value, ['status', 'state', 'action_status', 'actionStatus']);
    const responsible = first(value, ['responsible_person', 'responsiblePerson', 'responsible', 'owner', 'assigned_to', 'assignedTo']);
    const deadline = first(value, ['deadline', 'due_date', 'dueDate', 'target_date', 'targetDate']);
    if (action && status) out.push({ action, status, responsible, deadline });
    Object.entries(value).forEach(([key, child]) => {
      if (/action|follow|next.?step|recommend|outstanding|pending/i.test(key)) actionCandidates(child, out);
    });
  }
  return out;
}

function reportActions(report) {
  const roots = [
    report.follow_up_actions, report.followUpActions, report.followups, report.follow_ups,
    report.action_items, report.actionItems, report.pending_actions, report.pendingActions,
    report.next_steps, report.nextSteps, report.recommendations,
  ].filter(Boolean);
  return actionCandidates(roots).filter((x) => openStatus(x.status));
}

function reportField(report, keys, fallback = '') { return text(first(report, keys)) || fallback; }

export default function MealFollowupActions() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const listRes = await fetch('/api/admin/activity-reports', { cache: 'no-store' });
        const listData = await listRes.json();
        if (!listRes.ok) return;
        const approved = (listData.reports || []).filter((r) => r.review_status === 'APPROVED');
        const reports = await Promise.all(approved.map(async (r) => {
          try {
            const res = await fetch(`/api/admin/activity-reports/${encodeURIComponent(r.reference)}`, { cache: 'no-store' });
            const data = await res.json();
            return data.report || r;
          } catch { return r; }
        }));
        if (cancelled) return;

        const host = document.querySelector('.phase1-bottom-grid');
        const old = [...(host?.children || [])].find((el) => el.querySelector?.('h2')?.textContent?.trim() === 'Evidence of change');
        if (!host || !old) return;
        old.style.display = 'none';

        const existing = host.querySelector('.meal-followup-actions');
        if (existing) existing.remove();

        const items = reports.flatMap((r) => reportActions(r).map((a) => ({
          ...a,
          reference: reportField(r, ['reference']),
          code: reportField(r, ['activity_code', 'activityCode', 'code'], 'Activity'),
          name: reportField(r, ['activity_title', 'activity_name', 'activityName'], 'Approved activity'),
          directorate: reportField(r, ['directorate', 'directorate_name', 'directorateName'], 'Directorate not recorded'),
        })));

        const card = document.createElement('article');
        card.className = 'phase1-card meal-followup-actions';
        const head = document.createElement('div');
        head.className = 'phase1-card-head';
        head.innerHTML = '<div><span>FOLLOW-UP ACTIONS</span><h2>Pending & in-progress actions</h2><p>Actions requiring follow-up from approved activity reports.</p></div>';
        card.appendChild(head);

        if (!items.length) {
          const empty = document.createElement('div');
          empty.className = 'meal-followup-empty';
          empty.innerHTML = '<strong>✓ No pending follow-up actions</strong><span>All current approved activities have no outstanding actions requiring follow-up.</span>';
          card.appendChild(empty);
        } else {
          const list = document.createElement('div');
          list.className = 'meal-followup-list';
          items.forEach((item) => {
            const link = document.createElement('a');
            link.className = 'meal-followup-row';
            link.href = `/admin/reports/${encodeURIComponent(item.reference)}`;
            const overdue = item.deadline && new Date(item.deadline).toString() !== 'Invalid Date' && new Date(item.deadline) < new Date();
            link.innerHTML = `<div class="meal-followup-main"><small>${item.code}</small><strong>${item.name}</strong><span>${item.directorate}</span></div><div class="meal-followup-action"><b>${item.action}</b><span class="meal-followup-status ${statusLabel(item.status) === 'IN PROGRESS' ? 'progress' : 'pending'}">${statusLabel(item.status)}</span></div><div class="meal-followup-owner"><small>RESPONSIBLE</small><strong>${item.responsible || 'Not recorded'}</strong></div><div class="meal-followup-deadline"><small>DEADLINE</small><strong class="${overdue ? 'overdue' : ''}">${item.deadline || 'Not recorded'}</strong>${overdue ? '<span>OVERDUE</span>' : ''}</div><span class="meal-followup-link">View report →</span>`;
            list.appendChild(link);
          });
          card.appendChild(list);
        }
        host.insertBefore(card, old);

        // Reorder only the MEAL intelligence cards; do not alter their content or behaviour.
        const footprint = host.querySelector('.footprint-panel');
        const programme = host.querySelector('.meal-programme-host');
        const compliance = host.querySelector('.meal-compliance-host');
        const ordered = [footprint, programme, compliance, card].filter(Boolean);
        if (ordered.length > 1) {
          let anchor = ordered[0];
          ordered.slice(1).forEach((el) => {
            host.insertBefore(el, anchor.nextSibling);
            anchor = el;
          });
        }
      } catch { /* keep the existing MEAL page intact if follow-up data is unavailable */ }
    })();
    return () => { cancelled = true; };
  }, []);

  return null;
}
