import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      3000,
    );
    return () => clearInterval(id);
  }, [paused, prizes.length]);

  if (!prizes.length) return null;

  const prize = prizes[index];
  const prizeImage = prizeImageMap[prize.name];

  const handlePrev = () =>
    setIndex((current) => (current - 1 + prizes.length) % prizes.length);
  const handleNext = () => setIndex((current) => (current + 1) % prizes.length);

  return (
    <div
      className={styles.slider}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        className={styles.nav}
        onClick={handlePrev}
        aria-label="Previous prize"
      >
        <ChevronLeft size={20} />
      </button>

      <div className={styles.prizeDisplay}>
        {prizeImage ? (
          <img
            src={prizeImage}
            alt={prize.name}
            className={styles.prizeImage}
          />
        ) : (
          <span className={styles.placeholder}>✦</span>
        )}
      </div>

      <button
        className={styles.nav}
        onClick={handleNext}
        aria-label="Next prize"
      >
        <ChevronRight size={20} />
      </button>

      <div className={styles.dots}>
        {prizes.map((_, i) => (
          <button
            key={i}
            aria-label={`Show prize ${i + 1}`}
            className={i === index ? styles.active : ''}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
