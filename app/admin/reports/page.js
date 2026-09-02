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

      /* MEAL-style Activity Reports header */
      .admin-reports-app .admin-header{
        background:linear-gradient(135deg,#fff 0%,#f8fbff 65%,#eef5fc 100%)!important;
        border:1px solid #dbe5ef!important;
        border-radius:22px!important;
        color:#003566!important;
        box-shadow:0 10px 28px rgba(9,64,116,.08)!important;
      }
      .admin-reports-app .admin-header::before{content:none!important;display:none!important}
      .admin-reports-app .admin-header .admin-kicker{color:#003566!important}
      .admin-reports-app .admin-header h1{color:#003566!important}
      .admin-reports-app .admin-header p{color:#61758a!important}
      .admin-reports-app .admin-header .signout{color:#003566!important;background:#fff!important}

      /* MEAL-style section headers for the summary and register */
      .admin-reports-app .summary-block .section-title,
      .admin-reports-app .register-section .section-head{
        position:relative;
        min-height:78px;
        padding:20px 24px 20px 80px;
        background:#002D62;
        border:0;
        border-radius:16px 16px 0 0;
        box-sizing:border-box;
      }
      .admin-reports-app .summary-block .section-title::before,
      .admin-reports-app .register-section .section-head::before{
        position:absolute;
        left:24px;
        top:50%;
        transform:translateY(-50%);
        width:40px;
        height:40px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:8px;
        background:#FFC107;
        color:#002D62;
        font-size:14px;
        font-weight:800;
      }
      .admin-reports-app .summary-block .section-title::before,
      .admin-reports-app .register-section .section-head::before{content:none!important;display:none!important}
      .admin-reports-app .summary-block .section-title,
      .admin-reports-app .register-section .section-head{padding-left:24px!important}
      .admin-reports-app .summary-block .section-title h2,
      .admin-reports-app .register-section .section-head h2{margin:0;color:#fff!important;font-size:20px;line-height:1.2;font-weight:700;letter-spacing:.01em}
      .admin-reports-app .summary-block .section-title p,
      .admin-reports-app .register-section .section-head p{margin:4px 0 0;color:#CBD5E1!important;font-size:12px;line-height:1.45;font-weight:400}
      .admin-reports-app .summary-block{background:#fff;border:1px solid #dfe5ea;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px rgba(0,53,102,.045);margin-bottom:16px}
      .admin-reports-app .summary-block .section-title{margin:0}
      .admin-reports-app .summary-grid{padding:14px;background:#fff}
      .admin-reports-app .register-section .section-head{border-bottom:0}

      @media (max-width:700px){
        .admin-reports-app .admin-header{padding:16px 18px;gap:12px}
        .admin-reports-app .summary-block .section-title,
        .admin-reports-app .register-section .section-head{padding:16px 18px}
      }
    `}} />
    <ReportsClient />
  </>;
}
