import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Users,
  Trophy,
  Coins,
  Package,
  Calendar,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { giveawayService } from '../services/giveawayService';
import { walletService } from '../services/walletService';
import { claimService } from '../services/claimService';
import { Countdown } from '../components/Countdown';
import { GiveawayLoader } from '../components/GiveawayLoader';
import { ErrorState } from '../components/StateViews';
import { HowItWorks, Rules } from '../components/InfoSections';
import { WinnersPanel, WinnerState } from '../components/WinnerPanels';
import {
  ClaimModal,
  ConfirmJoinModal,
  JoinSuccessModal,
  LoginRequiredModal,
} from '../components/ParticipationModals';
import { formatEntry, formatNumber } from '../utils/format';
import Iphone from '../assets/images/IPhone_Image.png';
import Watch from '../assets/images/Watch_ Image.png';
import Earpods from '../assets/images/Earpod_Image.png';
import VC20 from '../assets/images/20VC_Image.png';
import VC500 from '../assets/images/500VC_Image.png';
import VC2000 from '../assets/images/2000VC_ Image.png';
import styles from './GiveawayDetailPage.module.css';

const prizeImageMap = {
  'iPhone 15 Pro': Iphone,
  'Apple Watch Series 9': Watch,
  'AirPods Pro': Earpods,
  '₹2,000 Amazon Gift Card': VC2000,
  '₹500 Amazon Gift Card': VC500,
  '₹20 Amazon Voucher': VC20,
};

