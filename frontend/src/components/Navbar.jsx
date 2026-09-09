import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Coins, LogOut, ShieldCheck, User, Sparkles } from 'lucide-react';
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
      if (user) {
        walletService
          .get()
          .then(({ balances: value }) => setBalances(value))
          .catch(() => setBalances(null));
      } else {
        setBalances(null);
      }
    };
    loadWallet();
    window.addEventListener('velop:wallet-changed', loadWallet);
    return () => window.removeEventListener('velop:wallet-changed', loadWallet);
  }, [user]);

  const leave = async () => {
    await logout();
    setOpen(false);
    navigate('/giveaways');
  };

  const closeMenu = () => setOpen(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navWrap}`}>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link
            className={styles.brand}
            to="/giveaways"
            onClick={closeMenu}
            aria-label="VELOOP Rewards home"
          >
            <div className={styles.mark}>
              <span className={styles.markText}>VR</span>
              <span className={styles.liveDot} aria-hidden="true" />
            </div>
            <div className={styles.brandMeta}>
              <span className={styles.brandName}>VELOOP</span>
              <span className={styles.brandTag}>
                REWARDS
                <Sparkles size={10} className={styles.sparkle} />
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className={styles.centerLinks}>
            <NavLink
              to="/giveaways"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeLink : ''}`
              }
            >
              Giveaways
            </NavLink>
            <NavLink
              to="/winners"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeLink : ''}`
              }
            >
              Winners
            </NavLink>
            <a href="/giveaways#how-it-works" className={styles.navLink}>
              How It Works
            </a>
          </div>

          {/* User Controls */}
          <div className={styles.actions}>
            {ready && user ? (
              <div className={styles.authGroup}>
                {balances && (
                  <Link
                    className={styles.walletBadge}
                    to="/profile"
                    title="View wallet & rewards balance"
                  >
                    <Coins size={15} className={styles.coinIcon} />
                    <span className={styles.walletAmount}>
                      {formatEntry(balances.VE, 'VE')}
                    </span>
                  </Link>
                )}

                {isAdmin && (
                  <NavLink className={styles.adminBadge} to="/admin" title="Admin Dashboard">
                    <ShieldCheck size={15} />
                    <span>Admin</span>
                  </NavLink>
                )}

                <Link className={styles.profileBadge} to="/profile" title="My Rewards Profile">
                  <div className={styles.avatar}>
                    <User size={14} />
                  </div>
                  <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                </Link>

                <button
                  type="button"
                  className={styles.logoutBtn}
                  onClick={leave}
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : ready ? (
              <div className={styles.guestGroup}>
                <Link className={styles.loginLink} to="/login">
                  Log in
                </Link>
                <Link className="button buttonSmall" to="/register">
                  Join VELOOP
                </Link>
              </div>
            ) : null}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className={styles.menuToggle}
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className={styles.mobileDrawer} onClick={closeMenu}>
          <div
            className={styles.drawerContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.drawerLinks}>
              <NavLink
                to="/giveaways"
                className={({ isActive }) =>
                  `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`
                }
                onClick={closeMenu}
              >
                Giveaways
              </NavLink>
              <NavLink
                to="/winners"
                className={({ isActive }) =>
                  `${styles.drawerLink} ${isActive ? styles.activeDrawerLink : ''}`
                }
                onClick={closeMenu}
              >
                Winners
              </NavLink>
              <a
                href="/giveaways#how-it-works"
                className={styles.drawerLink}
                onClick={closeMenu}
              >
                How It Works
              </a>
            </div>

            <div className={styles.drawerDivider} />

            {ready && user ? (
              <div className={styles.drawerUserSection}>
                {balances && (
                  <Link
                    to="/profile"
                    className={styles.drawerWallet}
                    onClick={closeMenu}
                  >
                    <Coins size={16} className={styles.coinIcon} />
                    <span>Wallet Balance:</span>
                    <strong>{formatEntry(balances.VE, 'VE')}</strong>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={styles.drawerAdmin}
                    onClick={closeMenu}
                  >
                    <ShieldCheck size={16} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={styles.drawerProfile}
                  onClick={closeMenu}
                >
                  <User size={16} />
                  <span>Account ({user.name})</span>
                </Link>
                <button
                  type="button"
                  className={styles.drawerLogout}
                  onClick={leave}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            ) : ready ? (
              <div className={styles.drawerAuthActions}>
                <Link
                  to="/login"
                  className={styles.drawerLogin}
                  onClick={closeMenu}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="button buttonFull"
                  onClick={closeMenu}
                >
                  Join VELOOP
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
