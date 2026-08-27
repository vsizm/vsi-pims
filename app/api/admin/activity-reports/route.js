import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { isAdminSession } from '../login/route';

export async function GET() {
  const token = (await cookies()).get('vsi_admin_session')?.value;
  if (!isAdminSession(token)) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`;
    await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS deleted_by TEXT`;
    await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS last_edited_by TEXT`;
    await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'PENDING REVIEW'`;
    await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`;
    await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS reviewed_by TEXT`;
    await sql`ALTER TABLE activity_reports ADD COLUMN IF NOT EXISTS review_reason TEXT`;
    await sql`CREATE TABLE IF NOT EXISTS activity_report_audit (id BIGSERIAL PRIMARY KEY, reference TEXT NOT NULL, action TEXT NOT NULL, actor TEXT NOT NULL, details TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    const reports = await sql`SELECT reference, activity_title, activity_date, directorate, programme, project, reporter_full_name, reporter_position, reporter_email, funding_source, participant_total, overall_assessment, review_status, reviewed_at, reviewed_by, review_reason, created_at AS received_at, deleted_at, deleted_by, last_edited_by FROM activity_reports WHERE deleted_at IS NULL ORDER BY created_at DESC, reference DESC LIMIT 100`;
    return Response.json({ reports });
  } catch (error) {
    console.error('admin activity report list failed', error);
    return Response.json({ error: error?.message || 'Unable to load activity reports.' }, { status: 500 });
  }
}
