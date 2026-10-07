import { cookies } from 'next/headers';
import { getAdminSession } from '../login/route';

export async function GET() {
  const store = await cookies();
  const token = store.get('vsi_admin_session')?.value;
  const session = getAdminSession(token);
  if (!session) return Response.json({ authenticated: false }, { status: 401 });

  const username = session.username;
  const role = session.role;
  const normalizedRole = role === 'admin' || role === 'super_admin' ? 'admin' : role === 'programmes' ? 'programmes' : role === 'finance' ? 'finance' : null;
  if (!normalizedRole) return Response.json({ authenticated: false }, { status: 403 });

  return Response.json({ authenticated: true, username, role: normalizedRole }, { headers: { 'cache-control': 'no-store' } });
}
