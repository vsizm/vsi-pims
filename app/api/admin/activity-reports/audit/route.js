import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { isAdminSession } from '../../login/route';

export async function POST(request) {
  const token = (await cookies()).get('vsi_admin_session')?.value;
  if (!isAdminSession(token)) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const body = await request.json();
  const { reference, action, username = 'Administrator', details = null } = body || {};
  if (!reference || !['EDIT','DELETE'].includes(action)) return Response.json({ error: 'Invalid audit request.' }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`CREATE TABLE IF NOT EXISTS activity_report_audit (id BIGSERIAL PRIMARY KEY, reference TEXT NOT NULL, action TEXT NOT NULL, actor TEXT NOT NULL, details TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await sql`INSERT INTO activity_report_audit (reference, action, actor, details) VALUES (${reference}, ${action}, ${username}, ${details})`;
    return Response.json({ ok: true });
  } catch (error) {
    console.error('activity report audit failed', error);
    return Response.json({ error: 'Unable to record audit event.' }, { status: 500 });
  }
}
