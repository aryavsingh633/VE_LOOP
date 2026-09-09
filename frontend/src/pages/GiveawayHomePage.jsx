import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ShieldCheck,
  Gift,
  UsersRound,
  Trophy,
  Timer,
  Sparkles,
  Lock,
  Flame,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { giveawayService } from '../services/giveawayService';
import { GiveawayLoader } from '../components/GiveawayLoader';
import { PrizeCard } from '../components/PrizeCard';
import { PrizeSlider } from '../components/PrizeSlider';
import { Countdown } from '../components/Countdown';
import { WinnerSlider } from '../components/WinnerSlider';
import {
  HowItWorks,
  TrustSection,
  FAQ,
  Rules,
} from '../components/InfoSections';
import { EmptyState, ErrorState } from '../components/StateViews';
import { PrizeSkeleton, StatsSkeleton } from '../components/Skeletons';
import { formatEntry, formatNumber } from '../utils/format';
import Iphone from '../assets/images/IPhone_Image.png';
import Watch from '../assets/images/Watch_ Image.png';
import Earpods from '../assets/images/Earpod_Image.png';
import VC20 from '../assets/images/20VC_Image.png';
import VC500 from '../assets/images/500VC_Image.png';
import VC2000 from '../assets/images/2000VC_ Image.png';
import ticketArt from '../assets/images/ticket-hand.png';
import styles from './GiveawayHomePage.module.css';

// Map prize names to images
const prizeImageMap = {
  'iPhone 15 Pro': Iphone,
  'Apple Watch Series 9': Watch,
  'AirPods Pro': Earpods,
  '₹2,000 Amazon Gift Card': VC2000,
  '₹500 Amazon Gift Card': VC500,
  '₹20 Amazon Voucher': VC20,
};

