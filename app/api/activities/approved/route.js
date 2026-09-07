import { neon } from '@neondatabase/serverless';
import { GET as getLegacyApprovedActivities } from '../../approved-activities/route';

function normalizeApprovedActivity(activity) {
  return {
    ...activity,
    code: String(activity?.code ?? activity?.activityCode ?? '').trim(),
    name: activity?.name ?? activity?.activityName ?? '',
    programme: activity?.programme ?? activity?.programmeName ?? '',
    project: activity?.project ?? activity?.projectName ?? '',
    directorate: activity?.directorate ?? '',
    unSdgsAlignment: activity?.unSdgsAlignment ?? activity?.sdgsAlignment ?? '',
    auAgenda2063Alignment: activity?.auAgenda2063Alignment ?? activity?.agenda2063Alignment ?? '',
  };
}

async function getCatalogueActivities(request) {
  if (!process.env.DATABASE_URL) return [];
  const sql = neon(process.env.DATABASE_URL);
  const params = new URL(request.url).searchParams;
  const q = (params.get('q') ?? params.get('search') ?? '').trim();
  const rows = q
    ? await sql`SELECT a.code, a.name, p.name AS programme, p.code AS programme_code, pr.name AS project, pr.code AS project_code, a.directorate, a.un_sdgs_alignment AS "unSdgsAlignment", a.au_agenda_2063_alignment AS "auAgenda2063Alignment" FROM activities a JOIN projects pr ON pr.code = a.project_code JOIN programmes p ON p.code = pr.programme_code WHERE a.approval_status = 'APPROVED' AND (a.code ILIKE ${'%' + q + '%'} OR a.name ILIKE ${'%' + q + '%'}) ORDER BY a.code`
    : await sql`SELECT a.code, a.name, p.name AS programme, p.code AS programme_code, pr.name AS project, pr.code AS project_code, a.directorate, a.un_sdgs_alignment AS "unSdgsAlignment", a.au_agenda_2063_alignment AS "auAgenda2063Alignment" FROM activities a JOIN projects pr ON pr.code = a.project_code JOIN programmes p ON p.code = pr.programme_code WHERE a.approval_status = 'APPROVED' ORDER BY a.code`;
  return rows.map(normalizeApprovedActivity);
}

export async function GET(request) {
  const legacyResponse = await getLegacyApprovedActivities(request);
  const legacyData = await legacyResponse.json();
  const legacyActivities = Array.isArray(legacyData?.activities) ? legacyData.activities.map(normalizeApprovedActivity) : [];
  let catalogueActivities = [];
  try {
    catalogueActivities = await getCatalogueActivities(request);
  } catch (error) {
    console.error('authoritative activity catalogue lookup failed', error);
  }

  const merged = new Map();
  for (const activity of legacyActivities) if (activity.code) merged.set(activity.code, activity);
  for (const activity of catalogueActivities) if (activity.code) merged.set(activity.code, activity);
  return Response.json({ activities: Array.from(merged.values()) });
}
