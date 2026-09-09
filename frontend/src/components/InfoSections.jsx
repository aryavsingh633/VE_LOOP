import { useState } from 'react';
import {
  CheckCircle2,
  LockKeyhole,
  Scale,
  BadgeCheck,
  UserCheck,
  Zap,
  Ticket,
  Trophy,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import styles from './InfoSections.module.css';

export function HowItWorks({ detail = false }) {
  const steps = detail
    ? [
        { num: '01', title: 'Review Reward Details', desc: 'Inspect prize specs, schedule, and transparent entry criteria.' },
        { num: '02', title: 'Confirm Eligibility', desc: 'Single verified entry per account ensures fair participant odds.' },
        { num: '03', title: 'Confirm Required Entry', desc: 'Securely deduct the required VE, SVE, or Token entry fee.' },
        { num: '04', title: 'Participation Recorded', desc: 'Cryptographically logged on VELOOP backend with an idempotency key.' },
        { num: '05', title: 'Giveaway Closes', desc: 'When the timer hits zero, entry closes and finalist pool locks.' },
        { num: '06', title: 'Provably Fair Draw', desc: 'Protected seed-based algorithm selects the winning participant(s).' },
        { num: '07', title: 'Instant Prize Claim', desc: 'Winners submit digital delivery email or shipping details securely.' },
      ]
    : [
        {
          num: '01',
          icon: UserCheck,
          title: 'Create & Verify Account',
          desc: 'Sign up in seconds. Each verified member gets a dedicated rewards wallet with protected balance tracking.',
        },
        {
          num: '02',
          icon: Zap,
          title: 'Complete Activities & Earn',
          desc: 'Earn VE currencies, Special VE (SVE), and Tokens through activities, loyalty tiers, and ecosystem milestones.',
        },
        {
          num: '03',
          icon: Ticket,
          title: 'Choose Giveaways & Join',
          desc: 'Explore curated electronics, smartwatches, audio gear, and vouchers. Enter once per event with zero hidden charges.',
        },
        {
          num: '04',
          icon: Trophy,
          title: 'Win & Claim Privately',
          desc: 'Winners are drawn transparently with masked public IDs. Claim physical tech delivered to your door or digital vouchers.',
        },
      ];

  return (
    <section id="how-it-works" className="section">
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className="eyebrow">Seamless Process</div>
          <h2 className="sectionTitle">How VELOOP Rewards Works</h2>
          <p className="sectionSubtitle">
            A transparent four-step reward journey built around fair odds, instant verification, and guaranteed fulfillment.
          </p>
        </div>

        <div className={detail ? styles.detailSteps : styles.stepGrid}>
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div className={styles.stepCard} key={step.num}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNum}>{step.num}</span>
                  {IconComponent && (
                    <div className={styles.stepIconWrap}>
                      <IconComponent size={20} />
                    </div>
                  )}
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {index < steps.length - 1 && !detail && (
                  <div className={styles.connector} aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  const points = [
    {
      icon: CheckCircle2,
      title: 'Transparent Entry Rules',
      copy: 'Every giveaway discloses exact entry fees, closing times, and prize specs before you participate. No surprise deductions.',
    },
    {
      icon: LockKeyhole,
      title: 'Masked Privacy First',
      copy: 'Public winner boards only show masked identifiers (e.g. User*****234). Sensitive shipping and contact info is never exposed.',
    },
    {
      icon: Scale,
      title: 'Provably Fair Selection',
      copy: 'Automated backend lifecycle jobs execute random winner draws based on cryptographic seeds. One verified entry per user.',
    },
    {
      icon: BadgeCheck,
      title: 'Guaranteed Fulfillment',
      copy: 'Direct shipping on physical hardware (iPhones, Apple Watches) and instant digital voucher dispatch straight to your inbox.',
    },
  ];

  return (
    <section className={`${styles.trust} section`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className="eyebrow">Security & Integrity</div>
          <h2 className="sectionTitle">Built for Trust and Confidence</h2>
          <p className="sectionSubtitle">
            We hold rewards to the same standards as modern financial services: verifiable data, protected balances, and zero deception.
          </p>
        </div>

        <div className={styles.trustGrid}>
          {points.map(({ icon: Icon, title, copy }) => (
            <article className={styles.trustCard} key={title}>
              <div className={styles.trustIconWrap}>
                <Icon size={24} />
              </div>
              <h3 className={styles.trustTitle}>{title}</h3>
              <p className={styles.trustCopy}>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const questions = [
    {
      q: 'How do I participate in a giveaway?',
      a: 'Sign up or log in to your VELOOP Rewards account, make sure you hold sufficient balance in the required currency (VE, SVE, or Tokens), choose an active giveaway from the showcase, and click "Confirm Entry". Your entry is cryptographically recorded instantly.',
    },
    {
      q: 'How are winners selected and is it provably fair?',
      a: 'When a giveaway countdown ends, the giveaway transitions to WINNERS_SELECTED status. Eligible participants are drawn using a secure server-side random selection routine. Each participant has equal weight within the event constraints (one entry per account).',
    },
    {
      q: 'When and where are winners announced?',
      a: 'Winner announcements appear on the Winners page and in the platform celebration ticker as soon as selection is finalized. We never display placeholder or fake winners on active live giveaways.',
    },
    {
      q: 'What happens if I win a prize?',
      a: 'If you win, your Giveaway Details page and Profile Dashboard will immediately present a personalized "Claim Prize" button. For digital vouchers, you will verify your email; for physical electronics, you provide your courier address.',
    },
    {
      q: 'Can I enter multiple giveaways simultaneously?',
      a: 'Yes! You are welcome to enter as many distinct giveaways as your wallet balance allows. However, each individual giveaway permits only ONE entry per verified member to ensure everyone has a fair shot.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="section">
      <div className="container narrow">
        <div className={styles.sectionHeader}>
          <div className="eyebrow">Clear Answers</div>
          <h2 className="sectionTitle">Frequently Asked Questions</h2>
          <p className="sectionSubtitle">
            Everything you need to know about entries, balance requirements, and winner fulfillment.
          </p>
        </div>

        <div className={styles.faqList}>
          {questions.map(({ q, a }, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ''}`}
                key={q}
              >
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{q}</span>
                  <ChevronDown
                    size={18}
                    className={`${styles.chevron} ${isOpen ? styles.chevronRotated : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className={styles.faqAnswer}>
                    <p>{a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Rules({ rules = [], eligibility = [] }) {
  const [openTab, setOpenTab] = useState('eligibility');

  return (
    <section id="rules" className={styles.rulesWrap}>
      <div className={styles.rulesCard}>
        <div className={styles.rulesHeader}>
          <ShieldAlert size={20} className={styles.rulesIcon} />
          <div>
            <h3>Giveaway Rules & Guidelines</h3>
            <p>Transparency policy enforced by VELOOP backend contracts.</p>
          </div>
        </div>

        <div className={styles.rulesTabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${openTab === 'eligibility' ? styles.activeTab : ''}`}
            onClick={() => setOpenTab('eligibility')}
          >
            Eligibility ({eligibility.length || 0})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${openTab === 'rules' ? styles.activeTab : ''}`}
            onClick={() => setOpenTab('rules')}
          >
            Participation Rules ({rules.length || 0})
          </button>
        </div>

        <div className={styles.rulesContent}>
          {openTab === 'eligibility' && (
            <ul className={styles.ruleList}>
              {eligibility.length ? (
                eligibility.map((item, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li>Standard VELOOP account verification required.</li>
              )}
            </ul>
          )}

          {openTab === 'rules' && (
            <ul className={styles.ruleList}>
              {rules.length ? (
                rules.map((item, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li>Standard single-entry rules apply to this event.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
