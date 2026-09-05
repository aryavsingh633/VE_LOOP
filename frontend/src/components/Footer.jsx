import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer({ compact = false }) {
  return (
    <footer className={`${styles.footer} ${compact ? styles.compact : ''}`}>
      <div className="container">
        <div className={styles.top}>
          <div>
            <div className={styles.brand}>
              VELOOP <span>REWARDS</span>
            </div>
            <p>
              Thoughtful rewards, clear rules, and a safer way to participate.
            </p>
          </div>
          <div className={styles.links}>
            <Link to="/giveaways">Giveaway Home</Link>
            <Link to="/giveaways#rules">Rules</Link>
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
            <a href="mailto:support@velop.example">Support</a>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} VELOOP Rewards</span>
          <span>Have questions? Contact VELOOP Rewards support.</span>
        </div>
      </div>
    </footer>
  );
}
