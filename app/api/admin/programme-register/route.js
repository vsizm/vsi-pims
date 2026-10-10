import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { getAdminSession } from '../login/route';

async function authorised() {
  const token = (await cookies()).get('vsi_admin_session')?.value;
  const session = getAdminSession(token);
  if (!session) return { error: 'Unauthorised.', status: 401 };
  if (!['admin', 'programmes'].includes(session.role)) return { error: 'Only Programmes and Super Admin accounts can manage programme records.', status: 403 };
  if (!process.env.DATABASE_URL) return { error: 'Database is not configured.', status: 503 };
  return { session };
}
const clean = (v, max = 4000) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const validDate = v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
const programmeStatuses = ['Draft', 'Active', 'On Hold', 'Completed', 'Archived'];
const projectStatuses = ['Draft', 'Planned', 'Active', 'On Hold', 'Completed', 'Archived'];

export async function GET() {
  const access = await authorised();
  if (access.error) return Response.json({ error: access.error }, { status: access.status });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const [programmes, projects] = await Promise.all([
      sql`SELECT id, code, name, description, directorate, lead_name, objectives, target_groups, start_date::text AS start_date, end_date::text AS end_date, status, created_by, updated_by, created_at, updated_at FROM vsi_programmes WHERE archived_at IS NULL ORDER BY name ASC`,
      sql`SELECT p.id, p.programme_id, p.code, p.name, p.description, p.project_lead, p.start_date::text AS start_date, p.end_date::text AS end_date, p.status, p.objectives, p.indicators, p.target_groups, p.created_by, p.updated_by, p.created_at, p.updated_at, g.code AS programme_code, g.name AS programme_name FROM vsi_projects p JOIN vsi_programmes g ON g.id = p.programme_id WHERE p.archived_at IS NULL AND g.archived_at IS NULL ORDER BY p.name ASC`
    ]);
    return Response.json({ programmes, projects });
  } catch (error) {
    console.error('programme register load failed', error);
    return Response.json({ error: 'Unable to load programme records. Confirm migration 002 has been applied.' }, { status: 500 });
  }
}

