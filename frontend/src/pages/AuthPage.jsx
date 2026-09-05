import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ticketArt from '../assets/images/ticket-hand.png';
import styles from './AuthPage.module.css';

export function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate(location.state?.from || '/giveaways');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={styles.wrap}>
      <div className={styles.art}>
        <div className={styles.badge}>
          <LockKeyhole size={17} /> VELOOP Rewards
        </div>
        <h1>Rewards are better when the rules are clear.</h1>
        <p>
          Your balance and participation are confirmed by the service — never
          just by what a browser displays.
        </p>
        <div className={styles.orb}>
          <img src={ticketArt} alt="" />
        </div>
      </div>
      <div className={styles.formSide}>
        <form className={styles.form} onSubmit={submit}>
          <Link className={styles.logo} to="/giveaways">
            VELOOP <span>REWARDS</span>
          </Link>
          <div className="eyebrow">
            {isRegister ? 'Create account' : 'Welcome back'}
          </div>
          <h2>
            {isRegister
              ? 'Start participating with confidence.'
              : 'Sign in to your rewards.'}
          </h2>
          <p>
            {isRegister
              ? 'Use the development demo data only for local testing.'
              : 'Use a seeded development account or your own registered account.'}
          </p>
          {error && <div className={styles.error}>{error}</div>}
          {isRegister && (
            <label>
              Full name
              <input
                required
                minLength="2"
                autoComplete="off"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              minLength="10"
              autoComplete="off"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
            <small>
              At least 10 characters with upper/lowercase letters and a number.
            </small>
          </label>
          <button className="button buttonFull" disabled={busy}>
            {busy
              ? 'Please wait…'
              : isRegister
                ? 'Create VELOOP account'
                : 'Log in'}{' '}
            <ArrowRight size={16} />
          </button>
          <div className={styles.switch}>
            {isRegister ? 'Already have an account?' : 'New to VELOOP?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Log in' : 'Create an account'}
            </Link>
          </div>
          <div className={styles.demo}>
            Development seed: <strong>member@velop.demo</strong> /{' '}
            <strong>DemoPass123</strong>
          </div>
        </form>
      </div>
    </section>
  );
}
