'use client';
import { useState } from 'react';

export default function ReviewActions({ reference, status = 'PENDING_REVIEW', comment: initialComment = '' }) {
  const [current, setCurrent] = useState(status || 'PENDING_REVIEW');
  const [comment, setComment] = useState(initialComment || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function decide(next) {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/activity-reports/manage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, status: next, comment, actor: 'Administrator' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save review decision.');
      setCurrent(next); setMessage(`Report marked ${next === 'PENDING_REVIEW' ? 'pending review' : next.toLowerCase()}.`);
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <div>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
      <button type="button" disabled={busy} onClick={() => decide('APPROVED')} className="small-btn">✓ Approve</button>
      <button type="button" disabled={busy} onClick={() => decide('RETURNED')} className="small-btn">↩ Return for correction</button>
      <button type="button" disabled={busy} onClick={() => decide('REJECTED')} style={{ border: '1px solid #b42318', color: '#b42318', background: '#fff', borderRadius: 8, padding: '8px 10px', fontWeight: 800, cursor: busy ? 'wait' : 'pointer' }}>Reject</button>
      {current !== 'PENDING_REVIEW' && <button type="button" disabled={busy} onClick={() => decide('PENDING_REVIEW')} className="small-btn">Reset to pending</button>}
    </div>
    <label>Review comment<textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a decision note or correction request…" rows={4} /></label>
    {message && <div className="notice" style={{ marginTop: 12 }}>{message}</div>}
    <p className="hint" style={{ marginTop: 10 }}>Current status: <strong>{current.replace('_', ' ')}</strong></p>
  </div>;
}
