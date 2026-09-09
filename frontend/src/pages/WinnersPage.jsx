import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Trophy,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { giveawayService } from '../services/giveawayService';
import { GiveawayLoader } from '../components/GiveawayLoader';
import { ErrorState, EmptyState } from '../components/StateViews';
import { formatDate } from '../utils/format';
import Iphone from '../assets/images/IPhone_Image.png';
import Watch from '../assets/images/Watch_ Image.png';
import Earpods from '../assets/images/Earpod_Image.png';
import VC20 from '../assets/images/20VC_Image.png';
import VC500 from '../assets/images/500VC_Image.png';
import VC2000 from '../assets/images/2000VC_ Image.png';
import styles from './WinnersPage.module.css';

const prizeImageMap = {
  'iPhone 15 Pro': Iphone,
  'Apple Watch Series 9': Watch,
  'AirPods Pro': Earpods,
  '₹2,000 Amazon Gift Card': VC2000,
  '₹500 Amazon Gift Card': VC500,
  '₹20 Amazon Voucher': VC20,
};

export function WinnersPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(() => {
    setError(false);
    giveawayService
      .previousWinners()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredWinners = useMemo(() => {
    if (!data?.winners) return [];
    if (filter === 'PHYSICAL') {
      return data.winners.filter((w) => w.prizeType === 'PHYSICAL');
    }
    if (filter === 'GIFT_CARD') {
      return data.winners.filter((w) => w.prizeType === 'GIFT_CARD');
    }
    return data.winners;
  }, [data, filter]);

  if (error) {
    return (
      <ErrorState
        title="We couldn't load the winner history."
        action={load}
      />
    );
  }

  if (!data) {
    return <GiveawayLoader label="Loading official winners archive..." />;
  }

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className="eyebrow">
              <Trophy size={13} className={styles.goldIcon} />
              <span>Public Hall of Fame</span>
            </div>
            <h1 className={styles.title}>Official Giveaway Winners</h1>
            <p className={styles.desc}>
              Completed giveaway draws remain permanently accessible for transparency.
              Public user identities are masked to protect member privacy while preserving
              verifiability.
            </p>

            {data.meta?.isDemoData && (
              <p className="demoNote">
                <span>ℹ️</span> Displaying seeded development records for testing.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Winners Archive Section */}
      <section className="section">
        <div className="container">
          {/* Controls Bar */}
          <div className={styles.controlsBar}>
            <div className={styles.statChip}>
              <span>Total Winners Announced:</span>
              <strong>{data.winners.length}</strong>
            </div>

            <div className={styles.filterGroup}>
              <button
                type="button"
                className={`${styles.filterBtn} ${filter === 'ALL' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('ALL')}
              >
                All Winners ({data.winners.length})
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${filter === 'PHYSICAL' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('PHYSICAL')}
              >
                Hardware Tech
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${filter === 'GIFT_CARD' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('GIFT_CARD')}
              >
                Vouchers & Gift Cards
              </button>
            </div>
          </div>

          {filteredWinners.length ? (
            <div className={styles.grid}>
              {filteredWinners.map((winner) => {
                const prizeImg = prizeImageMap[winner.prize];
                return (
                  <article key={winner.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.typePill}>
                        {winner.prizeType === 'GIFT_CARD'
                          ? 'Digital Voucher'
                          : 'Hardware Reward'}
                      </div>
                      <span className={styles.statusPill}>{winner.status}</span>
                    </div>

                    <div className={styles.cardVisual}>
                      {prizeImg ? (
                        <img
                          src={prizeImg}
                          alt={winner.prize}
                          className={styles.prizePhoto}
                        />
                      ) : (
                        <Trophy size={48} className={styles.genericTrophy} />
                      )}
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.prizeName}>{winner.prize}</h3>
                      <p className={styles.giveawayRef}>{winner.giveaway}</p>

                      <div className={styles.winnerMeta}>
                        <div className={styles.userBadge}>
                          <CheckCircle2 size={15} className={styles.checkIcon} />
                          <span className={styles.maskedId}>{winner.maskedUserId}</span>
                        </div>
                        <time className={styles.timeTag}>
                          <Calendar size={13} />
                          <span>{formatDate(winner.selectedAt)}</span>
                        </time>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No winners in this category"
              description="Check back once active giveaways conclude."
            />
          )}

          {/* Bottom Trust Banner */}
          <div className={styles.bottomBanner}>
            <ShieldCheck size={28} className={styles.shieldIcon} />
            <div>
              <h4>Verifiable Random Selection</h4>
              <p>
                Winner draws are executed by automated background workers using cryptographic seeds.
                No staff intervention or preferential bias.
              </p>
            </div>
            <Link to="/giveaways" className="button buttonSmall buttonSecondary">
              <span>View Active Giveaways</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
