import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
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

  if (!remaining) {
    return <span className={styles.ended}>Giveaway Ended</span>;
  }

  const time = units(remaining);

  if (compact) {
    return (
      <span className={styles.compact} title="Time remaining to join">
        <Timer size={13} className={styles.timerIcon} />
        <span>
          {time.days}d {String(time.hours).padStart(2, '0')}h {String(time.minutes).padStart(2, '0')}m
        </span>
      </span>
    );
  }

  return (
    <div
      className={styles.timer}
      aria-label={`${time.days} days ${time.hours} hours ${time.minutes} minutes and ${time.seconds} seconds remaining`}
    >
      {Object.entries(time).map(([label, value]) => (
        <div key={label} className={styles.block}>
          <span className={styles.num}>{String(value).padStart(2, '0')}</span>
          <span className={styles.label}>{label.slice(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}
