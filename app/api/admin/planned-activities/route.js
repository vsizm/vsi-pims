import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { getAdminSession } from '../login/route';

async function authorised() {
  const token = (await cookies()).get('vsi_admin_session')?.value;
  const session = getAdminSession(token);
  if (!session) return { error: 'Unauthorised.', status: 401 };
  if (!['admin', 'programmes'].includes(session.role)) return { error: 'Only Programmes and Super Admin accounts can manage planned activities.', status: 403 };
  if (!process.env.DATABASE_URL) return { error: 'Database is not configured.', status: 503 };
  return { session };
}
const clean = (v, max = 4000) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const validDate = v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
const statuses = ['Draft', 'Planned', 'Active', 'Completed', 'Cancelled'];
const validCode = code => /^[A-Z0-9][A-Z0-9_-]*$/.test(code);

export async function GET() {
  const access = await authorised();
  if (access.error) return Response.json({ error: access.error }, { status: access.status });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const [activities, projects] = await Promise.all([
      sql`SELECT a.id, a.project_id, a.code, a.title, a.description, a.lead_name, a.location, a.target_groups, a.expected_outputs, a.indicators, a.planned_start_date::text AS planned_start_date, a.planned_end_date::text AS planned_end_date, a.budget_estimate::text AS budget_estimate, a.status, a.created_by, a.updated_by, a.created_at, a.updated_at, p.code AS project_code, p.name AS project_name, g.code AS programme_code, g.name AS programme_name FROM vsi_planned_activities a JOIN vsi_projects p ON p.id=a.project_id JOIN vsi_programmes g ON g.id=p.programme_id WHERE a.archived_at IS NULL AND p.archived_at IS NULL AND g.archived_at IS NULL ORDER BY a.planned_start_date NULLS LAST, a.title`,
      sql`SELECT p.id, p.code, p.name, g.name AS programme_name, g.code AS programme_code FROM vsi_projects p JOIN vsi_programmes g ON g.id=p.programme_id WHERE p.archived_at IS NULL AND g.archived_at IS NULL ORDER BY g.name, p.name`
    ]);
    return Response.json({ activities, projects });
  } catch (error) {
    console.error('planned activity load failed', error);
    return Response.json({ error: 'Unable to load planned activities. Confirm migration 003 has been applied.' }, { status: 500 });
  }
}

