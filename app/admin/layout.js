import './admin.css';
import './phase1.css';
import AdminNavLearningLink from './AdminNavLearningLink';

export default function AdminLayout({ children }) {
  return <><AdminNavLearningLink />{children}</>;
}
