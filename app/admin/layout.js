import './admin.css';
import './phase1.css';
import AdminWorkspaceShell from './AdminWorkspaceShell';

export const metadata = {
  title: 'VSI IMS Admin',
  description: 'Visionary Students Initiative Information Management System administration',
};

export default function AdminLayout({ children }) {
  return <AdminWorkspaceShell>{children}</AdminWorkspaceShell>;
}
