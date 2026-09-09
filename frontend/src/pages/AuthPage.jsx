import { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ticketArt from '../assets/images/ticket-hand.png';
import styles from './AuthPage.module.css';

export function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate(location.state?.from || '/giveaways');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const fillDemoAccount = () => {
    setForm({
      name: 'Demo Member',
      email: 'member@velop.demo',
      password: 'DemoPass123',
    });
    setError('');
  };

  return (
    <section className={styles.wrap}>
      {/* Left Showcase Banner */}
      <div className={styles.showcase}>
        <div className={styles.ambientGlow} />

        <div className={styles.showcaseTop}>
          <div className={styles.badge}>
            <Sparkles size={14} className={styles.goldIcon} />
            <span>VELOOP REWARDS ECOSYSTEM</span>
          </div>
          <h1 className={styles.showcaseHeading}>
            Rewards are better when the rules are clear.
          </h1>
          <p className={styles.showcaseSub}>
            Join a verified platform where balances are protected, entries are single-record fair, and winner draws are cryptographically verifiable.
          </p>
        </div>

        {/* Feature List */}
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>Single-Entry Integrity</strong>
              <p>One verified entry per event ensures true participant odds.</p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Lock size={18} />
            </div>
            <div>
              <strong>Encrypted Privacy</strong>
              <p>Identities are masked on public boards. Shipping data is private.</p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Gift size={18} />
            </div>
            <div>
              <strong>Instant Digital & Hardware Rewards</strong>
              <p>Amazon gift cards and flagship electronics direct to winners.</p>
            </div>
          </div>
        </div>

        {/* Art Orb */}
        <div className={styles.artOrb}>
          <img src={ticketArt} alt="VELOOP verified entry ticket" />
        </div>
      </div>

      {/* Right Form Card */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <div className={styles.brandHeader}>
            <div className={styles.mark}>VR</div>
            <span className={styles.brandName}>VELOOP REWARDS</span>
          </div>

          {/* Mode Switch Tabs */}
          <div className={styles.modeTabs}>
            <Link
              to="/login"
              className={`${styles.modeTab} ${!isRegister ? styles.activeModeTab : ''}`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={`${styles.modeTab} ${isRegister ? styles.activeModeTab : ''}`}
            >
              Create Account
            </Link>
          </div>

          <div className={styles.titleGroup}>
            <h2>
              {isRegister
                ? 'Join VELOOP Rewards'
                : 'Welcome Back'}
            </h2>
            <p>
              {isRegister
                ? 'Create your account to start collecting entries and claiming rewards.'
                : 'Access your rewards wallet, active entries, and prize status.'}
            </p>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <span>{error}</span>
            </div>
          )}

          <form className={styles.form} onSubmit={submit}>
            {isRegister && (
              <label className={styles.fieldLabel}>
                <span>Full Name</span>
                <input
                  required
                  minLength="2"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  value={form.name}
                  className={styles.input}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>
            )}

            <label className={styles.fieldLabel}>
              <span>Email Address</span>
              <input
                required
                type="email"
                autoComplete="email"
                placeholder="member@velop.demo"
                value={form.email}
                className={styles.input}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>

            <label className={styles.fieldLabel}>
              <span>Password</span>
              <div className={styles.passwordWrap}>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  minLength="10"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder="••••••••••••"
                  value={form.password}
                  className={styles.input}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
                <button
                  type="button"
                  className={styles.toggleVisibility}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <small className={styles.passwordHint}>
                At least 10 characters with mixed letters and numbers.
              </small>
            </label>

            <button
              type="submit"
              className="button buttonFull buttonLarge"
              disabled={busy}
            >
              {busy
                ? 'Verifying Credentials...'
                : isRegister
                  ? 'Create VELOOP Account'
                  : 'Sign In to Account'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick 1-click Demo Fill */}
          <div className={styles.demoBox}>
            <div className={styles.demoHead}>
              <KeyRound size={14} className={styles.keyIcon} />
              <span>Developer Quick Testing</span>
            </div>
            <p>Seeded test credentials: <strong>member@velop.demo</strong></p>
            <button
              type="button"
              className={styles.fillBtn}
              onClick={fillDemoAccount}
            >
              Autofill Demo Account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
