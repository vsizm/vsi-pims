import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { isAdminSession } from '../../login/route';

export async function GET(request, { params }) {
  const token = (await cookies()).get('vsi_admin_session')?.value;
  if (!isAdminSession(token)) return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  const { reference } = await params;
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT *,
        CASE
          WHEN overall_assessment IS NULL OR TRIM(overall_assessment) = '' THEN NULL
          WHEN LOWER(TRIM(overall_assessment)) IN ('excellent', 'excellent performance') THEN 100
          WHEN LOWER(TRIM(overall_assessment)) IN ('good', 'good performance') THEN 75
          WHEN LOWER(TRIM(overall_assessment)) IN ('satisfactory', 'satisfactory performance') THEN 50
          WHEN LOWER(TRIM(overall_assessment)) IN ('needs improvement', 'needs improvement performance') THEN 25
          WHEN overall_assessment ~ '^\\s*[0-9]{1,3}(?:\\.[0-9]+)?\\s*%?\\s*$' THEN LEAST(100, GREATEST(0, CAST(REGEXP_REPLACE(overall_assessment, '[^0-9.]', '', 'g') AS NUMERIC)))
          ELSE NULL
        END AS assessment_score
      FROM activity_reports
      WHERE reference = ${reference}
      LIMIT 1
    `;
    if (!rows.length) return Response.json({ error: 'Report not found.' }, { status: 404 });
    return Response.json({ report: rows[0] });
  } catch (error) {
    console.error('admin activity report detail failed', error);
    return Response.json({ error: 'Unable to load the activity report.' }, { status: 500 });
  }
}
