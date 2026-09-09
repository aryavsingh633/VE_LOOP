import { useState } from 'react';
import {
  CheckCircle2,
  LogIn,
  PartyPopper,
  ShieldCheck,
  Coins,
  Ticket,
  AlertCircle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from './Modal';
import { formatEntry } from '../utils/format';
import styles from './ParticipationModals.module.css';

export function LoginRequiredModal({ onClose }) {
  return (
    <Modal title="Account Required" onClose={onClose}>
      <div className={styles.loginModalContent}>
        <div className={styles.lockIconWrap}>
          <LogIn size={28} />
        </div>
        <p className={styles.copy}>
          Please sign in to your VELOOP Rewards account or register for free to verify your balance and enter this giveaway.
        </p>
        <div className={styles.actions}>
          <Link className="button buttonFull" to="/login">
            <span>Log In to Account</span>
            <ArrowRight size={16} />
          </Link>
          <Link className="button buttonFull buttonSecondary" to="/register">
            <span>Create Free Account</span>
          </Link>
        </div>
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
  const hasEnough = current >= fee.entryAmount;
  const remaining = current - fee.entryAmount;

  return (
    <Modal title="Confirm Your Entry" onClose={onClose}>
      <div className={styles.confirmContent}>
        <p className={styles.copy}>
          You are confirming participation in <strong>{giveaway.prize.name}</strong>.
          Your entry is cryptographically recorded with single-entry fairness.
        </p>

        {/* Receipt Box */}
        <div className={styles.receiptBox}>
          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Required Entry Fee</span>
            <strong className={styles.receiptValRed}>
              - {formatEntry(fee.entryAmount, fee.entryCurrency)}
            </strong>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Current Wallet Balance</span>
            <span className={styles.receiptVal}>
              {formatEntry(current, fee.entryCurrency)}
            </span>
          </div>

          <div className={styles.receiptDivider} />

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Estimated Balance After Entry</span>
            <strong className={hasEnough ? styles.receiptValGreen : styles.receiptValRed}>
              {hasEnough
                ? formatEntry(remaining, fee.entryCurrency)
                : 'Insufficient Funds'}
            </strong>
          </div>
        </div>

        {/* Status validation message */}
        <div
          className={`${styles.validationMessage} ${
            hasEnough ? styles.goodMessage : styles.warnMessage
          }`}
        >
          {hasEnough ? (
            <>
              <CheckCircle2 size={16} />
              <span>Sufficient balance verified. Final validation runs on submission.</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} />
              <span>
                You need {formatEntry(fee.entryAmount - current, fee.entryCurrency)} more to enter.
              </span>
            </>
          )}
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.trustNote}>
          <ShieldCheck size={14} className={styles.shieldIcon} />
          <span>Idempotent entry — no double deductions.</span>
        </div>

        <button
          type="button"
          className="button buttonFull buttonLarge"
          disabled={busy || !hasEnough}
          onClick={onConfirm}
        >
          {busy
            ? 'Validating & Recording Entry...'
            : `Confirm & Join for ${formatEntry(fee.entryAmount, fee.entryCurrency)}`}
        </button>
      </div>
    </Modal>
  );
}

export function JoinSuccessModal({ entry, onClose }) {
  return (
    <Modal title="Entry Confirmed!" onClose={onClose}>
      <div className={styles.successContent}>
        <div className={styles.celebrateIcon}>
          <PartyPopper size={36} />
        </div>

        <h3 className={styles.successHeading}>You're In the Draw!</h3>

        <p className={styles.copy}>
          Your participation entry for{' '}
          <strong>{formatEntry(entry.amount, entry.currency)}</strong> was successfully
          logged. When the timer expires, the winner draw will be finalized.
        </p>

        <div className={styles.ticketPill}>
          <Ticket size={18} className={styles.ticketIcon} />
          <span>Status: Verified & Active</span>
        </div>

        <button type="button" className="button buttonFull" onClick={onClose}>
          <span>View My Entry</span>
          <CheckCircle2 size={16} />
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
    ? [
        { name: 'email', label: 'Delivery Email Address', type: 'email', placeholder: 'your-email@example.com' },
      ]
    : [
        { name: 'fullName', label: 'Full Legal Name', type: 'text', placeholder: 'Enter recipient name' },
        { name: 'phone', label: 'Contact Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
        { name: 'address', label: 'Complete Street Address', type: 'text', placeholder: 'House/Flat No, Street, Landmark' },
        { name: 'city', label: 'City', type: 'text', placeholder: 'City name' },
        { name: 'state', label: 'State / Province', type: 'text', placeholder: 'State name' },
        { name: 'pinCode', label: 'PIN / Postal Code', type: 'text', placeholder: '6-digit PIN code' },
      ];

  return (
    <Modal
      title={isEmail ? 'Claim Digital Voucher' : 'Claim Physical Reward'}
      onClose={onClose}
    >
      <div className={styles.claimWrap}>
        <div className={styles.prizeClaimBadge}>
          <Package size={18} className={styles.claimIcon} />
          <span>Winner: {giveaway.prize.name}</span>
        </div>

        <p className={styles.copy}>
          Congratulations! Please provide your delivery details below. This information is
          strictly encrypted and used solely for prize dispatch.
        </p>

        <form onSubmit={submit} className={styles.claimForm}>
          {fields.map(({ name, label, type, placeholder }) => (
            <label key={name} className={styles.fieldLabel}>
              <span>{label}</span>
              <input
                required
                type={type}
                placeholder={placeholder}
                value={form[name] || ''}
                className={styles.fieldInput}
                onChange={(event) =>
                  setForm({ ...form, [name]: event.target.value })
                }
              />
            </label>
          ))}

          <button
            type="submit"
            className="button buttonFull buttonLarge"
            disabled={busy}
          >
            {busy ? 'Securing Claim Submission...' : 'Confirm & Submit Prize Claim'}
          </button>
        </form>
      </div>
    </Modal>
  );
}
