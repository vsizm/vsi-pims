import DocumentUX from './DocumentUX';

export default function ActivityReportLayout({ children }) {
  return (
    <>
      <style>{`
        .brand .vsi-logo {
          display: block;
          width: 118px;
          height: 58px;
          object-fit: contain;
          object-position: left center;
          content: url('/vsi-logo-white.png');
        }
        .vsi-document-panel { margin-top: 16px; }
        .vsi-document-heading { font-weight: 700; margin-bottom: 10px; color: #003566; }
        .vsi-document-empty { padding: 14px 16px; border: 1px dashed #b8c5d3; border-radius: 8px; color: #5f6b76; background: #f8fafc; }
        .vsi-document-table { border: 1px solid #d8e0e8; border-radius: 10px; overflow: hidden; }
        .vsi-document-row { display: grid; grid-template-columns: minmax(180px,1fr) minmax(220px,1fr) auto; gap: 12px; align-items: center; padding: 12px; border-top: 1px solid #e4e9ee; background: #fff; }
        .vsi-document-head { border-top: 0; background: #f3f6f9; font-size: 13px; font-weight: 700; }
        .vsi-document-row input { width: 100%; box-sizing: border-box; }
        .vsi-document-file { font-size: 14px; overflow-wrap: anywhere; }
        .another-report { display: inline-block; margin-top: 14px; padding: 11px 18px; border-radius: 8px; background: #003566; color: #fff; text-decoration: none; font-weight: 700; }
        .vsi-activity-register { margin-bottom: 18px; padding: 16px; border: 1px solid #d8e0e8; border-radius: 10px; background: #f8fafc; }
        .vsi-register-label { font-weight: 900; color: #003566; margin-bottom: 5px; }
        .vsi-register-help { font-size: .86rem; color: #5f6b76; margin-bottom: 10px; }
        .vsi-register-search { width: 100%; box-sizing: border-box; padding: 12px 13px; border: 1px solid #b8c5d3; border-radius: 8px; background: #fff; }
        .vsi-register-results { display: grid; gap: 6px; margin-top: 8px; }
        .vsi-register-result { display: grid; grid-template-columns: 150px 1fr; gap: 4px 10px; text-align: left; padding: 10px 12px; border: 1px solid #d8e0e8; border-radius: 8px; background: #fff; cursor: pointer; }
        .vsi-register-result:hover { border-color: #3c6997; background: #f3f7fb; }
        .vsi-register-result strong { color: #003566; }
        .vsi-register-result span { font-weight: 700; color: #233b4d; }
        .vsi-register-result small { grid-column: 2; color: #657684; }
        .vsi-register-empty { padding: 10px 12px; color: #7a2b2b; background: #fff5f5; border: 1px solid #efcaca; border-radius: 8px; }
        .vsi-register-selected { margin-top: 14px; }
        .vsi-register-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
        .vsi-register-grid label { display: grid; gap: 6px; font-weight: 700; color: #334e60; }
        .vsi-register-grid input, .vsi-register-grid textarea { width: 100%; box-sizing: border-box; padding: 10px 11px; border: 1px solid #d0dbe4; border-radius: 7px; background: #eef3f7; color: #29465b; font-weight: 700; }
        .vsi-register-grid textarea { min-height: 58px; resize: vertical; }
        @media (max-width: 760px) {
          .brand .vsi-logo { width: 92px; height: 48px; }
          .vsi-document-row { grid-template-columns: 1fr; }
          .vsi-document-head { display: none; }
          .vsi-register-grid { grid-template-columns: 1fr; }
          .vsi-register-result { grid-template-columns: 1fr; }
          .vsi-register-result small { grid-column: 1; }
        }
      `}</style>
      {children}
      <DocumentUX />
    </>
  );
}
