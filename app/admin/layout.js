import './admin.css';
import './phase1.css';
import AdminNavLearningLink from './AdminNavLearningLink';
import WorkspaceHeaderStyle from './WorkspaceHeaderStyle';

export const metadata = {
  title: 'VSI IMS Admin',
  description: 'Visionary Students Initiative Information Management System administration',
};

export default function AdminLayout({ children }) {
  return <><AdminNavLearningLink /><WorkspaceHeaderStyle />{children}</>;
}
