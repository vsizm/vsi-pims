'use client';

import { useState } from 'react';

export default function ReviewActions({ reference, currentStatus = 'PENDING REVIEW' }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (currentStatus !== 'PENDING REVIEW') return <div className="notice"><strong>Review completed: {currentStatus}</strong>{reason && <><br />Reason: {reason}</>}</div>;

  async function review(action) {
    setError(''); setMessage('');
    const needsReason = action !== 'APPROVED';
    if (needsReason && !reason.trim()) { setError(`Please provide a reason before ${action === 'RETURNED' ? 'returning' : 'rejecting'} this report.`); return; }
    const label = action === 'APPROVED' ? 'approve' : action === 'RETURNED' ? 'return this report for correction' : 'reject this report';
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;
    setBusy(action);
    try {
      const response = await fetch('/api/admin/activity-reports/manage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, action, reason: reason.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to complete the review.');
      setMessage(action === 'APPROVED' ? 'Report approved successfully.' : action === 'RETURNED' ? 'Report returned. A notification email was sent to the submitting officer.' : 'Report rejected. A notification email was sent to the submitting officer.');
      window.setTimeout(() => { window.location.href = '/admin/reports'; }, 1200);
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  }

  return <div>
    <div className="review-actions-grid">
      <button type="button" className="review-btn approve" disabled={!!busy} onClick={() => review('APPROVED')}>{busy === 'APPROVED' ? 'Approving…' : '✓ Approve Report'}</button>
      <button type="button" className="review-btn return" disabled={!!busy} onClick={() => review('RETURNED')}>{busy === 'RETURNED' ? 'Returning…' : '↩ Return for Correction'}</button>
      <button type="button" className="review-btn reject" disabled={!!busy} onClick={() => review('REJECTED')}>{busy === 'REJECTED' ? 'Rejecting…' : '✕ Reject Report'}</button>
    </div>
    <label style={{ marginTop: 22 }}>Reason for return / rejection
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required when returning or rejecting a report." />
    </label>
    {error && <div className="error">{error}</div>}
    {message && <div className="notice" style={{ marginTop: 18 }}>{message}</div>}
  </div>;
}
