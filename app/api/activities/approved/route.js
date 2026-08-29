import { GET as getApprovedActivities } from '../../approved-activities/route';

const programmeByCode = {
  CEV: 'CEV',
  EIE: 'EIE',
  MHSW: 'MHSW',
  CASD: 'CASD',
  CLDG: 'CLDG',
  PAR: 'Policy, Advocacy & Research',
  CPRM: 'CPRM',
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
  const prefix = code.split('-')[0].toUpperCase();

  if (programmeByCode[existingCode]) return programmeByCode[existingCode];
  if (programmeByCode[prefix]) return programmeByCode[prefix];
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
