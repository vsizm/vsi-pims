import { cookies } from 'next/headers';
import { getAdminRole, getAdminSessionUsername } from '../login/route';

export async function GET() {
  const store = await cookies();
  const username = getAdminSessionUsername(store.get('vsi_admin_session')?.value);
  if (!username) return Response.json({ authenticated: false }, { status: 401 });
  return Response.json({ authenticated: true, username, role: getAdminRole(username) || 'super_admin' });
}
