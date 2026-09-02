'use client';

import { useEffect, useState } from 'react';

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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setItems(reports.flatMap((r) => reportActions(r).map((a) => ({
          ...a,
          reference: reportField(r, ['reference']),
          code: reportField(r, ['activity_code', 'activityCode', 'code'], 'Activity'),
          name: reportField(r, ['activity_title', 'activity_name', 'activityName'], 'Approved activity'),
          directorate: reportField(r, ['directorate', 'directorate_name', 'directorateName'], 'Directorate not recorded'),
        }))));
      } catch { /* keep the page available if follow-up data is unavailable */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="meal-followup-page">
      <div className="phase1-card meal-followup-actions">
        <div className="phase1-card-head">
          <div><span>FOLLOW-UP ACTIONS</span><h2>Pending & in-progress actions</h2><p>Actions requiring follow-up from approved activity reports.</p></div>
        </div>
        {loading ? <div className="meal-followup-empty"><span>Loading follow-up actions…</span></div> : !items.length ? (
          <div className="meal-followup-empty"><strong>✓ No pending follow-up actions</strong><span>All current approved activities have no outstanding actions requiring follow-up.</span></div>
        ) : (
          <div className="meal-followup-list">
            {items.map((item, index) => {
              const overdue = item.deadline && new Date(item.deadline).toString() !== 'Invalid Date' && new Date(item.deadline) < new Date();
              return <a key={`${item.reference}-${index}`} className="meal-followup-row" href={`/admin/reports/${encodeURIComponent(item.reference)}`}>
                <div className="meal-followup-main"><small>{item.code}</small><strong>{item.name}</strong><span>{item.directorate}</span></div>
                <div className="meal-followup-action"><b>{item.action}</b><span className={`meal-followup-status ${statusLabel(item.status) === 'IN PROGRESS' ? 'progress' : 'pending'}`}>{statusLabel(item.status)}</span></div>
                <div className="meal-followup-owner"><small>RESPONSIBLE</small><strong>{item.responsible || 'Not recorded'}</strong></div>
                <div className="meal-followup-deadline"><small>DEADLINE</small><strong className={overdue ? 'overdue' : ''}>{item.deadline || 'Not recorded'}</strong>{overdue ? <span>OVERDUE</span> : null}</div>
                <span className="meal-followup-link">View report →</span>
              </a>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
