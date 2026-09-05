import { useEffect, useState } from 'react';
import styles from './Countdown.module.css';

const getRemaining = (endAt) =>
  Math.max(0, new Date(endAt).getTime() - Date.now());
const units = (remaining) => {
  const seconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
};
export function Countdown({ endAt, compact = false }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endAt));
  useEffect(() => {
    setRemaining(getRemaining(endAt));
    const interval = setInterval(() => setRemaining(getRemaining(endAt)), 1000);
    return () => clearInterval(interval);
  }, [endAt]);
  if (!remaining) return <span className={styles.ended}>Giveaway ended</span>;
  const time = units(remaining);
  if (compact)
    return (
      <span className={styles.compact}>
        {time.days}d : {String(time.hours).padStart(2, '0')}h :{' '}
        {String(time.minutes).padStart(2, '0')}m
      </span>
    );
  return (
    <div
      className={styles.timer}
      aria-label={`${time.days} days ${time.hours} hours ${time.minutes} minutes and ${time.seconds} seconds remaining`}
    >
      {Object.entries(time).map(([label, value]) => (
        <div key={label}>
          <b>{String(value).padStart(2, '0')}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
