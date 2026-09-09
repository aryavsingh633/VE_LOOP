import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import styles from './StateViews.module.css';

export function ErrorState({
  title = "We couldn't load this right now.",
  action,
}) {
  return (
    <div className={styles.stateCard}>
      <div className={styles.errorIconWrap}>
        <AlertCircle size={32} />
      </div>
      <h2>{title}</h2>
      <p>The information is temporarily unavailable. Please retry or check your network connection.</p>
      {action && (
        <button type="button" className="button buttonSmall" onClick={action}>
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className={styles.stateCard}>
      <div className={styles.emptyIconWrap}>
        <Inbox size={32} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
