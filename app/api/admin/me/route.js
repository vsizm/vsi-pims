import { cookies } from 'next/headers';
import { getAdminRole, getAdminSessionUsername } from '../login/route';

export async function GET() {
  const store = await cookies();
  const token = store.get('vsi_admin_session')?.value;
  const username = getAdminSessionUsername(token);
  if (!username) return Response.json({ authenticated: false }, { status: 401 });

  const role = getAdminRole(username);
  const normalizedRole = role === 'admin' || role === 'super_admin' ? 'admin' : role === 'programmes' ? 'programmes' : role === 'finance' ? 'finance' : null;
  if (!normalizedRole) return Response.json({ authenticated: false }, { status: 403 });

  return Response.json({ authenticated: true, username, role: normalizedRole }, { headers: { 'cache-control': 'no-store' } });
}