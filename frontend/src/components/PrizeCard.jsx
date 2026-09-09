import { ArrowUpRight, Users, Trophy, Sparkles, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Countdown } from './Countdown';
import { formatEntry, formatNumber } from '../utils/format';
import styles from './PrizeCard.module.css';
import VC20 from '../assets/images/20VC_Image.png';
import VC500 from '../assets/images/500VC_Image.png';
import VC2000 from '../assets/images/2000VC_ Image.png';
import Iphone from '../assets/images/IPhone_Image.png';
import Watch from '../assets/images/Watch_ Image.png';
import Earpods from '../assets/images/Earpod_Image.png';

const prizeImageMap = {
  'iPhone 15 Pro': Iphone,
  'Apple Watch Series 9': Watch,
  'AirPods Pro': Earpods,
  '₹2,000 Amazon Gift Card': VC2000,
  '₹500 Amazon Gift Card': VC500,
  '₹20 Amazon Voucher': VC20,
};

export function PrizeCard({ giveaway, featured = false }) {
  const { prize } = giveaway;
  const prizeImage = prizeImageMap[prize.name] || prize.image || '✦';
  const isActive = giveaway.status === 'ACTIVE';

  return (
    <motion.article
      className={`${styles.card} ${featured ? styles.featured : ''}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top badges */}
      <div className={styles.topline}>
        <div className={styles.leftPills}>
          <span className={styles.rankBadge}>
            PRIZE #{prize.position || 1}
          </span>
          <span className={styles.typeBadge}>
            {prize.prizeType === 'GIFT_CARD' ? 'DIGITAL VOUCHER' : 'TECH REWARD'}
          </span>
        </div>
        <span className={`${styles.status} ${styles[giveaway.status]}`}>
          {isActive && <span className={styles.pulseDot} />}
          {giveaway.status.replace('_', ' ')}
        </span>
      </div>

      {/* Visual stage */}
      <div className={styles.artStage}>
        <div className={styles.glow} />
        {typeof prizeImage === 'string' && prizeImage.length < 5 ? (
          <span className={styles.emojiArt} aria-hidden="true">
            {prizeImage}
          </span>
        ) : (
          <img
            src={prizeImage}
            alt={prize.name}
            className={styles.prizeImg}
            loading="lazy"
          />
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{prize.name}</h3>
        <p className={styles.description}>{prize.description}</p>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <Trophy size={14} className={styles.trophyIcon} />
            <span>
              <strong>{giveaway.winnerCount}</strong>{' '}
              {giveaway.winnerCount === 1 ? 'Winner' : 'Winners'}
            </span>
          </div>
          <div className={styles.metaItem}>
            <Users size={14} className={styles.usersIcon} />
            <span>
              <strong>{formatNumber(giveaway.participantCount)}</strong>{' '}
              {giveaway.participantCount === 1 ? 'Participant' : 'Participants'}
            </span>
          </div>
        </div>

        {/* Pricing & Countdown */}
        <div className={styles.pricingBox}>
          <div className={styles.feeGroup}>
            <span className={styles.feeLabel}>Entry Requirement</span>
            <div className={styles.feeValue}>
              <Tag size={13} className={styles.tagIcon} />
              <strong>{formatEntry(prize.entryAmount, prize.entryCurrency)}</strong>
            </div>
          </div>
          <div className={styles.countdownGroup}>
            <Countdown endAt={giveaway.endAt} compact />
          </div>
        </div>

        {/* CTA */}
        <Link
          className={`button buttonFull ${styles.ctaButton}`}
          to={`/giveaway/${giveaway.slug}`}
        >
          <span>View Details & Enter</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </motion.article>
  );
}
