import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  CircleCheck,
  Gift,
  UsersRound,
  Trophy,
  Timer,
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
import { formatNumber } from '../utils/format';
import giftBoxArt from '../assets/images/gift-box.png';
import ticketArt from '../assets/images/ticket-hand.png';
import Iphone from '../assets/images/IPhone_Image.png';
import Watch from '../assets/images/Watch_ Image.png';
import Earpods from '../assets/images/Earpod_Image.png';
import VC20 from '../assets/images/20VC_Image.png';
import VC500 from '../assets/images/500VC_Image.png';
import VC2000 from '../assets/images/2000VC_ Image.png';
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
      const id = location.hash.substring(1); // Remove the '#' from the hash
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); // Small delay to ensure DOM is fully rendered
      }
    }
  }, [data, location.hash]);

  const primary = useMemo(
    () =>
      data?.items.find((item) => item.status === 'ACTIVE') || data?.items[0],
    [data],
  );
  if (error)
    return (
      <ErrorState
        title="We couldn't load the giveaway information."
        action={load}
      />
    );
  if (!data)
    return (
      <>
        <GiveawayLoader />
        <section className="container">
          <StatsSkeleton />
          <div className={styles.skeletonCards}>
            <PrizeSkeleton />
            <PrizeSkeleton />
            <PrizeSkeleton />
          </div>
        </section>
      </>
    );
  if (!data.items.length)
    return (
      <EmptyState
        title="No current giveaway"
        description="The next giveaway is being prepared. Please check back soon."
      />
    );
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <div className={styles.badge}>
              <Gift size={14} /> Exclusive giveaway
            </div>
            <h1>
              Rewards worth
              <br />
              <i>showing up for.</i>
            </h1>
            <p>
              Explore premium VELOOP Rewards giveaways. Review every entry
              requirement, participate once, and follow a clear claim journey if
              you win.
            </p>
            <div className={styles.heroActions}>
              <a href="#giveaways" className="button">
                Explore rewards <ArrowDown size={16} />
              </a>
              <Link to="/winners" className="button buttonSecondary">
                Previous winners
              </Link>
            </div>
            <div className={styles.heroTrust}>
              <span>
                <CircleCheck size={16} /> Clear entry requirements
              </span>
              <span>
                <CircleCheck size={16} /> Protected participation
              </span>
            </div>
          </div>
          <div className={styles.heroShowcase}>
            {primary && (
              <>
                <img
                  className={styles.heroArt}
                  src={giftBoxArt}
                  alt=""
                  aria-hidden="true"
                />
                <div className={styles.glow} />
                <PrizeSlider
                  prizes={data.items.map((item) => ({
                    name: item.prize.name,
                    position: item.prize.position,
                  }))}
                />
              </>
            )}
          </div>
        </div>
      </section>
      {winnerData && (
        <WinnerSlider
          winners={winnerData.winners || []}
          demo={winnerData.meta?.isDemoData}
        />
      )}
      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsGrid}>
            <Stat
              icon={Gift}
              value={data.stats.activeGiveaways}
              label="Active giveaways"
            />
            <Stat
              icon={UsersRound}
              value={`${formatNumber(data.stats.participants)}${data.stats.participants > 999 ? '+' : ''}`}
              label="Participants"
            />
            <Stat
              icon={Trophy}
              value={formatNumber(data.stats.rewardsWon)}
              label="Rewards won"
            />
            <Stat
              icon={Timer}
              value={
                primary ? <Countdown endAt={primary.endAt} compact /> : '—'
              }
              label="Remaining"
            />
          </div>
          {data.meta?.isDemoData && (
            <p className="demoNote">
              Development demo data — figures do not represent live VELOOP
              activity.
            </p>
          )}
        </div>
      </section>
      <section id="giveaways" className="section">
        <div className="container">
          <div className={styles.sectionRow}>
            <div>
              <div className="eyebrow">Available now</div>
              <h2 className="sectionTitle">
                Choose a reward that feels right.
              </h2>
            </div>
            <p>
              Every card leads to the full giveaway details — nothing is
              deducted until you deliberately confirm your entry.
            </p>
          </div>
          <div className={styles.cards}>
            {data.items
              .filter((item) => ['ACTIVE', 'UPCOMING'].includes(item.status))
              .map((item) => (
                <PrizeCard giveaway={item} key={item.id} />
              ))}
          </div>
        </div>
      </section>
      <HowItWorks />
      <section className={`${styles.announcement} section`}>
        <div className="container">
          <div>
            <div className="eyebrow">Winner announcements</div>
            <h2 className="sectionTitle">Real results, shared responsibly.</h2>
            <p>
              Winner identities are masked in public. Active giveaways only show
              winners once selection is complete.
            </p>
            <Link to="/winners" className="button buttonSecondary">
              View previous winners <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.announcementCard}>
            <img
              className={styles.announcementArt}
              src={ticketArt}
              alt=""
              aria-hidden="true"
            />
            <Trophy />
            <span>Transparent by design</span>
            <strong>
              Rules first.
              <br />
              Rewards next.
            </strong>
            <p>
              We retain completed giveaways as history rather than overwriting
              them.
            </p>
          </div>
        </div>
      </section>
      <TrustSection />
      <section className="section">
        <div className="container narrow">
          <Rules rules={primary?.rules} eligibility={primary?.eligibility} />
        </div>
      </section>
      <FAQ />
    </>
  );
}
function Stat({ icon: Icon, value, label }) {
  return (
    <article>
      <Icon size={18} />
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}
