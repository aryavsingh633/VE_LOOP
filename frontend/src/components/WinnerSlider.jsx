import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import styles from './WinnerSlider.module.css';

const dummyWinners = [
  { id: 1, maskedUserId: 'User*****234', prize: 'iPhone 15 Pro' },
  { id: 2, maskedUserId: 'User*****567', prize: 'Apple Watch Series 9' },
  { id: 3, maskedUserId: 'User*****890', prize: 'AirPods Pro' },
  { id: 4, maskedUserId: 'User*****123', prize: '₹2,000 Amazon Gift Card' },
  { id: 5, maskedUserId: 'User*****456', prize: '₹500 Amazon Gift Card' },
  { id: 6, maskedUserId: 'User*****789', prize: '₹20 Amazon Voucher' },
];

export function WinnerSlider({ winners = [], demo = false }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const displayWinners = winners.length > 0 ? winners : dummyWinners;
  useEffect(() => {
    if (paused || displayWinners.length < 2) return undefined;
    const id = setInterval(
      () => setIndex((current) => (current + 1) % displayWinners.length),
      4300,
    );
    return () => clearInterval(id);
  }, [paused, displayWinners.length]);
  if (!displayWinners.length) return null;
  const winner = displayWinners[index];
  return (
    <section className={styles.wrap} aria-label="Winner announcements">
      <div className="container">
        <div
          className={styles.slider}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Sparkles size={20} />
          <div>
            <span>
              {demo ? 'Development demo — previous winner' : 'Previous winner'}
            </span>
            <strong key={winner.id}>
              {winner.maskedUserId} won {winner.prize}
            </strong>
          </div>
          <div className={styles.dots}>
            {displayWinners.slice(0, 6).map((_, i) => (
              <button
                aria-label={`Show announcement ${i + 1}`}
                className={i === index ? styles.active : ''}
                onClick={() => setIndex(i)}
                key={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
