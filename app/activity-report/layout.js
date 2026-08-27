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
        @media (max-width: 760px) {
          .brand .vsi-logo { width: 92px; height: 48px; }
        }
      `}</style>
      {children}
    </>
  );
}
