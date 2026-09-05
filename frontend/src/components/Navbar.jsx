import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, WalletCards, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { walletService } from '../services/walletService';
import { formatEntry } from '../utils/format';
import styles from './Navbar.module.css';

export function Navbar() {
  const { user, logout, ready, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [balances, setBalances] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadWallet = () => {
      if (user)
        walletService
          .get()
          .then(({ balances: value }) => setBalances(value))
          .catch(() => setBalances(null));
      else setBalances(null);
    };
    loadWallet();
    window.addEventListener('velop:wallet-changed', loadWallet);
    return () => window.removeEventListener('velop:wallet-changed', loadWallet);
  }, [user]);
  const leave = async () => {
    await logout();
    navigate('/giveaways');
  };
  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`} aria-label="Main navigation">
        <Link
          className={styles.brand}
          to="/giveaways"
          aria-label="VELOOP Rewards home"
        >
          <span className={styles.mark}>VR</span>
          <span>
            VELOOP <em>REWARDS</em>
          </span>
        </Link>
        <button
          type="button"
          className={styles.menu}
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <Menu size={21} />
        </button>
        <div
          className={`${styles.links} ${open ? styles.open : ''}`}
          onClick={() => setOpen(false)}
        >
          <NavLink to="/giveaways">Giveaways</NavLink>
          <NavLink to="/winners">Winners</NavLink>
          <a href="/giveaways#how-it-works">How it works</a>
          {ready && user ? (
            <>
              {balances && (
                <Link className={styles.wallet} to="/profile">
                  <WalletCards size={15} /> {formatEntry(balances.VE, 'VE')}
                </Link>
              )}
              {isAdmin && (
                <NavLink className={styles.admin} to="/admin">
                  <ShieldCheck size={15} /> Admin
                </NavLink>
              )}
              <Link className={styles.profile} to="/profile">
                {user.name.split(' ')[0]}
              </Link>
              <button type="button" className={styles.logout} onClick={leave}>
                <LogOut size={15} />
                <span>Log out</span>
              </button>
            </>
          ) : ready ? (
            <>
              <Link className={styles.login} to="/login">
                Log in
              </Link>
              <Link className="button buttonSmall" to="/register">
                Join VELOOP
              </Link>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
