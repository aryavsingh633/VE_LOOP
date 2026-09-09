import { useCallback, useEffect, useState } from 'react';
import {
  Gift,
  LogIn,
  Coins,
  ShieldCheck,
  User,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { walletService } from '../services/walletService';
import { GiveawayLoader } from '../components/GiveawayLoader';
import { ErrorState } from '../components/StateViews';
import { formatEntry } from '../utils/format';
import styles from './ProfilePage.module.css';

const currencyMeta = {
  VE: {
    name: 'Velocity Entries (VE)',
    badge: 'Primary Currency',
    desc: 'Used for flagship hardware & gift cards (iPhone 15 Pro, Apple Watch, ₹2,000 Amazon).',
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  SVE: {
    name: 'Special Velocity Entries (SVE)',
    badge: 'Special Tier',
    desc: 'Reserved for premium audio gear and exclusive limited-edition drops (AirPods Pro).',
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.1)',
    border: 'rgba(192, 132, 252, 0.25)',
  },
  TOKEN: {
    name: 'Everyday Reward Tokens',
    badge: 'Daily Tokens',
    desc: 'Earned through frequent platform milestones for everyday micro-vouchers.',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.1)',
    border: 'rgba(251, 191, 36, 0.25)',
  },
};

export function ProfilePage() {
  const { user, ready } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!user) return;
    setError(false);
    walletService
      .get()
      .then(setWallet)
      .catch(() => setError(true));
  }, [user]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  if (!ready) return <GiveawayLoader label="Authenticating session..." />;

  if (!user) {
    return (
      <section className={styles.unauthSection}>
        <div className={`container narrow ${styles.unauthCard}`}>
          <div className={styles.lockWrap}>
            <LogIn size={32} />
          </div>
          <h1>Authentication Required</h1>
          <p>
            Your VELOOP wallet balance, active entries, and prize claim status are
            accessible only within your authenticated session.
          </p>
          <div className={styles.unauthActions}>
            <Link className="button buttonLarge" to="/login">
              <span>Sign In to Account</span>
              <ArrowRight size={16} />
            </Link>
            <Link className="button buttonLarge buttonSecondary" to="/register">
              <span>Create Free Account</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't retrieve your wallet records."
        action={load}
      />
    );
  }

  if (!wallet) return <GiveawayLoader label="Loading your rewards wallet..." />;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'VR';

  return (
    <div className={styles.pageWrap}>
      {/* Profile Header Bar */}
      <section className={styles.headerSection}>
        <div className="container">
          <div className={styles.userBanner}>
            <div className={styles.avatarWrap}>
              <span className={styles.avatarText}>{initials}</span>
              <span className={styles.verifiedDot} title="Verified Member" />
            </div>

            <div className={styles.userInfo}>
              <div className={styles.userTopline}>
                <div className={styles.activePill}>
                  <CheckCircle2 size={13} />
                  <span>ACTIVE MEMBER</span>
                </div>
                <span className={styles.memberId}>ID: {user.publicId}</span>
              </div>
              <h1 className={styles.userName}>{user.name}</h1>
              <p className={styles.userEmail}>{user.email}</p>
            </div>

            <div className={styles.userActions}>
              <Link className="button buttonSecondary" to="/giveaways">
                <Gift size={16} />
                <span>Explore Giveaways</span>
              </Link>
              <Link className="button buttonOutline" to="/winners">
                <Sparkles size={16} />
                <span>Winners Archive</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet Currencies Showcase */}
      <section className="section">
        <div className="container">
          <div className={styles.walletHeader}>
            <div>
              <div className="eyebrow">
                <Wallet size={13} className={styles.goldIcon} />
                <span>Live Balances</span>
              </div>
              <h2 className={styles.walletTitle}>Your Rewards Wallet</h2>
              <p className={styles.walletSubtitle}>
                Balances are securely synced with the VELOOP backend and protected against double-spending.
              </p>
            </div>
          </div>

          <div className={styles.balancesGrid}>
            {Object.entries(wallet.balances).map(([currency, amount]) => {
              const meta = currencyMeta[currency] || {
                name: `${currency} Balance`,
                badge: 'Reward Currency',
                desc: 'Available for giveaway entries.',
                color: '#8b5cf6',
                bg: 'rgba(139, 92, 246, 0.1)',
                border: 'rgba(139, 92, 246, 0.25)',
              };

              return (
                <article
                  key={currency}
                  className={styles.currencyCard}
                  style={{ '--currency-color': meta.color }}
                >
                  <div className={styles.currencyTop}>
                    <div
                      className={styles.currencyIcon}
                      style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}
                    >
                      <Coins size={22} />
                    </div>
                    <span
                      className={styles.currencyBadge}
                      style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}
                    >
                      {meta.badge}
                    </span>
                  </div>

                  <div className={styles.currencyAmountWrap}>
                    <strong className={styles.amountNum}>
                      {formatEntry(amount, currency)}
                    </strong>
                    <span className={styles.currencyFullName}>{meta.name}</span>
                  </div>

                  <p className={styles.currencyDesc}>{meta.desc}</p>

                  <div className={styles.cardFooter}>
                    <Link to="/giveaways" className={styles.useLink}>
                      <span>Enter Giveaways</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Reassurance & Verification Banner */}
          <div className={styles.securityBanner}>
            <div className={styles.shieldWrap}>
              <ShieldCheck size={28} />
            </div>
            <div className={styles.securityContent}>
              <h3>Cryptographically Verified Balances</h3>
              <p>
                VELOOP conducts an atomic backend verification on your wallet balance and account eligibility
                at the exact instant you confirm any giveaway entry. Entries cannot exceed available funds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
