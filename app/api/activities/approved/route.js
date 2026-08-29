import { GET as getApprovedActivities } from '../../approved-activities/route';

const programmeByCode = {
  CEV: 'Community Engagement & Volunteerism',
  EIE: 'Education, Innovation & Entrepreneurship',
  MHSW: 'Mental Health & Social Wellbeing',
  CASD: 'Climate Action & Sustainable Development',
  CLDG: 'Civic Leadership & Democratic Governance',
  PAR: 'Policy, Advocacy & Research',
  CPRM: 'Child Protection & Protection Management',
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
  return Response.json({
    activities: activities.map((activity) => ({
      ...activity,
      programme: enrichProgramme(activity),
      directorate: enrichDirectorate(activity),
    })),
  });
}
