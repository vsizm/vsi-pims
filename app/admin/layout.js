export default function AdminLayout({ children }) {
  return (
    <>
      <style jsx global>{`
        html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 0 !important; overflow-x: hidden !important; }
        *, *::before, *::after { box-sizing: border-box; }
        .admin-app { width: 100% !important; min-width: 0 !important; max-width: 100vw !important; min-height: 100vh !important; display: flex !important; overflow-x: hidden !important; }
        .admin-sidebar { width: 250px !important; min-width: 250px !important; max-width: 250px !important; flex: 0 0 250px !important; overflow: hidden !important; background: linear-gradient(180deg,#003566 0%,#094074 58%,#082f52 100%) !important; color: #fff !important; }
        .side-brand { width: 100% !important; min-width: 0 !important; max-width: 100% !important; display: flex !important; align-items: center !important; gap: 10px !important; overflow: hidden !important; }
        .side-logo-wrap { width: 42px !important; height: 34px !important; min-width: 42px !important; max-width: 42px !important; min-height: 34px !important; max-height: 34px !important; flex: 0 0 42px !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important; }
        .side-logo-wrap img, .side-brand img { display: block !important; width: auto !important; height: auto !important; max-width: 42px !important; max-height: 28px !important; min-width: 0 !important; min-height: 0 !important; object-fit: contain !important; object-position: center !important; flex: 0 0 auto !important; }
        .side-brand > div:last-child { min-width: 0 !important; max-width: calc(100% - 52px) !important; overflow: hidden !important; }
        .admin-main { width: auto !important; min-width: 0 !important; max-width: none !important; flex: 1 1 auto !important; overflow-x: hidden !important; }
        .stat-grid, .dashboard-grid, .metric-grid, .programme-list { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
        .stat-card, .dash-panel, .programme-row { min-width: 0 !important; max-width: 100% !important; }
        .admin-header { min-width: 0 !important; }
        .admin-header > div { min-width: 0 !important; }
        .admin-sidebar nav { display: flex !important; flex-direction: column !important; gap: 3px !important; min-width: 0 !important; }
        .admin-sidebar nav a { min-width: 0 !important; display: flex !important; align-items: center !important; gap: 9px !important; color: rgba(255,255,255,.84) !important; text-decoration: none !important; padding: 10px 11px !important; border-radius: 9px !important; font: 800 12px/1.2 Arial,Helvetica,sans-serif !important; white-space: nowrap !important; overflow: hidden !important; }
        .admin-sidebar nav a:hover { background: rgba(255,255,255,.09) !important; color: #fff !important; }
        .admin-sidebar nav a.active { background: #ffc300 !important; color: #003566 !important; }
        .nav-dot { width: 7px !important; height: 7px !important; min-width: 7px !important; border-radius: 50% !important; background: #3c6997 !important; flex: 0 0 7px !important; }
        .intel-dot { background: #ffd60a !important; }
        .active .nav-dot { background: #003566 !important; }
        .side-label { font: 900 10px/1.2 Arial,Helvetica,sans-serif !important; letter-spacing: .16em !important; color: rgba(255,255,255,.58) !important; padding: 20px 10px 8px !important; }
        .side-label.intelligence { padding-top: 22px !important; }
        .side-note { font: 400 10px/1.55 Arial,Helvetica,sans-serif !important; color: rgba(255,255,255,.66) !important; padding: 16px 10px 0 !important; overflow: hidden !important; }
        .back-report { margin-top: auto !important; display: block !important; text-decoration: none !important; color: #003566 !important; background: #ffd60a !important; border-radius: 9px !important; padding: 10px 11px !important; text-align: center !important; font: 900 11px/1.2 Arial,Helvetica,sans-serif !important; white-space: nowrap !important; overflow: hidden !important; }
        .side-brand strong { display: block !important; font: 900 16px/1.2 Arial,Helvetica,sans-serif !important; letter-spacing: .07em !important; white-space: nowrap !important; color: #fff !important; }
        .side-brand small { display: block !important; font: 900 9px/1.2 Arial,Helvetica,sans-serif !important; letter-spacing: .13em !important; color: #ffd60a !important; margin-top: 3px !important; white-space: nowrap !important; }
        @media (max-width: 820px) {
          .admin-sidebar { width: 220px !important; min-width: 220px !important; max-width: 220px !important; flex-basis: 220px !important; }
          .admin-main { width: auto !important; }
          .dashboard-grid { grid-template-columns: minmax(0,1fr) !important; }
          .dash-panel.wide { grid-column: auto !important; }
        }
        @media (max-width: 640px) {
          .admin-app { display: block !important; width: 100% !important; }
          .admin-sidebar { position: relative !important; width: 100% !important; min-width: 0 !important; max-width: none !important; height: auto !important; min-height: 0 !important; }
          .admin-main { width: 100% !important; max-width: 100% !important; }
          .admin-header { display: block !important; }
          .stat-grid { grid-template-columns: minmax(0,1fr) !important; }
          .metric-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
        }
      `}</style>
      {children}
    </>
  );
}
