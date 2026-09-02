import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminSession } from '../../api/admin/login/route';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const token = (await cookies()).get('vsi_admin_session')?.value;
  if (!isAdminSession(token)) redirect('/admin/login');
  return <>
    <style dangerouslySetInnerHTML={{__html:`
      .admin-reports-app .summary-card.total{background:linear-gradient(135deg,#0a9fd4,#1477b4)!important;border-color:transparent!important}
      .admin-reports-app .summary-card.pending{background:linear-gradient(135deg,#245e96,#183f6f)!important;border-color:transparent!important}
      .admin-reports-app .summary-card.approved{background:linear-gradient(135deg,#c99b16,#80610a)!important;border-color:transparent!important}
      .admin-reports-app .summary-card.returned{background:linear-gradient(135deg,#0a9fd4,#1477b4)!important;border-color:transparent!important}
      .admin-reports-app .summary-card.rejected{background:linear-gradient(135deg,#245e96,#183f6f)!important;border-color:transparent!important}
      .admin-reports-app .summary-card .kicker{color:rgba(255,255,255,.8)!important}
      .admin-reports-app .summary-card strong{color:#fff!important}
      .admin-reports-app .summary-card span{color:rgba(255,255,255,.78)!important}
    `}} />
    <ReportsClient />
  </>;
}
