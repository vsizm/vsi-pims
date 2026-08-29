import { GET as getApprovedActivities } from '../../approved-activities/route';

const programmeByCode = {
  CEV: 'CEV',
  EIE: 'EIE',
  MHSW: 'MHSW',
  CASD: 'CASD',
  CLDG: 'CLDG',
  PAR: 'Policy, Advocacy & Research',
  CPRM: 'CPRM',
};

function enrichProgramme(activity) {
  const code = String(activity?.code ?? activity?.activityCode ?? '').trim();
  const existing = activity?.programme ?? activity?.programmeName ?? activity?.program ?? '';
  const existingCode = String(existing).trim().toUpperCase();
  if (existing && !programmeByCode[existingCode]) return existing;
  const prefix = code.split('-')[0].toUpperCase();
  return programmeByCode[prefix] ?? existing ?? prefix;
}

export async function GET(request) {
  const response = await getApprovedActivities(request);
  const data = await response.json();
  const activities = Array.isArray(data?.activities) ? data.activities : [];
  return Response.json({
    activities: activities.map((activity) => ({
      ...activity,
      programme: enrichProgramme(activity),
    })),
  });
}
