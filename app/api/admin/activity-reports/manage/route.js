import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { isAdminSession } from '../../login/route';

async function guard() { const token = (await cookies()).get('vsi_admin_session')?.value; return isAdminSession(token); }
const allowed = ['activity_title','activity_type','activity_date','directorate','programme','project','activity_code','venue','province','district','reporter_full_name','reporter_position','reporter_phone','reporter_email','supervisor_full_name','supervisor_position','funding_source','donor_name','grant_title','grant_reference','activity_description','target_group','participant_total','participant_female','participant_male','participant_other','objectives','activity_delivered','implementation_status','implementation_change','knowledge_skills','key_issues','participant_feedback','immediate_outcomes','notable_achievements','results_evidence','overall_assessment','assessment_explanation','approved_budget','actual_spent','budget_status','overspend_cause','challenges','challenges_addressed','lessons_learned','future_improvements','safeguarding_status'];

async function prepare(sql) {
  await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`;
  await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS deleted_by TEXT`;
  await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS last_edited_by TEXT`;
  await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'PENDING REVIEW'`;
  await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS reviewed_by TEXT`;
  await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS review_reason TEXT`;
  await sql`CREATE TABLE IF NOT EXISTS activity_report_audit (id BIGSERIAL PRIMARY KEY, reference TEXT NOT NULL, action TEXT NOT NULL, actor TEXT NOT NULL, details TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
}

function actorName(token) {
  try { return process.env.VSI_ADMIN_NAME || Buffer.from(token.split('.')[0], 'base64url').toString('utf8').split('|')[0] || 'Administrator'; } catch { return process.env.VSI_ADMIN_NAME || 'Administrator'; }
}
function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

async function sendReviewEmail({ to, reference, activityTitle, status, reason, actor }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.VSI_EMAIL_FROM;
  if (!apiKey || !from) throw new Error('Email notification is not configured. Set RESEND_API_KEY and VSI_EMAIL_FROM.');
  const adminEmail = process.env.VSI_ADMIN_EMAIL || '';
  const adminPhone = process.env.VSI_ADMIN_PHONE || '';
  const actionWord = status === 'RETURNED' ? 'returned for correction' : 'rejected';
  const subject = `Activity Report ${status === 'RETURNED' ? 'Returned for Correction' : 'Rejected'} — ${reference}`;
  const text = `Dear ${activityTitle ? 'VSI Activity Report Officer' : 'Officer'},\n\nYour Activity Report ${reference}${activityTitle ? ` (${activityTitle})` : ''} has been ${actionWord}.\n\nReason for ${status === 'RETURNED' ? 'return' : 'rejection'}:\n${reason}\n\nPlease make the necessary corrections and submit a fresh Activity Report.\n\nRegards,\n${actor}\nVisionary Students Initiative (VSI)\n${adminEmail}${adminPhone ? `\n${adminPhone}` : ''}`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#17212b"><p>Dear Activity Report Officer,</p><p>Your Activity Report <strong>${escapeHtml(reference)}</strong>${activityTitle ? ` (${escapeHtml(activityTitle)})` : ''} has been <strong>${escapeHtml(actionWord)}</strong>.</p><p><strong>Reason for ${status === 'RETURNED' ? 'return' : 'rejection'}:</strong><br>${escapeHtml(reason).replace(/\n/g, '<br>')}</p><p>Please make the necessary corrections and submit a fresh Activity Report.</p><p>Regards,<br><strong>${escapeHtml(actor)}</strong><br>Visionary Students Initiative (VSI)<br>${escapeHtml(adminEmail)}${adminPhone ? `<br>${escapeHtml(adminPhone)}` : ''}</p></div>`;
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject, text, html }) });
  if (!response.ok) { const detail = await response.text(); throw new Error(`Email provider error: ${detail}`); }
}

