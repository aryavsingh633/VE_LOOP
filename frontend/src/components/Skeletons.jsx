import styles from './Skeletons.module.css';
export function PrizeSkeleton() {
  return (
    <div className={styles.card}>
      <i />
      <b />
      <b />
      <b />
    </div>
  );
}
export function StatsSkeleton() {
  return (
    <div className={styles.stats}>
      {Array.from({ length: 4 }).map((_, index) => (
        <i key={index} />
      ))}
    </div>
  );
}
export function WinnerSkeleton() {
  return (
    <div className={styles.winner}>
      <i />
      <b />
      <b />
    </div>
  );
}
export function PreviousWinnerSkeleton() {
  return (
    <div className={styles.previous}>
      <i />
      <b />
      <b />
      <b />
    </div>
  );
}
export function CountdownLoading() {
  return <span className={styles.countdown} aria-label="Loading countdown" />;
}