export async function POST(request) {
  const access = await authorised();
  if (access.error) return Response.json({ error: access.error }, { status: access.status });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON request.' }, { status: 400 }); }
  const code = clean(body?.code, 40).toUpperCase(), title = clean(body?.title, 180);
  const projectId = Number(body?.project_id), start = clean(body?.planned_start_date, 10) || null, end = clean(body?.planned_end_date, 10) || null;
  const budget = body?.budget_estimate === '' || body?.budget_estimate == null ? 0 : Number(body.budget_estimate);
  const status = clean(body?.status, 30) || 'Draft';
  if (!validCode(code) || !title) return Response.json({ error: 'A valid unique activity code and title are required.' }, { status: 400 });
  if (!Number.isSafeInteger(projectId) || projectId < 1) return Response.json({ error: 'Select a valid parent project.' }, { status: 400 });
  if (!validDate(start) || !validDate(end) || (start && end && start > end)) return Response.json({ error: 'Enter valid dates and ensure the end date is not before the start date.' }, { status: 400 });
  if (!Number.isFinite(budget) || budget < 0) return Response.json({ error: 'The budget estimate must be a non-negative amount.' }, { status: 400 });
  if (!statuses.includes(status)) return Response.json({ error: 'Invalid activity status.' }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const parent = await sql`SELECT id FROM vsi_projects WHERE id=${projectId} AND archived_at IS NULL`;
    if (!parent.length) return Response.json({ error: 'The selected project does not exist or is archived.' }, { status: 400 });
    const rows = await sql`INSERT INTO vsi_planned_activities (project_id, code, title, description, lead_name, location, target_groups, expected_outputs, indicators, planned_start_date, planned_end_date, budget_estimate, status, created_by, updated_by) VALUES (${projectId}, ${code}, ${title}, ${clean(body.description)}, ${clean(body.lead_name,180)}, ${clean(body.location,180)}, ${clean(body.target_groups)}, ${clean(body.expected_outputs)}, ${clean(body.indicators)}, ${start}, ${end}, ${budget}, ${status}, ${access.session.username}, ${access.session.username}) RETURNING id, code, title, status`;
    return Response.json({ ok: true, activity: rows[0] }, { status: 201 });
  } catch (error) {
    if (error?.code === '23505') return Response.json({ error: 'That activity code is already in use. Choose a unique code.' }, { status: 409 });
    console.error('planned activity create failed', error);
    return Response.json({ error: 'Unable to create the activity. Confirm migration 003 has been applied.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const access = await authorised();
  if (access.error) return Response.json({ error: access.error }, { status: access.status });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON request.' }, { status: 400 }); }
  const id = Number(body?.id), projectId = Number(body?.project_id);
  const code = clean(body?.code, 40).toUpperCase(), title = clean(body?.title, 180);
  const start = clean(body?.planned_start_date, 10) || null, end = clean(body?.planned_end_date, 10) || null;
  const budget = body?.budget_estimate === '' || body?.budget_estimate == null ? 0 : Number(body.budget_estimate);
  const status = clean(body?.status, 30);
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(projectId) || projectId < 1 || !validCode(code) || !title) return Response.json({ error: 'A valid activity ID, parent project, code and title are required.' }, { status: 400 });
  if (!validDate(start) || !validDate(end) || (start && end && start > end)) return Response.json({ error: 'Enter valid dates and ensure the end date is not before the start date.' }, { status: 400 });
  if (!Number.isFinite(budget) || budget < 0) return Response.json({ error: 'The budget estimate must be a non-negative amount.' }, { status: 400 });
  if (!statuses.includes(status)) return Response.json({ error: 'Invalid activity status.' }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const parent = await sql`SELECT id FROM vsi_projects WHERE id=${projectId} AND archived_at IS NULL`;
    if (!parent.length) return Response.json({ error: 'The selected project does not exist or is archived.' }, { status: 400 });
    const rows = await sql`UPDATE vsi_planned_activities SET project_id=${projectId}, code=${code}, title=${title}, description=${clean(body.description)}, lead_name=${clean(body.lead_name,180)}, location=${clean(body.location,180)}, target_groups=${clean(body.target_groups)}, expected_outputs=${clean(body.expected_outputs)}, indicators=${clean(body.indicators)}, planned_start_date=${start}, planned_end_date=${end}, budget_estimate=${budget}, status=${status}, updated_by=${access.session.username}, updated_at=NOW() WHERE id=${id} AND archived_at IS NULL RETURNING id`;
    if (!rows.length) return Response.json({ error: 'Activity not found or already archived.' }, { status: 404 });
    return Response.json({ ok: true, id });
  } catch (error) {
    if (error?.code === '23505') return Response.json({ error: 'That activity code is already in use. Choose a unique code.' }, { status: 409 });
    console.error('planned activity update failed', error);
    return Response.json({ error: 'Unable to update this activity.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const access = await authorised();
  if (access.error) return Response.json({ error: access.error }, { status: access.status });
  const params = new URL(request.url).searchParams, id = Number(params.get('id'));
  if (!Number.isSafeInteger(id) || id < 1) return Response.json({ error: 'A valid activity ID is required.' }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`UPDATE vsi_planned_activities SET status='Archived', archived_at=NOW(), updated_by=${access.session.username}, updated_at=NOW() WHERE id=${id} AND archived_at IS NULL RETURNING id`;
    if (!rows.length) return Response.json({ error: 'Activity not found or already archived.' }, { status: 404 });
    return Response.json({ ok: true, archived: true });
  } catch (error) {
    console.error('planned activity archive failed', error);
    return Response.json({ error: 'Unable to archive this activity.' }, { status: 500 });
  }
}