export async function POST(request) {
  const access = await authorised();
  if (access.error) return Response.json({ error: access.error }, { status: access.status });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON request.' }, { status: 400 }); }
  const entity = body?.entity;
  if (!['programme', 'project'].includes(entity)) return Response.json({ error: 'Choose a programme or project record.' }, { status: 400 });
  const code = clean(body.code, 40).toUpperCase(), name = clean(body.name, 180);
  const startDate = clean(body.start_date, 10) || null, endDate = clean(body.end_date, 10) || null;
  if (!code || !/^[A-Z0-9][A-Z0-9_-]*$/.test(code)) return Response.json({ error: 'Use a unique code containing letters, numbers, hyphens or underscores.' }, { status: 400 });
  if (!name) return Response.json({ error: 'Name is required.' }, { status: 400 });
  if (!validDate(startDate) || !validDate(endDate) || (startDate && endDate && startDate > endDate)) return Response.json({ error: 'Enter valid dates and ensure the end date is not before the start date.' }, { status: 400 });
  const status = clean(body.status, 30) || 'Draft', actor = access.session.username;
  try {
    const sql = neon(process.env.DATABASE_URL);
    let result;
    if (entity === 'programme') {
      if (!programmeStatuses.includes(status)) return Response.json({ error: 'Invalid programme status.' }, { status: 400 });
      result = await sql`INSERT INTO vsi_programmes (code, name, description, directorate, lead_name, objectives, target_groups, start_date, end_date, status, created_by, updated_by) VALUES (${code}, ${name}, ${clean(body.description)}, ${clean(body.directorate,180)}, ${clean(body.lead_name,180)}, ${clean(body.objectives)}, ${clean(body.target_groups)}, ${startDate}, ${endDate}, ${status}, ${actor}, ${actor}) RETURNING id, code, name, status`;
    } else {
      const programmeId = Number(body.programme_id);
      if (!Number.isSafeInteger(programmeId) || programmeId < 1) return Response.json({ error: 'Select a valid parent programme.' }, { status: 400 });
      if (!projectStatuses.includes(status)) return Response.json({ error: 'Invalid project status.' }, { status: 400 });
      const parent = await sql`SELECT id FROM vsi_programmes WHERE id = ${programmeId} AND archived_at IS NULL`;
      if (!parent.length) return Response.json({ error: 'The selected programme does not exist or is archived.' }, { status: 400 });
      result = await sql`INSERT INTO vsi_projects (programme_id, code, name, description, project_lead, start_date, end_date, status, objectives, indicators, target_groups, created_by, updated_by) VALUES (${programmeId}, ${code}, ${name}, ${clean(body.description)}, ${clean(body.project_lead,180)}, ${startDate}, ${endDate}, ${status}, ${clean(body.objectives)}, ${clean(body.indicators)}, ${clean(body.target_groups)}, ${actor}, ${actor}) RETURNING id, programme_id, code, name, status`;
    }
    return Response.json({ ok: true, entity, record: result[0] }, { status: 201 });
  } catch (error) {
    if (error?.code === '23505') return Response.json({ error: 'That code is already in use. Choose a unique code.' }, { status: 409 });
    console.error('programme register create failed', error);
    return Response.json({ error: 'Unable to save this record. Confirm migration 002 has been applied.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const access = await authorised();
  if (access.error) return Response.json({ error: access.error }, { status: access.status });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON request.' }, { status: 400 }); }
  const entity = body?.entity, id = Number(body?.id);
  if (!['programme','project'].includes(entity) || !Number.isSafeInteger(id) || id < 1) return Response.json({ error: 'A valid record type and ID are required.' }, { status: 400 });
  const code = clean(body.code,40).toUpperCase(), name = clean(body.name,180);
  const startDate = clean(body.start_date,10) || null, endDate = clean(body.end_date,10) || null, status = clean(body.status,30);
  if (!code || !/^[A-Z0-9][A-Z0-9_-]*$/.test(code) || !name) return Response.json({ error: 'A valid code and name are required.' }, { status: 400 });
  if (!validDate(startDate) || !validDate(endDate) || (startDate && endDate && startDate > endDate)) return Response.json({ error: 'Enter valid dates and ensure the end date is not before the start date.' }, { status: 400 });
  const actor = access.session.username;
  try {
    const sql = neon(process.env.DATABASE_URL);
    let result;
    if (entity === 'programme') {
      if (!programmeStatuses.includes(status)) return Response.json({ error: 'Invalid programme status.' }, { status: 400 });
      result = await sql`UPDATE vsi_programmes SET code=${code}, name=${name}, description=${clean(body.description)}, directorate=${clean(body.directorate,180)}, lead_name=${clean(body.lead_name,180)}, objectives=${clean(body.objectives)}, target_groups=${clean(body.target_groups)}, start_date=${startDate}, end_date=${endDate}, status=${status}, updated_by=${actor}, updated_at=NOW() WHERE id=${id} AND archived_at IS NULL RETURNING id`;
    } else {
      const programmeId = Number(body.programme_id);
      if (!Number.isSafeInteger(programmeId) || programmeId < 1) return Response.json({ error: 'Select a valid parent programme.' }, { status: 400 });
      if (!projectStatuses.includes(status)) return Response.json({ error: 'Invalid project status.' }, { status: 400 });
      const parent = await sql`SELECT id FROM vsi_programmes WHERE id=${programmeId} AND archived_at IS NULL`;
      if (!parent.length) return Response.json({ error: 'The selected programme does not exist or is archived.' }, { status: 400 });
      result = await sql`UPDATE vsi_projects SET programme_id=${programmeId}, code=${code}, name=${name}, description=${clean(body.description)}, project_lead=${clean(body.project_lead,180)}, start_date=${startDate}, end_date=${endDate}, status=${status}, objectives=${clean(body.objectives)}, indicators=${clean(body.indicators)}, target_groups=${clean(body.target_groups)}, updated_by=${actor}, updated_at=NOW() WHERE id=${id} AND archived_at IS NULL RETURNING id`;
    }
    if (!result.length) return Response.json({ error: 'Record not found or already archived.' }, { status: 404 });
    return Response.json({ ok: true, entity, id });
  } catch (error) {
    if (error?.code === '23505') return Response.json({ error: 'That code is already in use. Choose a unique code.' }, { status: 409 });
    console.error('programme register update failed', error);
    return Response.json({ error: 'Unable to update this record.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const access = await authorised();
  if (access.error) return Response.json({ error: access.error }, { status: access.status });
  const params = new URL(request.url).searchParams, entity = params.get('entity'), id = Number(params.get('id'));
  if (!['programme','project'].includes(entity) || !Number.isSafeInteger(id) || id < 1) return Response.json({ error: 'A valid record type and ID are required.' }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    if (entity === 'programme') {
      const children = await sql`SELECT id FROM vsi_projects WHERE programme_id=${id} AND archived_at IS NULL LIMIT 1`;
      if (children.length) return Response.json({ error: 'Archive or reassign this programme’s projects before archiving the programme.' }, { status: 409 });
      const result = await sql`UPDATE vsi_programmes SET status='Archived', archived_at=NOW(), updated_by=${access.session.username}, updated_at=NOW() WHERE id=${id} AND archived_at IS NULL RETURNING id`;
      if (!result.length) return Response.json({ error: 'Record not found or already archived.' }, { status: 404 });
    } else {
      const result = await sql`UPDATE vsi_projects SET status='Archived', archived_at=NOW(), updated_by=${access.session.username}, updated_at=NOW() WHERE id=${id} AND archived_at IS NULL RETURNING id`;
      if (!result.length) return Response.json({ error: 'Record not found or already archived.' }, { status: 404 });
    }
    return Response.json({ ok: true, archived: true });
  } catch (error) {
    console.error('programme register archive failed', error);
    return Response.json({ error: 'Unable to archive this record.' }, { status: 500 });
  }
}
