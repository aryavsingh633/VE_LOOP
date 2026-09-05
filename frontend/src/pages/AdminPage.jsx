import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  ClipboardList,
  Gift,
  Plus,
  ShieldCheck,
  Users,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminService } from '../services/adminService';
import { GiveawayLoader } from '../components/GiveawayLoader';
import { ErrorState } from '../components/StateViews';
import { formatDate } from '../utils/format';
import styles from './AdminPage.module.css';

function displayPrize(prize) {
  if (typeof prize === 'string') return prize;
  return prize?.name || '—';
}

function rowKey(row, index) {
  const identifier = row?.id ?? row?._id ?? row?.userId?._id ?? row?.userId?.id;
  return `${identifier == null ? 'row' : String(identifier)}-${index}`;
}

export function AdminPage() {
  const { user, ready, isAdmin } = useAuth();
  const location = useLocation();
  const [dashboard, setDashboard] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const requestId = useRef(0);

  const pathSection = location.pathname.split('/admin/')[1]?.split('/')[0];
  const isCreate =
    pathSection === 'giveaways' && location.pathname.endsWith('/create');
  const currentSection = [
    'giveaways',
    'participants',
    'winners',
    'claims',
    'fraud',
    'audit-logs',
  ].includes(pathSection)
    ? pathSection
    : 'overview';
  const sectionLoaders = {
    overview: adminService.giveaways,
    giveaways: adminService.giveaways,
    participants: adminService.participants,
    winners: adminService.winners,
    claims: adminService.claims,
    fraud: adminService.fraudEvents,
    'audit-logs': adminService.auditLogs,
  };

  const load = useCallback(async () => {
    if (!isAdmin) return;
    const activeRequest = ++requestId.current;
    setError(false);
    setLoading(true);
    setSectionData(null);
    try {
      const [summary, data] = await Promise.all([
        adminService.dashboard(),
        sectionLoaders[currentSection](),
      ]);
      if (activeRequest !== requestId.current) return;
      setDashboard(summary);
      setSectionData(data);
    } catch (err) {
      if (activeRequest !== requestId.current) return;
      setError(true);
    } finally {
      if (activeRequest === requestId.current) setLoading(false);
    }
  }, [isAdmin, currentSection]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const finalize = async (id) => {
    setNotice('');
    setBusy(true);
    try {
      await adminService.finalizeWinners(id);
      setNotice('Winner selection completed.');
      load();
    } catch (requestError) {
      setNotice(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const updateClaimStatus = async (claimId, status) => {
    try {
      await adminService.updateClaim(claimId, status);
      setNotice(`Claim status updated to ${status}`);
      load();
    } catch (requestError) {
      setNotice(requestError.message);
    }
  };

  if (!ready) return <GiveawayLoader />;
  if (!user || !isAdmin)
    return (
      <section className={styles.denied}>
        <ShieldCheck />
        <h1>Admin access only</h1>
        <p>
          This protected area is available to authorized VELOOP administrators.
        </p>
        <Link className="button" to="/giveaways">
          Return to giveaways
        </Link>
      </section>
    );
  if (isCreate) {
    return (
      <section className="section">
        <div className={`container ${styles.createContainer}`}>
          <CreateGiveaway
            onCreated={() => {
              setNotice('Giveaway created.');
              window.history.back();
              load();
            }}
          />
        </div>
      </section>
    );
  }
  if (error)
    return (
      <ErrorState title="We couldn't load the admin workspace." action={load} />
    );
  if (loading || !dashboard || !sectionData)
    return <GiveawayLoader label="Preparing admin workspace…" />;

  const renderGiveawaysTable = () => (
    <section className={styles.table}>
      <div className={styles.tableHead}>
        <h2>Giveaway configuration</h2>
        <span>Use completed events only for winner selection.</span>
      </div>
      {sectionData.items?.map((giveaway, index) => (
        <article key={rowKey(giveaway, index)}>
          <div>
            <strong>{displayPrize(giveaway.prize) || 'Unnamed prize'}</strong>
            <span>
              {giveaway.slug} · {giveaway.status}
            </span>
          </div>
          <span>
            {giveaway.prize?.entryAmount ?? 0}{' '}
            {giveaway.prize?.entryCurrency || ''}
          </span>
          <span>{giveaway.participantCount} entries</span>
          <button
            className="button buttonSmall"
            disabled={giveaway.status !== 'ENDED' || busy}
            onClick={() => finalize(giveaway.id)}
          >
            Finalize winners
          </button>
        </article>
      ))}
    </section>
  );

  const renderParticipantsTable = () => (
    <section className={styles.table}>
      <div className={styles.tableHead}>
        <h2>Recent participants</h2>
        <span>All user entries across giveaways</span>
      </div>
      <div className={styles.tableGrid}>
        <div
          className={styles.tableHeader}
          style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}
        >
          <span>User</span>
          <span>Giveaway</span>
          <span>Prize</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Date</span>
        </div>
        {sectionData.items?.map((participant, index) => (
          <div
            key={rowKey(participant, index)}
            className={styles.tableRow}
            style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}
          >
            <span>
              <strong>{participant.user?.name}</strong> (
              {participant.user?.publicId})
            </span>
            <span>{participant.giveaway}</span>
            <span>{displayPrize(participant.prize)}</span>
            <span>
              {participant.entryAmount} {participant.entryCurrency}
            </span>
            <span>{participant.status}</span>
            <span>{formatDate(participant.joinedAt)}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderWinnersTable = () => (
    <section className={styles.table}>
      <div className={styles.tableHead}>
        <h2>All winners</h2>
        <span>Winners across all giveaways</span>
      </div>
      <div className={styles.tableGrid}>
        <div
          className={styles.tableHeader}
          style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
        >
          <span>User</span>
          <span>Prize</span>
          <span>Giveaway</span>
          <span>Status</span>
          <span>Date</span>
        </div>
        {sectionData.items?.map((winner, index) => (
          <div
            key={rowKey(winner, index)}
            className={styles.tableRow}
            style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
          >
            <span>
              <strong>{winner.userId?.name}</strong> ({winner.userId?.publicId})
            </span>
            <span>{displayPrize(winner.prizeId)}</span>
            <span>{winner.giveawayId?.title}</span>
            <span>
              <span
                className={`badge badge-${String(winner.status || 'selected').toLowerCase()}`}
              >
                {winner.status || 'SELECTED'}
              </span>
            </span>
            <span>{formatDate(winner.selectedAt)}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderClaimsTable = () => (
    <section className={styles.table}>
      <div className={styles.tableHead}>
        <h2>Prize claims</h2>
        <span>All prize claim requests and statuses</span>
      </div>
      <div className={styles.tableGrid}>
        <div
          className={styles.tableHeader}
          style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
        >
          <span>User</span>
          <span>Prize</span>
          <span>Status</span>
          <span>Submitted</span>
          <span>Actions</span>
        </div>
        {sectionData.items?.map((claim, index) => (
          <div
            key={rowKey(claim, index)}
            className={styles.tableRow}
            style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
          >
            <span>
              <strong>{claim.userId?.name}</strong> ({claim.userId?.publicId})
            </span>
            <span>{displayPrize(claim.prizeId)}</span>
            <span>
              <span
                className={`badge badge-${String(claim.status || 'not_submitted').toLowerCase()}`}
              >
                {claim.status || 'NOT_SUBMITTED'}
              </span>
            </span>
            <span>
              {claim.submittedAt ? formatDate(claim.submittedAt) : '—'}
            </span>
            <span className={styles.actions}>
              {claim.status !== 'COMPLETED' && claim.status !== 'EXPIRED' && (
                <>
                  {claim.status !== 'PROCESSING' && (
                    <button
                      className="button buttonSmall"
                      onClick={() => updateClaimStatus(claim._id, 'PROCESSING')}
                    >
                      <Clock size={14} /> Process
                    </button>
                  )}
                  <button
                    className="button buttonSmall"
                    onClick={() => updateClaimStatus(claim._id, 'COMPLETED')}
                  >
                    <Check size={14} /> Complete
                  </button>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderFraudTable = () => (
    <section className={styles.table}>
      <div className={styles.tableHead}>
        <h2>Fraud events</h2>
        <span>Suspicious activities and security flags</span>
      </div>
      <div className={styles.tableGrid}>
        <div
          className={styles.tableHeader}
          style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
        >
          <span>User</span>
          <span>Risk Score</span>
          <span>Signals</span>
          <span>Action</span>
          <span>Date</span>
        </div>
        {sectionData.items?.map((event, index) => (
          <div
            key={rowKey(event, index)}
            className={styles.tableRow}
            style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
          >
            <span>
              <strong>{event.userId?.name}</strong> (
              {event.userId?.publicId || event.userId?._id})
            </span>
            <span>
              <strong>{event.riskScore}</strong>%
            </span>
            <span className={styles.signals}>
              {event.signals?.join(', ') || '—'}
            </span>
            <span>
              <span
                className={`badge badge-${String(event.action || 'logged').toLowerCase()}`}
              >
                {event.action || 'LOGGED'}
              </span>
            </span>
            <span>{formatDate(event.createdAt)}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderAuditLogsTable = () => (
    <section className={styles.table}>
      <div className={styles.tableHead}>
        <h2>Audit logs</h2>
        <span>System activity and admin actions</span>
      </div>
      <div className={styles.tableGrid}>
        <div className={styles.tableHeader}>
          <span>Action</span>
          <span>Admin</span>
          <span>Resource</span>
          <span>Details</span>
          <span>Time</span>
        </div>
        {sectionData.items?.map((log, index) => (
          <div key={rowKey(log, index)} className={styles.tableRow}>
            <span>
              <strong>{log.action}</strong>
            </span>
            <span>{log.actorId?.name || 'System'}</span>
            <span>
              {log.resourceType}{' '}
              {log.resourceId && `(${String(log.resourceId).slice(0, 8)}...)`}
            </span>
            <span className={styles.metadata}>
              {JSON.stringify(log.metadata || {})}
            </span>
            <span>{formatDate(log.createdAt)}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderSection = () => {
    switch (currentSection) {
      case 'giveaways':
        return renderGiveawaysTable();
      case 'participants':
        return renderParticipantsTable();
      case 'winners':
        return renderWinnersTable();
      case 'claims':
        return renderClaimsTable();
      case 'fraud':
        return renderFraudTable();
      case 'audit-logs':
        return renderAuditLogsTable();
      default:
        return renderGiveawaysTable();
    }
  };

  return (
    <section className="section">
      <div className={`container ${styles.layout}`}>
        <aside className={styles.side}>
          <span>VELOOP CONTROL</span>
          <NavLink to="/admin">Overview</NavLink>
          <nav className={styles.subnav} aria-label="Admin sections">
            <NavLink to="/admin/giveaways">Giveaways</NavLink>
            <NavLink to="/admin/participants">Participants</NavLink>
            <NavLink to="/admin/winners">Winners</NavLink>
            <NavLink to="/admin/claims">Claims</NavLink>
            <NavLink to="/admin/fraud">Fraud events</NavLink>
            <NavLink to="/admin/audit-logs">Audit logs</NavLink>
          </nav>
        </aside>
        <div className={styles.main}>
          <div className={styles.head}>
            <div>
              <div className="eyebrow">Protected admin</div>
              <h1>
                {currentSection === 'overview'
                  ? 'Rewards control center'
                  : currentSection.replaceAll('-', ' ')}
              </h1>
            </div>
            <Link className="button" to="/admin/giveaways/create">
              <Plus size={16} /> New giveaway
            </Link>
          </div>
          {notice && <div className={styles.notice}>{notice}</div>}
          <div className={styles.metrics}>
            <Metric
              icon={Gift}
              value={dashboard.activeGiveaways}
              label="Active giveaways"
            />
            <Metric
              icon={Users}
              value={dashboard.totalParticipants}
              label="Total participants"
            />
            <Metric
              icon={Award}
              value={dashboard.totalWinners}
              label="Total winners"
            />
            <Metric
              icon={AlertTriangle}
              value={dashboard.suspiciousActivities}
              label="Suspicious activities"
            />
          </div>
          {renderSection()}
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, value, label }) {
  return (
    <article>
      <Icon />
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function CreateGiveaway({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    prizeName: '',
    currency: 'VE',
    amount: '100',
    winners: '1',
    startAt: '',
    endAt: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const toIsoDate = (value) => new Date(value).toISOString();

  const submit = async (event) => {
    event.preventDefault();
    const startAt = new Date(form.startAt);
    const endAt = new Date(form.endAt);
    if (
      !form.startAt ||
      !form.endAt ||
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      setError('The end time must be later than the start time.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await adminService.create({
        giveaway: {
          title: form.title,
          slug: form.slug,
          description: form.description,
          startAt: toIsoDate(form.startAt),
          endAt: toIsoDate(form.endAt),
          status: 'UPCOMING',
          rules: [],
          eligibility: [],
        },
        prize: {
          name: form.prizeName,
          description: form.description,
          prizeType: 'DIGITAL',
          claimType: 'EMAIL_ONLY',
        },
        configuration: {
          position: 1,
          entryCurrency: form.currency,
          entryAmount: Number(form.amount),
          winnerCount: Number(form.winners),
        },
      });
      onCreated();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const field = (name, label, type = 'text') => (
    <label>
      {label}
      <input
        required
        type={type}
        value={form[name]}
        onChange={(event) => setForm({ ...form, [name]: event.target.value })}
      />
    </label>
  );

  return (
    <form className={styles.create} onSubmit={submit}>
      <Link to="/admin/giveaways">← Back to giveaways</Link>
      <h1>Create a giveaway</h1>
      <p>
        Prize delivery type and claim method should be reviewed before
        publishing.
      </p>
      {error && <div className={styles.notice}>{error}</div>}
      {field('title', 'Giveaway title')}
      {field('slug', 'URL slug')}
      {field('prizeName', 'Prize name')}
      {field('description', 'Description')}
      {field('startAt', 'Starts at', 'datetime-local')}
      <label>
        Ends at
        <input
          required
          type="datetime-local"
          min={form.startAt || undefined}
          value={form.endAt}
          onChange={(event) => setForm({ ...form, endAt: event.target.value })}
        />
      </label>
      <div className={styles.formRow}>
        <label>
          Currency
          <select
            value={form.currency}
            onChange={(event) =>
              setForm({ ...form, currency: event.target.value })
            }
          >
            <option>VE</option>
            <option>SVE</option>
            <option>TOKEN</option>
          </select>
        </label>
        {field('amount', 'Entry amount', 'number')}
        {field('winners', 'Winner count', 'number')}
      </div>
      <button className="button" disabled={busy}>
        {busy ? 'Creating…' : 'Create giveaway'}
      </button>
    </form>
  );
}
