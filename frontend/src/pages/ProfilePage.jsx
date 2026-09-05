import { useCallback, useEffect, useState } from 'react';
import { Gift, LogIn, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { walletService } from '../services/walletService';
import { GiveawayLoader } from '../components/GiveawayLoader';
import { ErrorState } from '../components/StateViews';
import { formatEntry } from '../utils/format';
import styles from './ProfilePage.module.css';

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
  if (!ready) return <GiveawayLoader />;
  if (!user)
    return (
      <section className={styles.unauth}>
        <LogIn />
        <h1>Log in to view your rewards.</h1>
        <p>
          Your VELOOP balance and participation details are available only in
          your authenticated profile.
        </p>
        <Link className="button" to="/login">
          Log in
        </Link>
      </section>
    );
  if (error)
    return <ErrorState title="We couldn't load your wallet." action={load} />;
  if (!wallet) return <GiveawayLoader label="Loading your wallet…" />;
  return (
    <section className="section">
      <div className={`container ${styles.wrap}`}>
        <div>
          <div className="eyebrow">Your VELOOP account</div>
          <h1>{user.name}</h1>
          <p className={styles.id}>
            {user.publicId} · {user.email}
          </p>
          <Link className="button buttonSecondary" to="/giveaways">
            <Gift size={16} /> Explore giveaways
          </Link>
        </div>
        <section className={styles.wallet}>
          <div className={styles.walletHead}>
            <WalletCards />
            <div>
              <span>Display-only balance</span>
              <h2>Your wallet</h2>
            </div>
          </div>
          <p>
            VELOOP verifies current balance again before it processes any
            giveaway entry.
          </p>
          <div className={styles.balances}>
            {Object.entries(wallet.balances).map(([currency, amount]) => (
              <div key={currency}>
                <span>{currency === 'TOKEN' ? 'Tokens' : `${currency}s`}</span>
                <strong>{formatEntry(amount, currency)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
