import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { isAdminSession } from '../../login/route';

async function guard() { const token = (await cookies()).get('vsi_admin_session')?.value; return isAdminSession(token); }
const allowed = ['activity_title','activity_type','activity_date','directorate','programme','project','activity_code','venue','province','district','reporter_full_name','reporter_position','reporter_phone','reporter_email','supervisor_full_name','supervisor_position','funding_source','donor_name','grant_title','grant_reference','activity_description','target_group','participant_total','participant_female','participant_male','participant_other','objectives','activity_delivered','implementation_status','implementation_change','knowledge_skills','key_issues','participant_feedback','immediate_outcomes','notable_achievements','results_evidence','overall_assessment','assessment_explanation','approved_budget','actual_spent','budget_status','overspend_cause','challenges','challenges_addressed','lessons_learned','future_improvements','safeguarding_status'];
async function prepare(sql) { await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`; await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS deleted_by TEXT`; await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS last_edited_by TEXT`; await sql`CREATE TABLE IF NOT EXISTS activity_report_audit (id BIGSERIAL PRIMARY KEY, reference TEXT NOT NULL, action TEXT NOT NULL, actor TEXT NOT NULL, details TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`; }

export async function PATCH(request) {
  if (!(await guard())) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const { reference, fields = {}, actor = 'Administrator' } = await request.json();
  if (!reference || !fields || typeof fields !== 'object') return Response.json({ error: 'Invalid request.' }, { status: 400 });
  try { const sql = neon(process.env.DATABASE_URL); await prepare(sql); for (const key of allowed) if (Object.prototype.hasOwnProperty.call(fields, key)) await sql`UPDATE activity_reports SET ${sql(key)} = ${fields[key]}, updated_at = NOW(), last_edited_by = ${actor} WHERE reference = ${reference} AND deleted_at IS NULL`; await sql`INSERT INTO activity_report_audit (reference, action, actor, details) VALUES (${reference}, 'EDIT', ${actor}, ${JSON.stringify(Object.keys(fields))})`; return Response.json({ ok: true }); } catch (error) { console.error('activity report edit failed', error); return Response.json({ error: 'Unable to save changes.' }, { status: 500 }); }
}

export async function DELETE(request) {
  if (!(await guard())) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const { reference, actor = 'Administrator' } = await request.json();
  if (!reference) return Response.json({ error: 'Reference is required.' }, { status: 400 });
  try { const sql = neon(process.env.DATABASE_URL); await prepare(sql); await sql`UPDATE activity_reports SET deleted_at = NOW(), deleted_by = ${actor}, updated_at = NOW() WHERE reference = ${reference} AND deleted_at IS NULL`; await sql`INSERT INTO activity_report_audit (reference, action, actor) VALUES (${reference}, 'DELETE', ${actor})`; return Response.json({ ok: true }); } catch (error) { console.error('activity report delete failed', error); return Response.json({ error: 'Unable to delete report.' }, { status: 500 }); }
}
