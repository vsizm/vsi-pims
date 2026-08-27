import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { isAdminSession } from '../../login/route';

export async function GET(request, { params }) {
  const token = (await cookies()).get('vsi_admin_session')?.value;
  if (!isAdminSession(token)) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const { reference } = await params;
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT * FROM activity_reports WHERE reference = ${reference} LIMIT 1`;
    if (!rows.length) return Response.json({ error: 'Report not found.' }, { status: 404 });
    return Response.json({ report: rows[0] });
  } catch (error) {
    console.error('admin activity report detail failed', error);
    return Response.json({ error: 'Unable to load the activity report.' }, { status: 500 });
  }
}
