import { Trophy, Clock, PartyPopper, CheckCircle2, Award } from 'lucide-react';
import { formatDate } from '../utils/format';
import styles from './WinnerPanels.module.css';

export function WinnersPanel({ data, title = 'Official Winners' }) {
  if (!data?.announced) {
    return (
      <section className={styles.livePanel}>
        <div className={styles.clockIconWrap}>
          <Clock size={20} />
        </div>
        <div className={styles.liveContent}>
          <h3>Giveaway Still in Progress</h3>
          <p>
            Winners are selected and announced only after the countdown expires and
            participant records lock.
          </p>
          <span className={styles.statusChip}>Status: {data?.status || 'ACTIVE'}</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.listSection}>
      <div className={styles.listHeader}>
        <Trophy size={18} className={styles.trophyIcon} />
        <h3>{title}</h3>
      </div>
      {data.winners.length ? (
        <div className={styles.winnersList}>
          {data.winners.map((winner) => (
            <article key={winner.id} className={styles.winnerItem}>
              <div className={styles.awardIcon}>
                <Award size={16} />
              </div>
              <div className={styles.winnerInfo}>
                <strong className={styles.winnerUser}>{winner.maskedUserId}</strong>
                <span className={styles.winnerPrize}>{winner.prize}</span>
              </div>
              <time className={styles.winnerTime}>{formatDate(winner.selectedAt)}</time>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.emptyNote}>Winner selection is being finalized.</p>
      )}
    </section>
  );
}

export function WinnerState({ claim, prize, onClaim }) {
  if (!claim || claim.status === 'NOT_SUBMITTED') {
    return (
      <section className={styles.youWonBanner}>
        <div className={styles.partyIconWrap}>
          <PartyPopper size={32} />
        </div>
        <div className={styles.youWonContent}>
          <span className={styles.congratsBadge}>🎉 CONGRATULATIONS! YOU WON!</span>
          <h2>Claim Your {prize.name}</h2>
          <p>
            You were selected as an official winner for this giveaway. Please submit your
            fulfillment details before the deadline to claim your prize.
          </p>
          <button type="button" className="button buttonGold" onClick={onClaim}>
            <span>Submit Prize Claim Now</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.claimedBanner}>
      <div className={styles.checkIconWrap}>
        <CheckCircle2 size={30} />
      </div>
      <div className={styles.claimedContent}>
        <span className={styles.claimStatusBadge}>
          CLAIM STATUS: {claim.status.replace('_', ' ')}
        </span>
        <h2>Your Prize Claim is Underway!</h2>
        <p>
          We have securely received your delivery information. Our operations team is
          processing fulfillment for your {prize.name}.
        </p>
      </div>
    </section>
  );
}
