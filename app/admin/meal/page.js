import Phase4Dashboard from './Phase4Dashboard';
import MealKpiEnhancer from './MealKpiEnhancer';
import styles from './meal-overrides.module.css';
import layoutFixes from './meal-activity-layout-fixes.module.css';

export default function MealPage() {
  return <div className={`${styles.scope} ${layoutFixes.fixScope}`}><MealKpiEnhancer /><Phase4Dashboard /></div>;
}