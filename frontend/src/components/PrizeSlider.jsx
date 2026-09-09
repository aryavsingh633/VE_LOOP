import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import styles from './PrizeSlider.module.css';
import Iphone from '../assets/images/IPhone_Image.png';
import Watch from '../assets/images/Watch_ Image.png';
import Earpods from '../assets/images/Earpod_Image.png';
import VC20 from '../assets/images/20VC_Image.png';
import VC500 from '../assets/images/500VC_Image.png';
import VC2000 from '../assets/images/2000VC_ Image.png';

const prizeImageMap = {
  'iPhone 15 Pro': Iphone,
  'Apple Watch Series 9': Watch,
  'AirPods Pro': Earpods,
  '₹2,000 Amazon Gift Card': VC2000,
  '₹500 Amazon Gift Card': VC500,
  '₹20 Amazon Voucher': VC20,
};

export function PrizeSlider({ prizes = [] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || prizes.length < 2) return undefined;
    const id = setInterval(
      () => setIndex((current) => (current + 1) % prizes.length),
      3600,
    );
    return () => clearInterval(id);
  }, [paused, prizes.length]);

  if (!prizes.length) return null;

  const prize = prizes[index];
  const prizeImage = prizeImageMap[prize.name];

  const handlePrev = (e) => {
    e.stopPropagation();
    setIndex((current) => (current - 1 + prizes.length) % prizes.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setIndex((current) => (current + 1) % prizes.length);
  };

  return (
    <div
      className={styles.slider}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.topBadge}>
        <Sparkles size={13} className={styles.sparkle} />
        <span>Featured Prize #{prize.position || index + 1}</span>
      </div>

      <div className={styles.displayArea}>
        <button
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={handlePrev}
          aria-label="Previous reward"
        >
          <ChevronLeft size={18} />
        </button>

        <div className={styles.imageWrap}>
          <div className={styles.spotlight} />
          {prizeImage ? (
            <img
              key={prize.name}
              src={prizeImage}
              alt={prize.name}
              className={styles.prizeImg}
            />
          ) : (
            <span className={styles.placeholder}>✦</span>
          )}
        </div>

        <button
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={handleNext}
          aria-label="Next reward"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className={styles.prizeDetails}>
        <h4 className={styles.prizeTitle}>{prize.name}</h4>
      </div>

      <div className={styles.indicators}>
        {prizes.map((p, i) => (
          <button
            key={i}
            aria-label={`View prize ${i + 1}`}
            className={`${styles.dot} ${i === index ? styles.activeDot : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
