import { GET as getApprovedActivities } from '../../approved-activities/route';

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

export async function GET(request) {
  const response = await getApprovedActivities(request);
  const data = await response.json();
  const activities = Array.isArray(data?.activities) ? data.activities : [];
  return Response.json({ activities: activities.map(normalizeApprovedActivity) });
}
