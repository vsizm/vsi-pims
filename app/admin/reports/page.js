import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminSession } from '../../api/admin/login/route';
import ReportsClient from './ReportsClient';
import './activity-report-kpi-colors.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const token = (await cookies()).get('vsi_admin_session')?.value;
  if (!isAdminSession(token)) redirect('/admin/login');
  return <ReportsClient />;
}
