import { inflateSync } from 'zlib';

const encoded = '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';

const approvedActivities = JSON.parse(inflateSync(Buffer.from(encoded, 'base64')).toString('utf8'));

function normalizeActivity(a) {
  const sdgs = a.unSdgsAlignment ?? a.sdgsAlignment ?? a.unSdgs ?? a.sdgs ?? '';
  const au = a.auAgenda2063Alignment ?? a.agenda2063Alignment ?? a.auAgenda2063 ?? '';
  return {
    ...a,
    code: a.code ?? a.activityCode ?? '',
    name: a.name ?? a.activityName ?? '',
    project: a.project ?? a.projectName ?? '',
    directorate: a.directorate ?? '',
    programme: a.programme ?? a.programmeName ?? '',
    unSdgsAlignment: sdgs,
    sdgsAlignment: sdgs,
    auAgenda2063Alignment: au,
  };
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const q = (params.get('q') ?? params.get('search') ?? '').trim().toLowerCase();
  const results = q
    ? approvedActivities.filter((a) => `${a.activityCode ?? a.code ?? ''} ${a.activityName ?? a.name ?? ''}`.toLowerCase().includes(q))
    : approvedActivities;
  return Response.json({ activities: results.map(normalizeActivity) });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const code = String(body?.activityCode || '').trim();
    const name = String(body?.activityTitle || '').trim();
    const activity = approvedActivities.find((a) => a.activityCode === code || a.activityName === name);
    if (!activity) return Response.json({ error: 'Please select an approved VSI activity from the Activities Register.' }, { status: 400 });
    return Response.json({ ok: true, activity: normalizeActivity(activity) });
  } catch {
    return Response.json({ error: 'Invalid activity selection.' }, { status: 400 });
  }
}
