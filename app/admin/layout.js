export default function AdminLayout({ children }) {
  return (
    <>
      <style>{`
        html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 0 !important; overflow-x: hidden !important; }
        *, *::before, *::after { box-sizing: border-box; }
        .admin-app { width: 100% !important; min-width: 0 !important; max-width: 100vw !important; min-height: 100vh !important; display: flex !important; overflow-x: hidden !important; }
        .admin-sidebar { width: 250px !important; min-width: 250px !important; max-width: 250px !important; flex: 0 0 250px !important; overflow: hidden !important; }
        .side-brand { width: 100% !important; min-width: 0 !important; max-width: 100% !important; display: flex !important; align-items: center !important; gap: 10px !important; overflow: hidden !important; }
        .side-logo-wrap { width: 42px !important; height: 34px !important; min-width: 42px !important; max-width: 42px !important; min-height: 34px !important; max-height: 34px !important; flex: 0 0 42px !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important; }
        .side-logo-wrap img, .side-brand img { display: block !important; width: auto !important; height: auto !important; max-width: 42px !important; max-height: 28px !important; min-width: 0 !important; min-height: 0 !important; object-fit: contain !important; object-position: center !important; flex: 0 0 auto !important; }
        .side-brand > div:last-child { min-width: 0 !important; max-width: calc(100% - 52px) !important; overflow: hidden !important; }
        .admin-main { width: auto !important; min-width: 0 !important; max-width: none !important; flex: 1 1 auto !important; overflow-x: hidden !important; }
        .stat-grid, .dashboard-grid, .metric-grid, .programme-list { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
        .stat-card, .dash-panel, .programme-row { min-width: 0 !important; max-width: 100% !important; }
        .admin-header { min-width: 0 !important; }
        .admin-header > div { min-width: 0 !important; }
        .admin-sidebar nav a { min-width: 0 !important; }
        @media (max-width: 820px) {
          .admin-sidebar { width: 220px !important; min-width: 220px !important; max-width: 220px !important; flex-basis: 220px !important; }
          .admin-main { width: auto !important; }
          .dashboard-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .dash-panel.wide { grid-column: auto !important; }
        }
        @media (max-width: 640px) {
          .admin-app { display: block !important; width: 100% !important; }
          .admin-sidebar { position: relative !important; width: 100% !important; min-width: 0 !important; max-width: none !important; height: auto !important; min-height: 0 !important; }
          .admin-main { width: 100% !important; max-width: 100% !important; }
          .admin-header { display: block !important; }
          .stat-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
      `}</style>
      {children}
    </>
  );
}
