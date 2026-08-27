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
        @media (max-width: 760px) {
          .brand .vsi-logo { width: 92px; height: 48px; }
          .vsi-document-row { grid-template-columns: 1fr; }
          .vsi-document-head { display: none; }
        }
      `}</style>
      {children}
      <DocumentUX />
    </>
  );
}
