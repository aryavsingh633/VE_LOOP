import { AlertCircle, Inbox } from 'lucide-react';
import styles from './StateViews.module.css';
export function ErrorState({
  title = "We couldn't load this right now.",
  action,
}) {
  return (
    <div className={styles.state}>
      <AlertCircle />
      <h2>{title}</h2>
      <p>The information is unavailable at the moment. Please try again.</p>
      {action && (
        <button className="button buttonSmall" onClick={action}>
          Try again
        </button>
      )}
    </div>
  );
}
export function EmptyState({ title, description }) {
  return (
    <div className={styles.state}>
      <Inbox />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
