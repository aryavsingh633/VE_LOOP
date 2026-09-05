import { useState } from 'react';
import { CheckCircle2, LogIn, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from './Modal';
import { formatEntry } from '../utils/format';
import styles from './ParticipationModals.module.css';

export function LoginRequiredModal({ onClose }) {
  return (
    <Modal title="Login required" onClose={onClose}>
      <p className={styles.copy}>
        Please log in to your VELOOP Rewards account before participating.
      </p>
      <div className={styles.actions}>
        <Link className="button" to="/login">
          Log in <LogIn size={16} />
        </Link>
        <Link className="button buttonSecondary" to="/register">
          Create account
        </Link>
      </div>
    </Modal>
  );
}
export function ConfirmJoinModal({
  giveaway,
  balance,
  onConfirm,
  onClose,
  busy,
  error,
}) {
  const fee = giveaway.prize;
  const current = balance?.[fee.entryCurrency] ?? 0;
  return (
    <Modal title="Confirm your entry" onClose={onClose}>
      <p className={styles.copy}>
        You’re about to enter for <strong>{giveaway.prize.name}</strong>. VELOOP
        confirms your actual balance and eligibility before your entry is
        recorded.
      </p>
      <div className={styles.feeBox}>
        <span>
          Your balance<strong>{formatEntry(current, fee.entryCurrency)}</strong>
        </span>
        <span>
          Entry fee
          <strong>{formatEntry(fee.entryAmount, fee.entryCurrency)}</strong>
        </span>
      </div>
      <p className={current >= fee.entryAmount ? styles.good : styles.warn}>
        {current >= fee.entryAmount
          ? '✓ You appear to have enough balance. Final validation happens securely on confirmation.'
          : `You need ${formatEntry(fee.entryAmount - current, fee.entryCurrency)} more.`}
      </p>
      {error && <p className={styles.warn}>{error}</p>}
      <button
        className="button buttonFull"
        disabled={busy || current < fee.entryAmount}
        onClick={onConfirm}
      >
        {busy
          ? 'Confirming securely…'
          : `Confirm & join for ${formatEntry(fee.entryAmount, fee.entryCurrency)}`}
      </button>
    </Modal>
  );
}
export function JoinSuccessModal({ entry, onClose }) {
  return (
    <Modal title="You’re participating!" onClose={onClose}>
      <div className={styles.success}>
        <PartyPopper />
        <p>
          Your entry for{' '}
          <strong>{formatEntry(entry.amount, entry.currency)}</strong> was
          recorded. We’ll keep your participation visible in your profile.
        </p>
        <button className="button" onClick={onClose}>
          Done <CheckCircle2 size={16} />
        </button>
      </div>
    </Modal>
  );
}
export function ClaimModal({ giveaway, onSubmit, onClose, busy }) {
  const isEmail = giveaway.prize.claimType === 'EMAIL_ONLY';
  const [form, setForm] = useState({});
  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };
  const fields = isEmail
    ? [['email', 'Email address', 'email']]
    : [
        ['fullName', 'Full name', 'text'],
        ['phone', 'Phone number', 'tel'],
        ['address', 'Complete address', 'text'],
        ['city', 'City', 'text'],
        ['state', 'State', 'text'],
        ['pinCode', 'PIN code', 'text'],
      ];
  return (
    <Modal
      title={isEmail ? 'Claim gift card' : 'Claim your prize'}
      onClose={onClose}
    >
      <p className={styles.copy}>
        You won <strong>{giveaway.prize.name}</strong>. This information is
        private and used only for fulfillment.
      </p>
      <form onSubmit={submit} className={styles.form}>
        {fields.map(([name, label, type]) => (
          <label key={name}>
            {label}
            <input
              required
              type={type}
              value={form[name] || ''}
              onChange={(event) =>
                setForm({ ...form, [name]: event.target.value })
              }
            />
          </label>
        ))}
        <button className="button buttonFull" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit claim'}
        </button>
      </form>
    </Modal>
  );
}
