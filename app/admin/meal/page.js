import Phase4Dashboard from './Phase4Dashboard';
import MealKpiEnhancer from './MealKpiEnhancer';
import styles from './meal-overrides.module.css';

export default function MealPage() {
  return <div className={styles.scope}><MealKpiEnhancer /><Phase4Dashboard /></div>;
}
