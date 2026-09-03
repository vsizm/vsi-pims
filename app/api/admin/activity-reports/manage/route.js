import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { getAdminSessionUsername } from '../../login/route';

async function guard() {
  const token = (await cookies()).get('vsi_admin_session')?.value;
  return getAdminSessionUsername(token);
}

const allowed = ['activity_title','activity_type','activity_date','directorate','programme','project','activity_code','venue','province','district','reporter_full_name','reporter_position','reporter_phone','reporter_email','supervisor_full_name','supervisor_position','funding_source','donor_name','grant_title','grant_reference','activity_description','target_group','participant_total','participant_female','participant_male','participant_other','objectives','activity_delivered','implementation_status','implementation_change','knowledge_skills','key_issues','participant_feedback','immediate_outcomes','notable_achievements','results_evidence','overall_assessment','assessment_explanation','approved_budget','actual_spent','budget_status','overspend_cause','challenges','challenges_addressed','lessons_learned','future_improvements','safeguarding_status'];

export async function PATCH(request) {
  const actor = await guard();
  if (!actor) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const { reference, fields = {} } = await request.json();
  if (!reference || !fields || typeof fields !== 'object' || Array.isArray(fields)) return Response.json({ error: 'Invalid request.' }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(fields, key)) await sql`UPDATE activity_reports SET ${sql(key)} = ${fields[key]}, updated_at = NOW(), last_edited_by = ${actor} WHERE reference = ${reference} AND deleted_at IS NULL`;
    await sql`INSERT INTO activity_report_audit (reference, action, actor, details) VALUES (${reference}, 'EDIT', ${actor}, ${JSON.stringify(Object.keys(fields))})`;
    return Response.json({ ok: true });
  } catch (error) { console.error('activity report edit failed', error); return Response.json({ error: 'Unable to save changes.' }, { status: 500 }); }
}

export async function POST(request) {
  const actor = await guard();
  if (!actor) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const { reference, status, comment = '' } = await request.json();
  const allowedStatuses = ['PENDING_REVIEW', 'APPROVED', 'RETURNED', 'REJECTED'];
  if (!reference || !allowedStatuses.includes(status)) return Response.json({ error: 'Invalid review decision.' }, { status: 400 });
  if (typeof comment !== 'string' || comment.length > 2000) return Response.json({ error: 'Review comment is too long.' }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const updated = await sql`UPDATE activity_reports SET review_status = ${status}, reviewed_by = ${actor}, reviewed_at = NOW(), review_comment = ${comment || null}, updated_at = NOW() WHERE reference = ${reference} AND deleted_at IS NULL RETURNING reference`;
    if (!updated.length) return Response.json({ error: 'Report not found or already deleted.' }, { status: 404 });
    await sql`INSERT INTO activity_report_audit (reference, action, actor, details) VALUES (${reference}, ${status}, ${actor}, ${comment || null})`;
    return Response.json({ ok: true, status });
  } catch (error) { console.error('activity report review failed', error); return Response.json({ error: 'Unable to save review decision.' }, { status: 500 }); }
}

export async function DELETE(request) {
  const actor = await guard();
  if (!actor) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const { reference } = await request.json();
  if (!reference) return Response.json({ error: 'Reference is required.' }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const deleted = await sql`UPDATE activity_reports SET deleted_at = NOW(), deleted_by = ${actor}, updated_at = NOW() WHERE reference = ${reference} AND deleted_at IS NULL RETURNING reference`;
    if (!deleted.length) return Response.json({ error: 'Report not found or already deleted.' }, { status: 404 });
    await sql`INSERT INTO activity_report_audit (reference, action, actor) VALUES (${reference}, 'DELETE', ${actor})`;
    return Response.json({ ok: true });
  } catch (error) { console.error('activity report delete failed', error); return Response.json({ error: 'Unable to delete report.' }, { status: 500 }); }
}
