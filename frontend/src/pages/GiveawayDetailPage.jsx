import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
  Users,
  WalletCards,
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
import styles from './GiveawayDetailPage.module.css';

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
        } else setClaim(null);
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
  if (error)
    return <ErrorState title="We couldn't load this giveaway." action={load} />;
  if (!giveaway) return <GiveawayLoader label="Checking this reward…" />;
  const currentBalance = wallet?.[giveaway.prize.entryCurrency] ?? 0;
  const enough = currentBalance >= giveaway.prize.entryAmount;
  return (
    <>
      <section className={styles.detailHero}>
        <div className="container">
          <Link className={styles.back} to="/giveaways">
            <ArrowLeft size={15} /> All giveaways
          </Link>
          <div className={styles.heroGrid}>
            <div>
              <span className={`${styles.status} ${styles[giveaway.status]}`}>
                {giveaway.status.replace('_', ' ')}
              </span>
              <h1>{giveaway.prize.name}</h1>
              <p>{giveaway.description}</p>
              <div className={styles.heroFacts}>
                <span>
                  <Users size={15} /> {formatNumber(giveaway.participantCount)}{' '}
                  participants
                </span>
                <span>
                  <CheckCircle2 size={15} /> {giveaway.winnerCount}{' '}
                  {giveaway.winnerCount === 1 ? 'winner' : 'winners'}
                </span>
              </div>
            </div>
            <div className={styles.prizeArt}>
              <span>{giveaway.prize.image || '✦'}</span>
              <div>
                <small>Giveaway ends in</small>
                <Countdown endAt={giveaway.endAt} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className={`container ${styles.contentGrid}`}>
          <div>
            <section className={styles.entryCard}>
              <div>
                <span>Entry requirement</span>
                <h2>
                  {formatEntry(
                    giveaway.prize.entryAmount,
                    giveaway.prize.entryCurrency,
                  )}
                </h2>
                <p>
                  The entry fee is loaded from VELOOP’s giveaway configuration
                  and validated again by the service.
                </p>
              </div>
              <div className={styles.balance}>
                <WalletCards />
                <span>
                  {user ? 'Your current balance' : 'Sign in to view balance'}
                  <strong>
                    {user
                      ? formatEntry(
                          currentBalance,
                          giveaway.prize.entryCurrency,
                        )
                      : '—'}
                  </strong>
                </span>
              </div>
              {user && (
                <p className={enough ? styles.good : styles.warn}>
                  {enough
                    ? `✓ You have enough ${giveaway.prize.entryCurrency === 'TOKEN' ? 'Tokens' : `${giveaway.prize.entryCurrency}s`}.`
                    : `You need ${formatEntry(giveaway.prize.entryAmount - currentBalance, giveaway.prize.entryCurrency)} more.`}
                </p>
              )}
              {myStatus?.participating ? (
                <div className={styles.participating}>
                  <CheckCircle2 />
                  <span>
                    You’re participating
                    <br />
                    <small>Your entry is recorded.</small>
                  </span>
                </div>
              ) : (
                <button
                  className="button buttonFull"
                  onClick={initiateJoin}
                  disabled={giveaway.status !== 'ACTIVE'}
                >
                  {giveaway.status === 'ACTIVE'
                    ? user
                      ? `Join for ${formatEntry(giveaway.prize.entryAmount, giveaway.prize.entryCurrency)}`
                      : 'Log in to participate'
                    : 'Participation unavailable'}
                </button>
              )}
            </section>
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
            <section className={styles.info}>
              <h2>About this giveaway</h2>
              <p>{giveaway.prize.description}</p>
              <dl>
                <div>
                  <dt>Prize type</dt>
                  <dd>{giveaway.prize.prizeType.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt>Selection</dt>
                  <dd>Configured winner draw after end</dd>
                </div>
                <div>
                  <dt>Participation</dt>
                  <dd>One verified entry per account</dd>
                </div>
              </dl>
            </section>
            <Rules rules={giveaway.rules} eligibility={giveaway.eligibility} />
          </div>
          <aside>
            <div className={styles.sideCard}>
              <ShieldCheck />
              <h2>Participation, with safeguards</h2>
              <p>
                Final status, currency, eligibility, balance, and winner checks
                are verified by VELOOP’s backend at every sensitive step.
              </p>
            </div>
            <WinnersPanel data={winners} />
            <div className={styles.restrictions}>
              <CircleAlert size={16} />
              <p>
                Entry fees are shown before confirmation.{' '}
                <strong>PLACEHOLDER — CONFIRM WITH VELOOP:</strong> refund
                policy.
              </p>
            </div>
          </aside>
        </div>
      </section>
      <HowItWorks detail />
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
