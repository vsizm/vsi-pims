import Phase4Dashboard from './Phase4Dashboard';
import MealKpiEnhancer from './MealKpiEnhancer';
import MealLayoutCleanup from './MealLayoutCleanup';
import styles from './meal-overrides.module.css';
import './meal-activity-layout-fixes.module.css';
import './meal-hide-activity.css';

export default function MealPage() {
  return <div className={styles.scope}><MealLayoutCleanup /><MealKpiEnhancer /><Phase4Dashboard /></div>;
}