export function GiveawayHomePage() {
  const [data, setData] = useState(null);
  const [winnerData, setWinnerData] = useState(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, PHYSICAL, GIFT_CARD
  const location = useLocation();

  const load = useCallback(async () => {
    setError(false);
    try {
      const [current, winners] = await Promise.all([
        giveawayService.current(),
        giveawayService.previousWinners(),
      ]);
      setData(current);
      setWinnerData(winners);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Handle smooth scroll to anchor on hash navigation
  useEffect(() => {
    if (data && location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [data, location.hash]);

  const primary = useMemo(
    () =>
      data?.items.find((item) => item.status === 'ACTIVE') || data?.items[0],
    [data],
  );

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    const available = data.items.filter((item) =>
      ['ACTIVE', 'UPCOMING'].includes(item.status),
    );
    if (filter === 'PHYSICAL') {
      return available.filter((item) => item.prize.prizeType === 'PHYSICAL');
    }
    if (filter === 'GIFT_CARD') {
      return available.filter((item) => item.prize.prizeType === 'GIFT_CARD');
    }
    return available;
  }, [data, filter]);

  if (error) {
    return (
      <ErrorState
        title="Unable to load giveaway information"
        action={load}
      />
    );
  }

  if (!data) {
    return (
      <>
        <GiveawayLoader label="Loading VELOOP Rewards..." />
        <section className="container" style={{ padding: '40px 0' }}>
          <StatsSkeleton />
          <div className={styles.skeletonCards}>
            <PrizeSkeleton />
            <PrizeSkeleton />
            <PrizeSkeleton />
          </div>
        </section>
      </>
    );
  }

  if (!data.items.length) {
    return (
      <EmptyState
        title="No active giveaways currently"
        description="The next series of exclusive VELOOP rewards is being scheduled. Check back shortly."
      />
    );
  }

  const primaryImage = primary ? prizeImageMap[primary.prize.name] : null;

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrowBadge}>
              <Sparkles size={14} className={styles.sparkleIcon} />
              <span>Verified VELOOP Rewards</span>
            </div>

            <h1 className={styles.heroTitle}>
              Complete Activities.
              <br />
              <span className={styles.gradientText}>Earn Entries.</span>
              <br />
              Win Real Rewards.
            </h1>

            <p className={styles.heroDesc}>
              Participate in premium giveaways for flagship tech and digital vouchers.
              Protected by single-entry fairness, transparent countdowns, and cryptographically
              verified draws.
            </p>

            <div className={styles.heroActions}>
              <a href="#giveaways" className="button buttonLarge">
                <span>Explore Giveaways</span>
                <ArrowDown size={16} />
              </a>
              <Link to="/winners" className="button buttonLarge buttonSecondary">
                <span>Winner Announcements</span>
              </Link>
            </div>

            <div className={styles.heroTrustBar}>
              <div className={styles.trustItem}>
                <ShieldCheck size={16} className={styles.trustIcon} />
                <span>Single-Entry Fairness</span>
              </div>
              <div className={styles.trustItem}>
                <Lock size={16} className={styles.trustIcon} />
                <span>Masked Privacy</span>
              </div>
              <div className={styles.trustItem}>
                <CheckCircle size={16} className={styles.trustIcon} />
                <span>Guaranteed Fulfillment</span>
              </div>
            </div>
          </div>

          {/* Featured Reward Showcase Card in Hero */}
          <div className={styles.heroShowcase}>
            {primary && (
              <div className={styles.featuredCard}>
                <div className={styles.featuredGlow} />
                <div className={styles.featuredTop}>
                  <div className={styles.featuredLivePill}>
                    <span className={styles.livePulse} />
                    <span>FEATURED EVENT</span>
                  </div>
                  <div className={styles.featuredCountdown}>
                    <Countdown endAt={primary.endAt} compact />
                  </div>
                </div>

                <div className={styles.featuredArtWrap}>
                  <PrizeSlider
                    prizes={data.items.map((item) => ({
                      name: item.prize.name,
                      position: item.prize.position,
                      slug: item.slug,
                    }))}
                  />
                </div>

                <div className={styles.featuredMetaBar}>
                  <div>
                    <span className={styles.metaLabel}>Required Entry</span>
                    <strong className={styles.metaValue}>
                      {formatEntry(primary.prize.entryAmount, primary.prize.entryCurrency)}
                    </strong>
                  </div>
                  <div className={styles.metaDivider} />
                  <div>
                    <span className={styles.metaLabel}>Winners</span>
                    <strong className={styles.metaValue}>
                      {primary.winnerCount} {primary.winnerCount === 1 ? 'Winner' : 'Winners'}
                    </strong>
                  </div>
                  <Link
                    to={`/giveaway/${primary.slug}`}
                    className={`button buttonSmall ${styles.featuredCta}`}
                  >
                    <span>Enter</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Winner Ticker Strip */}
      {winnerData && (
        <WinnerSlider
          winners={winnerData.winners || []}
          demo={winnerData.meta?.isDemoData}
        />
      )}

      {/* Fintech Stats Section */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            <article className={styles.statCard}>
              <div className={styles.statIconWrap}>
                <Gift size={22} />
              </div>
              <div className={styles.statInfo}>
                <strong className={styles.statNum}>{data.stats.activeGiveaways}</strong>
                <span className={styles.statLabel}>Active Giveaways</span>
              </div>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statIconWrap}>
                <UsersRound size={22} />
              </div>
              <div className={styles.statInfo}>
                <strong className={styles.statNum}>
                  {formatNumber(data.stats.participants)}
                  {data.stats.participants > 999 ? '+' : ''}
                </strong>
                <span className={styles.statLabel}>Total Participants</span>
              </div>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statIconWrap}>
                <Trophy size={22} />
              </div>
              <div className={styles.statInfo}>
                <strong className={styles.statNum}>
                  {formatNumber(data.stats.rewardsWon)}
                </strong>
                <span className={styles.statLabel}>Rewards Distributed</span>
              </div>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statIconWrap}>
                <Timer size={22} />
              </div>
              <div className={styles.statInfo}>
                <div className={styles.timerVal}>
                  {primary ? <Countdown endAt={primary.endAt} compact /> : '—'}
                </div>
                <span className={styles.statLabel}>Primary Event Deadline</span>
              </div>
            </article>
          </div>

          {data.meta?.isDemoData && (
            <p className="demoNote">
              <span>ℹ️</span> Development environment running with seeded records.
            </p>
          )}
        </div>
      </section>

      {/* Giveaway Grid Section */}
      <section id="giveaways" className="section">
        <div className="container">
          <div className={styles.sectionHeadingRow}>
            <div>
              <div className="eyebrow">Available Now</div>
              <h2 className="sectionTitle">Explore Active Giveaways</h2>
              <p className="sectionSubtitle">
                Review verified requirements before entering. Balances are safely deducted only upon your explicit confirmation.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
              <button
                type="button"
                className={`${styles.filterBtn} ${filter === 'ALL' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('ALL')}
              >
                All Rewards ({data.items.filter((i) => ['ACTIVE', 'UPCOMING'].includes(i.status)).length})
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${filter === 'PHYSICAL' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('PHYSICAL')}
              >
                Tech Hardware
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${filter === 'GIFT_CARD' ? styles.activeFilter : ''}`}
                onClick={() => setFilter('GIFT_CARD')}
              >
                Gift Cards & Vouchers
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className={styles.cardsGrid}>
            {filteredItems.length ? (
              filteredItems.map((item) => (
                <PrizeCard giveaway={item} key={item.id} />
              ))
            ) : (
              <div className={styles.emptyFilter}>
                <p>No giveaways found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <HowItWorks />

      {/* Transparency & Security Spotlight */}
      <section className={`${styles.announcementSection} section`}>
        <div className={`container ${styles.announcementGrid}`}>
          <div className={styles.announcementCopy}>
            <div className="eyebrow">Public Accountability</div>
            <h2 className="sectionTitle">Real Results, Shared Responsibly.</h2>
            <p className={styles.announcementDesc}>
              VELOOP operates on verifiable proof. Winners are determined automatically by cryptographically seeded draw routines when countdowns end. Winner records are permanently archived for platform transparency, while personal identities remain masked.
            </p>
            <div className={styles.announcementActions}>
              <Link to="/winners" className="button">
                <span>View Full Winners History</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className={styles.announcementCard}>
            <div className={styles.announcementArtWrap}>
              <img
                className={styles.announcementArt}
                src={ticketArt}
                alt="VELOOP verified entry"
              />
            </div>
            <div className={styles.announcementContent}>
              <div className={styles.shieldPill}>
                <ShieldCheck size={16} />
                <span>Audited Integrity</span>
              </div>
              <h3>Rules First. Rewards Next.</h3>
              <p>
                Every participant holds an equal chance within the verified single-entry parameters. We retain completed events as permanent historical records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <TrustSection />

      {/* Rules Section */}
      <section className="section">
        <div className="container narrow">
          <Rules rules={primary?.rules} eligibility={primary?.eligibility} />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Final Call to Action */}
      <section className={styles.finalCtaSection}>
        <div className={`container narrow ${styles.finalCtaWrap}`}>
          <div className={styles.ctaGlow} />
          <Flame size={36} className={styles.flameIcon} />
          <h2 className={styles.finalCtaTitle}>
            Ready to claim your next premium reward?
          </h2>
          <p className={styles.finalCtaDesc}>
            Join thousands of verified members earning entries through platform activities and winning authentic rewards.
          </p>
          <div className={styles.finalCtaActions}>
            <Link to="/register" className="button buttonLarge">
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </Link>
            <a href="#giveaways" className="button buttonLarge buttonSecondary">
              <span>Browse Rewards</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
