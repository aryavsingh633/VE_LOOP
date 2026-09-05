import styles from './GiveawayLoader.module.css';
export function GiveawayLoader({ label = 'Unlocking rewards…' }) {
  return (
    <div className={styles.loader} role="status">
      <div className={styles.token}>
        <i />
        <i />
        <i />
      </div>
      <strong>{label}</strong>
      <span>Preparing a transparent reward experience</span>
    </div>
  );
}
