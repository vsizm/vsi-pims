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

      /* MEAL section-header treatment */
      .admin-reports-app .admin-header{
        position:relative;
        display:flex;
        align-items:center;
        gap:16px;
        min-height:78px;
        margin-bottom:18px;
        padding:20px 24px;
        background:#002D62;
        border:0;
        border-radius:16px;
        color:#fff;
        overflow:hidden;
        box-sizing:border-box;
      }
      .admin-reports-app .admin-header::before{
        content:'01';
        width:40px;
        height:40px;
        flex:0 0 40px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:8px;
        background:#FFC107;
        color:#002D62;
        font-size:14px;
        font-weight:800;
        line-height:1;
      }
      .admin-reports-app .admin-header > div:first-child{min-width:0;display:flex;flex-direction:column;gap:4px}
      .admin-reports-app .admin-header .admin-kicker{margin:0;color:#fff!important;font-size:11px;line-height:1.2;font-weight:800;letter-spacing:.1em}
      .admin-reports-app .admin-header h1{margin:0;color:#fff!important;font-size:20px;line-height:1.2;font-weight:700;letter-spacing:.01em}
      .admin-reports-app .admin-header p{margin:0;color:#CBD5E1!important;max-width:760px;font-size:12px;line-height:1.45;font-weight:400}
      .admin-reports-app .signout{margin-left:auto;flex:0 0 auto;border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.08);color:#fff;border-radius:9px;padding:9px 13px;font-weight:900;cursor:pointer;white-space:nowrap}
      .admin-reports-app .signout:hover{background:rgba(255,255,255,.14)}

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
      .admin-reports-app .summary-block .section-title::before{content:'02'}
      .admin-reports-app .register-section .section-head::before{content:'03'}
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
        .admin-reports-app .admin-header::before{width:36px;height:36px;flex-basis:36px}
        .admin-reports-app .summary-block .section-title,
        .admin-reports-app .register-section .section-head{padding:16px 18px 16px 68px}
        .admin-reports-app .summary-block .section-title::before,
        .admin-reports-app .register-section .section-head::before{left:18px;width:36px;height:36px}
      }
    `}} />
    <ReportsClient />
  </>;
}
