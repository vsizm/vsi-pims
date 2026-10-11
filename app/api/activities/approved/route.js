import { GET as getApprovedActivities } from '../../approved-activities/route';
import { neon } from '@neondatabase/serverless';

const programmeByCode = {
  CEV: 'Community Engagement & Volunteerism',
  EIE: 'Education, Innovation & Entrepreneurship',
  MHSW: 'Mental Health & Social Wellbeing',
  CASD: 'Climate Action & Sustainable Development',
  CLDG: 'Civic Leadership & Democratic Governance',
  PAR: 'Policy, Advocacy & Research',
  CPRM: 'Child Protection & Rights Management',
  NVP: 'National Values and Principles',
  VMP: 'Volunteer Management',
  CSVP: 'Community Service and Volunteerism',
  SOP: 'School Outreach',
  AAP: 'Agriculture and Agro-processing',
  TIEP: 'Technology and Innovation Entrepreneurship',
  MHRP: 'Mental Health Resilience',
  SPP: 'Suicide Prevention',
  KZCGH: 'Keep Zambia Clean, Green and Healthy',
  VEP: 'Voter Education',
  SPD: 'Strategic Partnerships Development',
  SER: 'Stakeholder Relations & Events',
  HP: 'Health Promotion',
};

function enrichProgramme(activity) {
  const code = String(activity?.code ?? activity?.activityCode ?? '').trim();
  const existing = String(
    activity?.programme ??
      activity?.programmeName ??
      activity?.program ??
      activity?.programName ??
      activity?.programmeCode ??
      activity?.programCode ??
      ''
  ).trim();
  const existingCode = existing.toUpperCase();
  const parts = code.split('-').map((part) => part.toUpperCase());
  const prefix = parts[0] ?? '';
  const programmeCode = prefix === 'PROG' ? (parts[1] ?? '') : prefix;

  if (programmeByCode[existingCode]) return programmeByCode[existingCode];
  if (programmeByCode[programmeCode]) return programmeByCode[programmeCode];
  return existing || prefix;
}

function enrichDirectorate(activity) {
  const existing = String(activity?.directorate ?? '').trim();
  if (existing) return existing;

  const programme = String(enrichProgramme(activity)).trim().toUpperCase();
  if (programme === 'HEALTH PROMOTION') return 'Programmes Directorate';

  return '';
}

export async function GET(request) {
  const response = await getApprovedActivities(request);
  const data = await response.json();
  const activities = Array.isArray(data?.activities) ? data.activities : [];
  let plannedActivities = [];
  // Keep the legacy register available if the planned-activity migration has not
  // yet been applied in a particular environment.
  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      const q = (new URL(request.url).searchParams.get('search') || '').trim().slice(0, 120);
      plannedActivities = await sql`
        SELECT a.id, a.code, a.title, p.name AS project_name, g.name AS programme_name,
               g.directorate
        FROM vsi_planned_activities a
        JOIN vsi_projects p ON p.id = a.project_id
        JOIN vsi_programmes g ON g.id = p.programme_id
        WHERE a.status = 'Active' AND a.archived_at IS NULL
          AND p.archived_at IS NULL AND g.archived_at IS NULL
          AND (${q} = '' OR a.code ILIKE ${'%' + q + '%'} OR a.title ILIKE ${'%' + q + '%'})
        ORDER BY a.title LIMIT 100
      `;
    } catch (error) {
      console.error('planned activity lookup unavailable; using legacy register', error);
    }
  }
  const q = (new URL(request.url).searchParams.get('search') || '').trim().toLowerCase();
  const legacy = activities.map((activity) => ({
    ...activity,
    programme: enrichProgramme(activity),
    directorate: enrichDirectorate(activity),
    plannedActivityId: '',
  }));
  const planned = plannedActivities.map((activity) => ({
    id: activity.id,
    plannedActivityId: String(activity.id),
    code: activity.code,
    activityCode: activity.code,
    name: activity.title,
    activityName: activity.title,
    project: activity.project_name,
    programme: activity.programme_name,
    directorate: activity.directorate || 'Programmes Directorate',
  }));
  const combined = [...planned, ...legacy].filter((activity) => !q || `${activity.code || activity.activityCode || ''} ${activity.name || activity.activityName || ''}`.toLowerCase().includes(q));
  return Response.json({ activities: combined });
}