export async function PATCH(request) {
  if (!(await guard())) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const token = (await cookies()).get('vsi_admin_session')?.value;
  const { reference, fields = {}, actor = actorName(token) } = await request.json();
  if (!reference || !fields || typeof fields !== 'object') return Response.json({ error: 'Invalid request.' }, { status: 400 });
  try { const sql = neon(process.env.DATABASE_URL); await prepare(sql); for (const key of allowed) if (Object.prototype.hasOwnProperty.call(fields, key)) await sql`UPDATE activity_reports SET ${sql(key)} = ${fields[key]}, updated_at = NOW(), last_edited_by = ${actor} WHERE reference = ${reference} AND deleted_at IS NULL`; await sql`INSERT INTO activity_report_audit (reference, action, actor, details) VALUES (${reference}, 'EDIT', ${actor}, ${JSON.stringify(Object.keys(fields))})`; return Response.json({ ok: true }); } catch (error) { console.error('activity report edit failed', error); return Response.json({ error: 'Unable to save changes.' }, { status: 500 }); }
}

export async function POST(request) {
  if (!(await guard())) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const token = (await cookies()).get('vsi_admin_session')?.value;
  const body = await request.json();
  const reference = body?.reference;
  const action = body?.action;
  const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
  const actor = body?.actor || actorName(token);
  if (!reference || !['APPROVED', 'RETURNED', 'REJECTED'].includes(action)) return Response.json({ error: 'Invalid review action.' }, { status: 400 });
  if ((action === 'RETURNED' || action === 'REJECTED') && !reason) return Response.json({ error: `A reason is required when a report is ${action === 'RETURNED' ? 'returned' : 'rejected'}.` }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    await prepare(sql);
    const rows = await sql`SELECT reference, activity_title, reporter_full_name, reporter_email, review_status FROM activity_reports WHERE reference = ${reference} AND deleted_at IS NULL LIMIT 1`;
    if (!rows.length) return Response.json({ error: 'Report not found.' }, { status: 404 });
    const report = rows[0];
    if ((report.review_status || 'PENDING REVIEW') !== 'PENDING REVIEW') return Response.json({ error: `This report has already been ${String(report.review_status || '').toLowerCase()}.` }, { status: 409 });
    if ((action === 'RETURNED' || action === 'REJECTED') && !report.reporter_email) return Response.json({ error: 'The submitting officer has no email address on this report, so the notification cannot be sent.' }, { status: 422 });

    if (action === 'RETURNED' || action === 'REJECTED') {
      await sendReviewEmail({ to: report.reporter_email, reference, activityTitle: report.activity_title, status: action, reason, actor });
    }
    await sql`UPDATE activity_reports SET review_status = ${action}, reviewed_at = NOW(), reviewed_by = ${actor}, review_reason = ${reason || null}, updated_at = NOW() WHERE reference = ${reference} AND deleted_at IS NULL AND COALESCE(review_status, 'PENDING REVIEW') = 'PENDING REVIEW'`;
    await sql`INSERT INTO activity_report_audit (reference, action, actor, details) VALUES (${reference}, ${action}, ${actor}, ${reason || null})`;
    return Response.json({ ok: true, reference, status: action, emailSent: action === 'RETURNED' || action === 'REJECTED' });
  } catch (error) {
    console.error('activity report review failed', error);
    return Response.json({ error: error?.message || 'Unable to complete review action.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await guard())) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const { reference, actor = 'Administrator' } = await request.json();
  if (!reference) return Response.json({ error: 'Reference is required.' }, { status: 400 });
  try { const sql = neon(process.env.DATABASE_URL); await prepare(sql); await sql`UPDATE activity_reports SET deleted_at = NOW(), deleted_by = ${actor}, updated_at = NOW() WHERE reference = ${reference} AND deleted_at IS NULL`; await sql`INSERT INTO activity_report_audit (reference, action, actor) VALUES (${reference}, 'DELETE', ${actor})`; return Response.json({ ok: true }); } catch (error) { console.error('activity report delete failed', error); return Response.json({ error: 'Unable to delete report.' }, { status: 500 }); }
}
