import { Award, Clock3, PartyPopper } from 'lucide-react';
import { formatDate } from '../utils/format';
import styles from './WinnerPanels.module.css';

export function WinnersPanel({ data, title = 'Winners' }) {
  if (!data?.announced)
    return (
      <section className={styles.panel}>
        <Clock3 />
        <div>
          <h2>Giveaway is still live</h2>
          <p>
            Winners will be announced after the giveaway ends and selection is
            finalized.
          </p>
          <span>Status: {data?.status || 'LIVE'}</span>
        </div>
      </section>
    );
  return (
    <section className={styles.list}>
      <h2>{title}</h2>
      {data.winners.length ? (
        data.winners.map((winner) => (
          <article key={winner.id}>
            <Award />
            <div>
              <strong>{winner.maskedUserId}</strong>
              <span>{winner.prize}</span>
            </div>
            <time>{formatDate(winner.selectedAt)}</time>
          </article>
        ))
      ) : (
        <p>Winner selection is being finalized.</p>
      )}
    </section>
  );
}
export function WinnerState({ claim, prize, onClaim }) {
  if (!claim || claim.status === 'NOT_SUBMITTED')
    return (
      <section className={styles.youWon}>
        <PartyPopper />
        <div>
          <span>Congratulations!</span>
          <h2>You won {prize.name}</h2>
          <p>
            Submit your claim before the deadline to begin prize fulfillment.
          </p>
          <button className="button" onClick={onClaim}>
            Claim your prize
          </button>
        </div>
      </section>
    );
  return (
    <section className={styles.youWon}>
      <Award />
      <div>
        <span>Claim {claim.status.toLowerCase().replace('_', ' ')}</span>
        <h2>Your prize claim is underway</h2>
        <p>
          We’ll update your VELOOP Rewards profile when fulfillment progresses.
        </p>
      </div>
    </section>
  );
}
