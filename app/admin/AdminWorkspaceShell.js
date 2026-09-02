'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  ['Dashboard', '/admin'],
  ['Activity Reports', '/admin/reports'],
  ['Pending Review', '/admin/reports?status=PENDING_REVIEW'],
  ['Approved Reports', '/admin/reports?status=APPROVED'],
  ['Finance Intelligence', '/admin/finance'],
  ['MEAL Intelligence', '/admin/meal'],
  ['Follow-up Actions', '/admin/follow-up-actions'],
];

export default function AdminWorkspaceShell({ children }) {
  const pathname = usePathname();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const readStatus = () => setStatus(new URLSearchParams(window.location.search).get('status'));
    readStatus();
    window.addEventListener('popstate', readStatus);
    return () => window.removeEventListener('popstate', readStatus);
  }, [pathname]);

  if (pathname === '/admin/login' || pathname === '/admin/forgot-password') return children;

  return (
    <div className="admin-workspace-shell">
      <aside className="admin-workspace-sidebar">
        <div className="admin-workspace-brand"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" /></div>
        <div className="admin-workspace-label">WORKSPACE</div>
        <nav aria-label="VSI IMS Workspace">
          {NAV.map(([label, href]) => {
            const active = label === 'Dashboard' ? pathname === '/admin'
              : label === 'Activity Reports' ? pathname === '/admin/reports' && !status
              : label === 'Pending Review' ? pathname === '/admin/reports' && status === 'PENDING_REVIEW'
              : label === 'Approved Reports' ? pathname === '/admin/reports' && status === 'APPROVED'
              : pathname === href;
            return <Link key={label} href={href} className={active ? 'active' : ''}>{label}</Link>;
          })}
        </nav>
      </aside>
      <main className="admin-workspace-content">{children}</main>
      <style jsx global>{`
        .admin-workspace-shell{min-height:100vh;display:flex;background:#f4f7fa}
        .admin-workspace-sidebar{position:sticky;top:0;width:250px;min-width:250px;height:100vh;box-sizing:border-box;background:linear-gradient(180deg,#003566 0%,#094074 58%,#082f52 100%);color:#fff;padding:20px 14px;box-shadow:8px 0 24px rgba(0,53,102,.12);z-index:1000}
        .admin-workspace-brand{height:58px;display:flex;align-items:center;justify-content:center;padding:0 8px 18px;border-bottom:1px solid rgba(255,255,255,.14);box-sizing:border-box}
        .admin-workspace-brand img{display:block;width:auto;height:52px;max-width:205px;object-fit:contain}
        .admin-workspace-label{font-size:10px;font-weight:900;letter-spacing:.16em;color:#fff;padding:20px 10px 8px}
        .admin-workspace-sidebar nav{display:flex;flex-direction:column;gap:5px}
        .admin-workspace-sidebar nav a,.admin-workspace-sidebar nav a:link,.admin-workspace-sidebar nav a:visited{display:flex;align-items:center;min-height:40px;box-sizing:border-box;padding:8px 12px;border-radius:9px;text-decoration:none;color:#fff!important;font-size:12px;font-weight:800;line-height:1.25}
        .admin-workspace-sidebar nav a:hover,.admin-workspace-sidebar nav a:focus-visible{background:rgba(255,255,255,.09);color:#fff!important}
        .admin-workspace-sidebar nav a.active{background:#ffc300;color:#003566!important;box-shadow:0 5px 14px rgba(0,0,0,.12)}
        .admin-workspace-content{min-width:0;flex:1}
        .admin-workspace-content > .admin-reports-app > .admin-sidebar,.admin-workspace-content > .admin-app > .admin-sidebar,.admin-workspace-content > .phase1-app > .admin-sidebar,.admin-workspace-content > .dashboard-shell > .sidebar,.admin-workspace-content .phase1-app > .admin-sidebar{display:none!important}
        @media(min-width:901px){
          .admin-workspace-content{padding:0 28px}
          .admin-workspace-content .phase1-main .phase1-header{position:relative}
          .admin-workspace-content .phase1-main .phase1-header .phase1-action{position:absolute;right:0;bottom:-86px;margin:0;z-index:2}
          .admin-workspace-content .phase1-main .phase1-kpis{padding-right:190px}
        }
        @media(max-width:900px){.admin-workspace-shell{display:block}.admin-workspace-sidebar{position:sticky;top:0;width:auto;min-width:0;height:auto;padding:10px;overflow-x:auto}.admin-workspace-brand,.admin-workspace-label{display:none}.admin-workspace-sidebar nav{flex-direction:row;gap:6px}.admin-workspace-sidebar nav a{white-space:nowrap;min-height:40px;margin:0}.admin-workspace-content{padding:0 14px}}
      `}</style>
    </div>
  );
}
