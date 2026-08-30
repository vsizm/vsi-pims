import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { isAdminSession } from '../../login/route';

export async function GET() {
  const token = (await cookies()).get('vsi_admin_session')?.value;
  if (!isAdminSession(token)) return Response.json({ error: 'Unauthorised.' }, { status: 401 });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const reports = await sql`
      SELECT
        reference, activity_title, activity_date, directorate, programme, project, activity_code,
        province, district, constituency, ward_community, venue,
        reporter_full_name, implementation_status, implementation_change,
        participant_total, participant_female, participant_male, participants_with_disabilities,
        objectives, activity_delivered, follow_up_actions, challenges, challenges_addressed,
        lessons_learned, future_improvements, safeguarding_status, overall_assessment,
        review_status, created_at AS received_at
      FROM activity_reports
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC, reference DESC
      LIMIT 200
    `;
    return Response.json({ reports });
  } catch (error) {
    console.error('admin activity intelligence failed', error);
    return Response.json({ error: error?.message || 'Unable to load activity intelligence.' }, { status: 500 });
  }
}
