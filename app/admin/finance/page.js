import FinanceIntelligence from './FinanceIntelligenceFinal';
import styles from './finance-overrides.module.css';
import cleanup from './branding-cleanup.module.css';

export const dynamic = 'force-dynamic';

export default function FinancePage() {
  return <div className={`${styles.scope} ${cleanup.scope}`}><FinanceIntelligence /></div>;
}