export function GiveawayDetailPage() {
  const { slug } = useParams();
  const { user, ready } = useAuth();
  const [giveaway, setGiveaway] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [myStatus, setMyStatus] = useState(null);
  const [winners, setWinners] = useState(null);
  const [claim, setClaim] = useState(null);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const idempotencyKey = useRef(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      const record = await giveawayService.get(slug);
      setGiveaway(record);
      const publicWinners = await giveawayService.winners(record.id);
      setWinners(publicWinners);
      if (user) {
        const [walletResult, statusResult] = await Promise.all([
          walletService.get(),
          giveawayService.myStatus(record.id),
        ]);
        setWallet(walletResult.balances);
        setMyStatus(statusResult);
        if (statusResult.winner) {
          const result = await claimService.mine(record.id);
          setClaim(result.claim);
        } else {
          setClaim(null);
        }
      } else {
        setWallet(null);
        setMyStatus(null);
        setClaim(null);
      }
    } catch {
      setError(true);
    }
  }, [slug, user]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const initiateJoin = () => {
    if (!user) return setModal('login');
    if (myStatus?.participating) return;
    setActionError('');
    setModal('confirm');
  };

  const confirmJoin = async () => {
    setBusy(true);
    setActionError('');
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    try {
      const result = await giveawayService.join(
        giveaway.id,
        idempotencyKey.current,
      );
      setWallet(result.wallet.balances);
      setMyStatus({
        participating: true,
        participation: result.participation,
        winner: false,
      });
      window.dispatchEvent(new Event('velop:wallet-changed'));
      setModal('success');
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const submitClaim = async (form) => {
    setBusy(true);
    try {
      const result = await claimService.submit(giveaway.id, form);
      setClaim(result.claim);
      setModal(null);
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return <ErrorState title="We couldn't load this giveaway." action={load} />;
  }

  if (!giveaway) {
    return <GiveawayLoader label="Loading reward specifications..." />;
  }

  const currentBalance = wallet?.[giveaway.prize.entryCurrency] ?? 0;
  const enough = currentBalance >= giveaway.prize.entryAmount;
  const prizeImage =
    prizeImageMap[giveaway.prize.name] || giveaway.prize.image;
  const isActive = giveaway.status === 'ACTIVE';

  return (
    <>
      {/* Detail Hero */}
      <section className={styles.detailHero}>
        <div className="container">
          <div className={styles.breadcrumbBar}>
            <Link className={styles.backLink} to="/giveaways">
              <ArrowLeft size={16} />
              <span>Back to All Giveaways</span>
            </Link>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.currentCrumb}>{giveaway.prize.name}</span>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroInfo}>
              <div className={styles.tagGroup}>
                <span className={`${styles.status} ${styles[giveaway.status]}`}>
                  {isActive && <span className={styles.pulseDot} />}
                  {giveaway.status.replace('_', ' ')}
                </span>
                <span className={styles.categoryPill}>
                  {giveaway.prize.prizeType === 'GIFT_CARD'
                    ? 'Instant Digital Voucher'
                    : 'Physical Hardware Reward'}
                </span>
              </div>

              <h1 className={styles.heroTitle}>{giveaway.prize.name}</h1>
              <p className={styles.heroDesc}>{giveaway.description}</p>

              <div className={styles.factsRow}>
                <div className={styles.factItem}>
                  <Trophy size={16} className={styles.factIconGold} />
                  <span>
                    <strong>{giveaway.winnerCount}</strong>{' '}
                    {giveaway.winnerCount === 1 ? 'Winner' : 'Winners'}
                  </span>
                </div>
                <div className={styles.factItem}>
                  <Users size={16} className={styles.factIconViolet} />
                  <span>
                    <strong>{formatNumber(giveaway.participantCount)}</strong>{' '}
                    Participants
                  </span>
                </div>
                <div className={styles.factItem}>
                  <Lock size={16} className={styles.factIconEmerald} />
                  <span>1 Verified Entry / Account</span>
                </div>
              </div>
            </div>

            {/* Prize Visual Showcase with Countdown */}
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseGlow} />
              <div className={styles.artFrame}>
                {typeof prizeImage === 'string' && prizeImage.length < 5 ? (
                  <span className={styles.emojiArt}>{prizeImage}</span>
                ) : (
                  <img
                    src={prizeImage}
                    alt={giveaway.prize.name}
                    className={styles.productPhoto}
                  />
                )}
              </div>
              <div className={styles.countdownBox}>
                <span className={styles.countdownLabel}>Event Closes In</span>
                <Countdown endAt={giveaway.endAt} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Participation Section */}
      <section className="section">
        <div className={`container ${styles.mainGrid}`}>
          <div className={styles.leftCol}>
            {/* Entry Requirement & Wallet Card */}
            <div className={styles.entryCard}>
              <div className={styles.entryHeader}>
                <div>
                  <span className={styles.entryEyebrow}>Participation Requirement</span>
                  <h2 className={styles.entryFeeHeading}>
                    {formatEntry(
                      giveaway.prize.entryAmount,
                      giveaway.prize.entryCurrency,
                    )}
                  </h2>
                </div>
                <div className={styles.currencyBadge}>
                  <Coins size={18} className={styles.coinIcon} />
                  <span>{giveaway.prize.entryCurrency}</span>
                </div>
              </div>

              {/* User Balance Comparison */}
              <div className={styles.balanceCompareBox}>
                <div className={styles.balanceInfo}>
                  <span className={styles.balanceTitle}>
                    {user ? 'Your Available Balance' : 'Wallet Authentication'}
                  </span>
                  <strong className={styles.balanceAmount}>
                    {user
                      ? formatEntry(currentBalance, giveaway.prize.entryCurrency)
                      : 'Log in to view balance'}
                  </strong>
                </div>

                {user && (
                  <div
                    className={`${styles.balanceStatusPill} ${
                      enough ? styles.statusGood : styles.statusWarn
                    }`}
                  >
                    {enough ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Sufficient Balance</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} />
                        <span>
                          Need{' '}
                          {formatEntry(
                            giveaway.prize.entryAmount - currentBalance,
                            giveaway.prize.entryCurrency,
                          )}{' '}
                          more
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button / Participation Status */}
              {myStatus?.participating ? (
                <div className={styles.participatingBox}>
                  <div className={styles.participatingIcon}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <strong>You are Participating!</strong>
                    <p>Your entry is verified on the VELOOP backend. Good luck!</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={`button buttonFull buttonLarge ${styles.joinButton}`}
                  onClick={initiateJoin}
                  disabled={giveaway.status !== 'ACTIVE'}
                >
                  {giveaway.status === 'ACTIVE'
                    ? user
                      ? `Confirm Entry for ${formatEntry(
                          giveaway.prize.entryAmount,
                          giveaway.prize.entryCurrency,
                        )}`
                      : 'Log In to Participate'
                    : 'Participation Closed'}
                </button>
              )}
            </div>

            {/* Winner Celebratory State */}
            {myStatus?.winner && (
              <WinnerState
                claim={claim}
                prize={giveaway.prize}
                onClaim={() => {
                  setActionError('');
                  setModal('claim');
                }}
              />
            )}

            {/* Prize Specification Highlights */}
            <div className={styles.specsCard}>
              <h2 className={styles.specsTitle}>Prize & Fulfillment Specs</h2>
              <p className={styles.specsDesc}>{giveaway.prize.description}</p>

              <div className={styles.specsGrid}>
                <div className={styles.specItem}>
                  <Package size={18} className={styles.specIcon} />
                  <div>
                    <span className={styles.specKey}>Prize Category</span>
                    <strong className={styles.specVal}>
                      {giveaway.prize.prizeType.replace('_', ' ')}
                    </strong>
                  </div>
                </div>

                <div className={styles.specItem}>
                  <ShieldCheck size={18} className={styles.specIcon} />
                  <div>
                    <span className={styles.specKey}>Selection Method</span>
                    <strong className={styles.specVal}>
                      Cryptographic Seed Draw
                    </strong>
                  </div>
                </div>

                <div className={styles.specItem}>
                  <Calendar size={18} className={styles.specIcon} />
                  <div>
                    <span className={styles.specKey}>Fulfillment</span>
                    <strong className={styles.specVal}>
                      {giveaway.prize.claimType === 'EMAIL_ONLY'
                        ? 'Email Delivery'
                        : 'Direct Tracked Courier'}
                    </strong>
                  </div>
                </div>

                <div className={styles.specItem}>
                  <Sparkles size={18} className={styles.specIcon} />
                  <div>
                    <span className={styles.specKey}>Fair Odds Policy</span>
                    <strong className={styles.specVal}>
                      1 Entry Per Verified User
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules & Eligibility */}
            <Rules rules={giveaway.rules} eligibility={giveaway.eligibility} />
          </div>

          {/* Right Sidebar */}
          <aside className={styles.sidebar}>
            {/* Trust Sidebar Box */}
            <div className={styles.sideCard}>
              <div className={styles.sideCardIcon}>
                <ShieldCheck size={26} />
              </div>
              <h3>Guaranteed Fair Participation</h3>
              <p>
                VELOOP enforces strict cryptographic verification on participant
                entry, balance deductions, and winner selection. No hidden algorithms.
              </p>
            </div>

            {/* Live/Past Winners Panel */}
            <WinnersPanel data={winners} />

            {/* Policy Restatement */}
            <div className={styles.restrictionBox}>
              <AlertCircle size={18} className={styles.restrIcon} />
              <p>
                Entry fees are locked only upon successful confirmation. Completed
                giveaways remain publicly visible for audit transparency.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* How It Works Detail */}
      <HowItWorks detail />

      {/* Modals */}
      {modal === 'login' && (
        <LoginRequiredModal onClose={() => setModal(null)} />
      )}
      {modal === 'confirm' && (
        <ConfirmJoinModal
          giveaway={giveaway}
          balance={wallet}
          onConfirm={confirmJoin}
          onClose={() => setModal(null)}
          busy={busy}
          error={actionError}
        />
      )}
      {modal === 'success' && (
        <JoinSuccessModal
          entry={{
            amount: giveaway.prize.entryAmount,
            currency: giveaway.prize.entryCurrency,
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'claim' && (
        <ClaimModal
          giveaway={giveaway}
          onSubmit={submitClaim}
          onClose={() => setModal(null)}
          busy={busy}
        />
      )}
    </>
  );
}
