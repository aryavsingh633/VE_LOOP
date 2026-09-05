import { useCallback, useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { giveawayService } from '../services/giveawayService';
import { GiveawayLoader } from '../components/GiveawayLoader';
import { ErrorState, EmptyState } from '../components/StateViews';
import { formatDate } from '../utils/format';
import styles from './WinnersPage.module.css';

export function WinnersPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const load = useCallback(() => {
    setError(false);
    giveawayService
      .previousWinners()
      .then(setData)
      .catch(() => setError(true));
  }, []);
  useEffect(() => load(), [load]);
  if (error)
    return (
      <ErrorState title="We couldn't load previous winners." action={load} />
    );
  if (!data) return <GiveawayLoader label="Loading winner history…" />;
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <div className="eyebrow">Reward history</div>
          <h1>Previous winners</h1>
          <p>
            Completed giveaway results remain visible as historical records.
            Public identities are always masked.
          </p>
          {data.meta?.isDemoData && (
            <p className="demoNote">
              Development demo data — not a record of live VELOOP activity.
            </p>
          )}
        </div>
      </section>
      <section className="section">
        <div className="container">
          {data.winners.length ? (
            <div className={styles.grid}>
              {data.winners.map((winner) => (
                <article key={winner.id}>
                  <div>
                    <Trophy />
                    <span>{winner.prizeType.replace('_', ' ')}</span>
                  </div>
                  <h2>{winner.prize}</h2>
                  <strong>{winner.maskedUserId}</strong>
                  <p>{winner.giveaway}</p>
                  <time>{formatDate(winner.selectedAt)}</time>
                  <small>{winner.status}</small>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No previous winners"
              description="Previous winners will appear here after a giveaway is completed."
            />
          )}
        </div>
      </section>
    </>
  );
}
