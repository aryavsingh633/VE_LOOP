import { ArrowUpRight, Users, Trophy } from 'lucide-react';
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

// Map prize names to images
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

  return (
    <motion.article
      className={`${styles.card} ${featured ? styles.featured : ''}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
    >
      <div className={styles.art}>
        {typeof prizeImage === 'string' && prizeImage === '✦' ? (
          <span aria-hidden="true">{prizeImage}</span>
        ) : (
          <img src={prizeImage} alt={prize.name} />
        )}
        <div className={styles.orbit} />
      </div>
      <div className={styles.content}>
        <div className={styles.topline}>
          <span>PRIZE {prize.position}</span>
          <span className={`${styles.status} ${styles[giveaway.status]}`}>
            {giveaway.status.replace('_', ' ')}
          </span>
        </div>
        <h3>{prize.name}</h3>
        <p>{prize.description}</p>
        <div className={styles.meta}>
          <span>
            <Trophy size={14} /> {giveaway.winnerCount}{' '}
            {giveaway.winnerCount === 1 ? 'winner' : 'winners'}
          </span>
          <span>
            <Users size={14} /> {formatNumber(giveaway.participantCount)}{' '}
            participants
          </span>
        </div>
        <div className={styles.bottom}>
          <div>
            <small>Entry fee</small>
            <strong>
              {formatEntry(prize.entryAmount, prize.entryCurrency)}
            </strong>
          </div>
          <Countdown endAt={giveaway.endAt} compact />
        </div>
        <Link className="button buttonFull" to={`/giveaway/${giveaway.slug}`}>
          View giveaway <ArrowUpRight size={16} />
        </Link>
      </div>
    </motion.article>
  );
}
