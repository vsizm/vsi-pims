import { GET as getApprovedActivities } from '../../approved-activities/route';

export async function GET(request) {
  const response = await getApprovedActivities(request);
  const activities = await response.json();
  return Response.json({ activities });
}
