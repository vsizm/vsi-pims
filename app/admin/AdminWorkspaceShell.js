'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ROLE_ACCESS = { admin: ['programmes', 'finance'], programmes: ['programmes'], finance: ['programmes', 'finance'] };

const NAV = [
  ['Activity Reports', '/admin/reports'],
  ['MEAL Intelligence', '/admin/meal'],
  ['Finance Intelligence', '/admin/finance'],
  ['Finance & HR', '/admin/finance-hr'],
  ['Directorates', '/admin/directorates'],
  ['Follow-up Actions', '/admin/follow-up-actions'],
];

export default function AdminWorkspaceShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [role, setRole] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const readStatus = () => setStatus(new URLSearchParams(window.location.search).get('status'));
    readStatus();
    setAuthChecked(false);
    fetch('/api/admin/me', { cache: 'no-store', credentials: 'include' })
      .then(async r => {
        const data = await r.json().catch(() => null);
        if (cancelled) return;
        setRole(r.ok ? (data?.role || null) : null);
        setAuthChecked(true);
      })
      .catch(() => {
        if (!cancelled) {
          setRole(null);
          setAuthChecked(true);
        }
      });
    window.addEventListener('popstate', readStatus);
    return () => {
      cancelled = true;
      window.removeEventListener('popstate', readStatus);
    };
  }, [pathname]);

  useEffect(() => {
    if (role === 'finance' && pathname === '/admin') router.replace('/admin/finance-hr');
  }, [role, pathname, router]);

  if (pathname === '/admin/login' || pathname === '/admin/forgot-password') return children;
  if (!authChecked) return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',fontFamily:'Inter,system-ui,sans-serif',color:'#063b73'}}>Checking IMS access…</div>;
  if (!role) return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,fontFamily:'Inter,system-ui,sans-serif',background:'#f4f7fa'}}><div style={{maxWidth:520,padding:32,border:'1px solid #dce5ed',borderRadius:14,background:'#fff',textAlign:'center'}}><div style={{fontSize:12,fontWeight:900,letterSpacing:'.12em',color:'#1677c8'}}>VSI IMS</div><h1 style={{color:'#063b73',margin:'10px 0'}}>Access restricted</h1><p style={{color:'#718091',fontSize:14,lineHeight:1.6}}>Your IMS role does not have access to this workspace.</p></div></div>;

  const financeRoute = pathname === '/admin/finance-hr' || pathname.startsWith('/admin/finance-hr/');
  const allowed = ROLE_ACCESS[role]?.includes(financeRoute ? 'finance' : 'programmes');
  if (!allowed) return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,fontFamily:'Inter,system-ui,sans-serif',background:'#f4f7fa'}}><div style={{maxWidth:520,padding:32,border:'1px solid #dce5ed',borderRadius:14,background:'#fff',textAlign:'center'}}><div style={{fontSize:12,fontWeight:900,letterSpacing:'.12em',color:'#1677c8'}}>VSI IMS</div><h1 style={{color:'#063b73',margin:'10px 0'}}>Access restricted</h1><p style={{color:'#718091',fontSize:14,lineHeight:1.6}}>Your IMS role does not have access to this workspace.</p></div></div>;

  return (
    <div className="admin-workspace-shell">
      <aside className="admin-workspace-sidebar">
        <div className="admin-workspace-brand"><img src="/vsi-logo-white.png" alt="Visionary Students Initiative" /></div>
        <div className="admin-workspace-label">WORKSPACE</div>
        <nav aria-label="VSI IMS Workspace">
          {NAV.filter(([label]) => ROLE_ACCESS[role]?.includes(label === 'Finance & HR' ? 'finance' : 'programmes')).map(([label, href]) => {
            const active = label === 'Activity Reports' ? pathname === '/admin/reports' && !status : pathname === href;
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
