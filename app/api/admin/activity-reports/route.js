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
    const reports = await sql`SELECT reference, activity_title, activity_date, directorate, programme, project, reporter_full_name, reporter_position, reporter_email, funding_source, participant_total, overall_assessment, COALESCE(received_at, created_at, NOW()) AS received_at, updated_at, deleted_at, deleted_by FROM activity_reports WHERE deleted_at IS NULL ORDER BY COALESCE(received_at, created_at, activity_date) DESC, reference DESC LIMIT 100`;
    return Response.json({ reports });
  } catch (error) {
    console.error('admin activity report list failed', error);
    return Response.json({ error: 'Unable to load activity reports.' }, { status: 500 });
  }
}
