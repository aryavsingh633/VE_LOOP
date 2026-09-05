import { CheckCircle2, LockKeyhole, Scale, BadgeCheck } from 'lucide-react';
import styles from './InfoSections.module.css';

export function HowItWorks({ detail = false }) {
  const steps = detail
    ? [
        'Review the giveaway',
        'Check eligibility',
        'Pay the required entry',
        'Participation recorded',
        'Wait for the giveaway to end',
        'Winners are selected',
        'Winner claims prize',
      ]
    : [
        'Sign up or log in',
        'Complete activities',
        'Earn entries',
        'Win rewards',
      ];
  return (
    <section id="how-it-works" className="section">
      <div className="container">
        <div className="eyebrow">Simple by design</div>
        <h2 className="sectionTitle">How to participate</h2>
        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div className={styles.step} key={step}>
              <b>{String(index + 1).padStart(2, '0')}</b>
              <span>{step}</span>
              {index < steps.length - 1 && <i aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function TrustSection() {
  const points = [
    [
      CheckCircle2,
      'Transparent rules',
      'Entry requirements and timelines are presented before you join.',
    ],
    [
      LockKeyhole,
      'Respectful privacy',
      'Only the information needed to deliver a prize is collected.',
    ],
    [
      Scale,
      'Fair participation',
      'Entry and winner rules are consistently applied by the service.',
    ],
    [
      BadgeCheck,
      'Reward clarity',
      'Prize details, fees, and claim paths stay easy to review.',
    ],
  ];
  return (
    <section className={`${styles.trust} section`}>
      <div className="container">
        <div className="eyebrow">Built for confidence</div>
        <h2 className="sectionTitle">A better way to reward participation</h2>
        <div className={styles.trustGrid}>
          {points.map(([Icon, title, copy]) => (
            <article key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export function FAQ() {
  const questions = [
    [
      'How do I participate?',
      'Create a VELOOP account, review an available giveaway, and confirm the stated entry requirement.',
    ],
    [
      'How are winners selected?',
      'After a giveaway has ended, eligible participants are selected through the protected winner-selection process.',
    ],
    [
      'When are winners announced?',
      'Winners are announced after selection has been finalized. Live giveaways do not show placeholder winners.',
    ],
    [
      'What happens if I win?',
      'You will see a personalized winner state after signing in, with a secure claim path and its deadline.',
    ],
    [
      'Can I enter more than one giveaway?',
      'You can explore different events, but each event accepts one participation per verified account.',
    ],
  ];
  return (
    <section className="section">
      <div className="container narrow">
        <div className="eyebrow">Helpful answers</div>
        <h2 className="sectionTitle">Questions, clearly answered</h2>
        <div className={styles.faq}>
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Rules({ rules = [], eligibility = [] }) {
  return (
    <section id="rules" className={styles.rules}>
      <h2>Giveaway rules & guidelines</h2>
      <details open>
        <summary>Eligibility & participation</summary>
        <ul>
          {eligibility.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>
      <details>
        <summary>Entry & selection rules</summary>
        <ul>
          {rules.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>
      <details>
        <summary>Claim requirements</summary>
        <p>
          Winners must submit the required delivery details before the
          server-enforced claim deadline. Claim details are never displayed
          publicly.
        </p>
      </details>
    </section>
  );
}
