import { useEffect, useState } from 'react';
import { Trophy, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
      4500,
    );
    return () => clearInterval(id);
  }, [paused, displayWinners.length]);

  if (!displayWinners.length) return null;
  const winner = displayWinners[index];

  return (
    <section className={styles.wrap} aria-label="Winner announcements">
      <div className="container">
        <div
          className={styles.banner}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className={styles.leftLabel}>
            <div className={styles.trophyIcon}>
              <Trophy size={16} />
            </div>
            <span className={styles.tag}>
              {demo ? 'RECENT WINNER (DEMO)' : 'RECENT WINNER'}
            </span>
          </div>

          <div className={styles.winnerContent}>
            <span className={styles.maskedUser}>{winner.maskedUserId}</span>
            <span className={styles.actionText}>won</span>
            <strong className={styles.prizeWon}>{winner.prize}</strong>
          </div>

          <div className={styles.rightActions}>
            <Link to="/winners" className={styles.hallOfFameLink}>
              <span>All Winners</span>
              <ChevronRight size={14} />
            </Link>

            <div className={styles.dots}>
              {displayWinners.slice(0, 6).map((_, i) => (
                <button
                  key={i}
                  aria-label={`Announcement ${i + 1}`}
                  className={`${styles.dot} ${i === index ? styles.activeDot : ''}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
