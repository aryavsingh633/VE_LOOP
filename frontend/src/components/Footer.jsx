import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Sparkles, CheckCircle } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer({ compact = false }) {
  return (
    <footer className={`${styles.footer} ${compact ? styles.compact : ''}`}>
      <div className={`container ${styles.container}`}>
        {!compact && (
          <div className={styles.topGrid}>
            <div className={styles.brandCol}>
              <div className={styles.brand}>
                <div className={styles.mark}>VR</div>
                <div>
                  <span className={styles.brandName}>VELOOP</span>
                  <span className={styles.brandTag}>REWARDS</span>
                </div>
              </div>
              <p className={styles.mission}>
                Premium giveaway platform powered by transparent entry rules,
                provably fair participant selection, and guaranteed prize fulfillment.
              </p>
              <div className={styles.trustBadges}>
                <span className={styles.trustBadge}>
                  <ShieldCheck size={14} /> Verifiable Draws
                </span>
                <span className={styles.trustBadge}>
                  <Lock size={14} /> Masked Privacy
                </span>
                <span className={styles.trustBadge}>
                  <CheckCircle size={14} /> Protected Balances
                </span>
              </div>
            </div>

            <div className={styles.linksCol}>
              <h4>Navigation</h4>
              <Link to="/giveaways">Giveaways Showcase</Link>
              <Link to="/winners">Winner Announcements</Link>
              <a href="/giveaways#how-it-works">How It Works</a>
              <Link to="/profile">My Rewards Profile</Link>
            </div>

            <div className={styles.linksCol}>
              <h4>Platform Rules</h4>
              <a href="/giveaways#rules">Eligibility Criteria</a>
              <a href="/giveaways#rules">Participation Rules</a>
              <a href="/giveaways#rules">Prize Claim Terms</a>
              <a href="/giveaways#rules">Anti-Fraud Safeguards</a>
            </div>

            <div className={styles.linksCol}>
              <h4>Support & Trust</h4>
              <a href="mailto:support@velop.example">Help Center</a>
              <a href="#terms">Terms of Service</a>
              <a href="#privacy">Privacy Policy</a>
              <span className={styles.uptime}>
                <span className={styles.uptimeDot} /> System Operational
              </span>
            </div>
          </div>
        )}

        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            <span>© {new Date().getFullYear()} VELOOP Rewards. All rights reserved.</span>
            <span className={styles.separator}>•</span>
            <span className={styles.subtext}>
              Participate responsibly. Rules enforced transparently.
            </span>
          </div>
          <div className={styles.metaRow}>
            <span>Designed for transparency & security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
