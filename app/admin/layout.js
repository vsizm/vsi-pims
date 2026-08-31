import './admin.css';
import './phase1.css';
import AdminNavLearningLink from './AdminNavLearningLink';
import WorkspaceHeaderStyle from './WorkspaceHeaderStyle';

export default function AdminLayout({ children }) {
  return <><AdminNavLearningLink /><WorkspaceHeaderStyle />{children}</>;
}
