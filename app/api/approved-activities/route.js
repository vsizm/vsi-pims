const approvedActivities = [
  { activityCode: 'PROG-VMP-001', activityName: 'Volunteer Recruitment & Onboarding', project: 'Volunteer Management Project', directorate: 'Directorate of Programmes', sdgs: 'SDG 4, SDG 8, SDG 17', au: 'Aspiration 6' },
  { activityCode: 'PROG-VMP-002', activityName: 'Volunteer Induction & Orientation', project: 'Volunteer Management Project', directorate: 'Directorate of Programmes', sdgs: 'SDG 4, SDG 8, SDG 17', au: 'Aspiration 6' },
  { activityCode: 'PROG-VMP-003', activityName: 'Volunteer Capacity Building & Training', project: 'Volunteer Management Project', directorate: 'Directorate of Programmes', sdgs: 'SDG 4, SDG 8, SDG 17', au: 'Aspiration 6' },
  { activityCode: 'HASW-HARP-001', activityName: 'Emergency Relief Food Distribution', project: 'Humanitarian Aid & Disaster Relief Project', directorate: 'Directorate of Humanitarian Aid & Social Welfare', sdgs: 'SDG 1, SDG 2', au: 'Aspiration 1' },
  { activityCode: 'HASW-HARP-002', activityName: 'Non-Food Essential Items Relief Drive', project: 'Humanitarian Aid & Disaster Relief Project', directorate: 'Directorate of Humanitarian Aid & Social Welfare', sdgs: 'SDG 1, SDG 3', au: 'Aspiration 1' },
  { activityCode: 'CPR-MRM-001', activityName: 'Press Release Drafting & Distribution', project: 'Media Relations & Press Management', directorate: 'Directorate of Communications and Public Relations', sdgs: 'SDG 16', au: 'Aspiration 3, Aspiration 6' },
  { activityCode: 'PAR-PREG-001', activityName: 'Primary Policy Research & Field Surveys', project: 'Policy Research & Evidence Generation', directorate: 'Directorate of Policy, Advocacy & Research', sdgs: 'SDG 16, SDG 17', au: 'Aspiration 3, Aspiration 6' },
  { activityCode: 'PAR-PREG-002', activityName: 'Sector Needs & Baseline Assessments', project: 'Policy Research & Evidence Generation', directorate: 'Directorate of Policy, Advocacy & Research', sdgs: 'SDG 10, SDG 16', au: 'Aspiration 1, Aspiration 3' },
];

export async function GET(request) {
  const q = new URL(request.url).searchParams.get('q')?.trim().toLowerCase() || '';
  const results = q ? approvedActivities.filter((a) => `${a.activityCode} ${a.activityName}`.toLowerCase().includes(q)) : approvedActivities;
  return Response.json(results);
}
