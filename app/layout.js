import './globals.css';
import EvidenceUploadBridge from './activity-report/EvidenceUploadBridge';

export const metadata = {
  title: 'VSI Activity Report',
  description: 'Visionary Students Initiative activity reporting form',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><EvidenceUploadBridge />{children}</body></html>;
}
