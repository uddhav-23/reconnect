import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  KeyRound,
  Lock,
  Shield,
  Users,
  UserCircle,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EditProfileForm from '../components/forms/EditProfileForm';
import { useAuth } from '../contexts/AuthContext';
import { getAllConnections, getUserById } from '../services/firebaseFirestore';
import { getNotifications } from '../services/platformFirestore';
import { resetPassword } from '../services/firebaseAuth';
import type { AppNotification, Connection, User } from '../types';

type Section = 'activity' | 'connections' | 'privacy' | 'security' | 'profile';

const nav: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'activity', label: 'Recent activity', icon: Activity },
  { id: 'connections', label: 'Connections', icon: Users },
  { id: 'privacy', label: 'Privacy & security', icon: Shield },
  { id: 'security', label: 'Password', icon: KeyRound },
  { id: 'profile', label: 'Profile', icon: UserCircle },
];

const linkSecondaryBtn =
  'inline-flex items-center justify-center h-9 px-3 text-sm rounded-md font-medium transition-colors border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:bg-neutral-100 dark:hover:bg-neutral-700 shadow-subtle';

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

const AccountSettings: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Section | null;

  const [section, setSection] = useState<Section>(() =>
    tabParam && nav.some((n) => n.id === tabParam) ? tabParam : 'activity'
  );
  const [showEditProfile, setShowEditProfile] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const [connections, setConnections] = useState<
    { connection: Connection; peer: User | null; peerId: string }[]
  >([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  const [pw, setPw] = useState({ old: '', next: '', confirm: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const [privacyBusy, setPrivacyBusy] = useState<'mentorship' | 'visibility' | null>(null);

  useEffect(() => {
    if (tabParam && nav.some((n) => n.id === tabParam)) {
      setSection(tabParam);
    }
  }, [tabParam]);

  const goSection = (id: Section) => {
    setSection(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  const loadActivity = useCallback(async () => {
    if (!user) return;
    setLoadingActivity(true);
    try {
      const list = await getNotifications(user.id);
      setNotifications(list.slice(0, 40));
    } catch (e) {
      console.error(e);
      setNotifications([]);
    } finally {
      setLoadingActivity(false);
    }
  }, [user]);

  const loadConnections = useCallback(async () => {
    if (!user) return;
    setLoadingConnections(true);
    try {
      const all = await getAllConnections(user.id);
      const accepted = all.filter((c) => c.status === 'accepted');
      const rows: { connection: Connection; peer: User | null; peerId: string }[] = [];
      for (const c of accepted) {
        const peerId = c.requesterId === user.id ? c.receiverId : c.requesterId;
        const peer = await getUserById(peerId);
        rows.push({ connection: c, peer, peerId });
      }
      rows.sort(
        (a, b) =>
          new Date(b.connection.createdAt).getTime() - new Date(a.connection.createdAt).getTime()
      );
      setConnections(rows);
    } catch (e) {
      console.error(e);
      setConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  }, [user]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  useEffect(() => {
    if (section === 'connections') void loadConnections();
  }, [section, loadConnections]);

  if (!user) {
    return null;
  }

  const dashboardPath = `/dashboard/${user.role}`;
  const profilePath = user.role === 'alumni' ? `/alumni/${user.id}` : null;

  const isAlumni = user.role === 'alumni';

  return (
    <>
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur">
          <div className="container mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft size={16} />
                Back
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-[var(--fg)]">Settings</h1>
                <p className="text-sm text-[var(--muted)]">Account, connections, and privacy</p>
              </div>
            </div>
            <Link to={dashboardPath} className={linkSecondaryBtn}>
              Dashboard
            </Link>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <nav className="lg:w-56 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {nav.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => goSection(id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium whitespace-nowrap transition-colors ${
                    section === id
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--muted)] hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-[var(--fg)]'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex-1 min-w-0 space-y-6">
              {section === 'activity' && (
                <Card variant="primary" className="p-6">
                  <h2 className="text-lg font-semibold text-[var(--fg)] mb-1">Recent activity</h2>
                  <p className="text-sm text-[var(--muted)] mb-4">
                    Notifications and updates from messages, connections, mentorship, and more.
                  </p>
                  {loadingActivity ? (
                    <div className="flex items-center gap-2 text-[var(--muted)] py-8">
                      <Loader2 className="animate-spin" size={20} />
                      Loading…
                    </div>
                  ) : notifications.length === 0 ? (
                    <p className="text-sm text-[var(--muted)] py-6">No activity yet.</p>
                  ) : (
                    <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-md overflow-hidden">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className={`px-4 py-3 text-sm ${n.read ? 'bg-[var(--card)]' : 'bg-neutral-50 dark:bg-neutral-900/40'}`}
                        >
                          <div className="flex justify-between gap-2 flex-wrap">
                            <span className="font-medium text-[var(--fg)]">{n.title}</span>
                            <span className="text-xs text-[var(--muted)]">{formatWhen(n.createdAt)}</span>
                          </div>
                          {n.body && <p className="text-[var(--muted)] mt-1">{n.body}</p>}
                          {n.link && (
                            <Link
                              to={n.link}
                              className="inline-block mt-2 text-xs text-[var(--primary)] underline"
                            >
                              Open
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              )}

              {section === 'connections' && (
                <Card variant="primary" className="p-6">
                  <h2 className="text-lg font-semibold text-[var(--fg)] mb-1">Your connections</h2>
                  <p className="text-sm text-[var(--muted)] mb-4">
                    People you are connected with (accepted requests).
                  </p>
                  {loadingConnections ? (
                    <div className="flex items-center gap-2 text-[var(--muted)] py-8">
                      <Loader2 className="animate-spin" size={20} />
                      Loading…
                    </div>
                  ) : connections.length === 0 ? (
                    <p className="text-sm text-[var(--muted)] py-6">
                      No connections yet. Discover alumni in the directory and send a connection
                      request.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {connections.map(({ peer, peerId, connection }) => (
                        <li
                          key={connection.id}
                          className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-md border border-[var(--border)] bg-[var(--card)]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 font-semibold text-[var(--fg)]">
                              {(peer?.name || '?')
                                .split(' ')
                                .map((x) => x[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--fg)] truncate">
                                {peer?.name || 'Member'}
                              </p>
                              <p className="text-xs text-[var(--muted)] capitalize">
                                {peer?.role || 'user'} · Since {formatWhen(connection.createdAt)}
                              </p>
                            </div>
                          </div>
                          {peer?.role === 'alumni' ? (
                            <Link to={`/alumni/${peerId}`} className={linkSecondaryBtn}>
                              View profile
                            </Link>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">Profile unavailable</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              )}

              {section === 'privacy' && (
                <Card variant="primary" className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--fg)] mb-1">Privacy & security</h2>
                    <p className="text-sm text-[var(--muted)]">
                      Control how you appear to others. Full policies:
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <Link
                        to="/privacy"
                        className="text-sm text-[var(--primary)] underline inline-flex items-center gap-1"
                      >
                        Privacy policy
                      </Link>
                      <Link
                        to="/terms"
                        className="text-sm text-[var(--primary)] underline inline-flex items-center gap-1"
                      >
                        Terms of use
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-6">
                    <h3 className="text-sm font-semibold text-[var(--fg)] mb-3 flex items-center gap-2">
                      <Lock size={16} />
                      Profile visibility
                    </h3>
                    <p className="text-sm text-[var(--muted)] mb-3">
                      When your profile is private, email, phone, address, and social links are hidden
                      except for accepted connections.
                    </p>
                    <div className="flex items-center justify-between gap-4 max-w-md">
                      <span className="text-sm text-[var(--fg)]">Private profile</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={user.profileVisibility === 'private'}
                        disabled={privacyBusy === 'visibility'}
                        onClick={async () => {
                          const next = user.profileVisibility === 'private' ? 'public' : 'private';
                          try {
                            setPrivacyBusy('visibility');
                            await updateProfile({ profileVisibility: next });
                          } catch (e: unknown) {
                            alert(e instanceof Error ? e.message : 'Could not update');
                          } finally {
                            setPrivacyBusy(null);
                          }
                        }}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-[var(--border)] transition-colors ${
                          user.profileVisibility === 'private'
                            ? 'bg-emerald-600'
                            : 'bg-neutral-400 dark:bg-neutral-600'
                        } disabled:opacity-50`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transition ${
                            user.profileVisibility === 'private' ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {isAlumni && (
                    <div className="border-t border-[var(--border)] pt-6">
                      <h3 className="text-sm font-semibold text-[var(--fg)] mb-3 flex items-center gap-2">
                        <GraduationCap size={16} />
                        Mentorship
                      </h3>
                      <p className="text-sm text-[var(--muted)] mb-3">
                        When off, you will not receive mentorship requests; your public profile shows
                        &quot;Not ready for mentorship&quot;.
                      </p>
                      <div className="flex items-center justify-between gap-4 max-w-md">
                        <span className="text-sm text-[var(--fg)]">Open to mentorship</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={user.openToMentoring !== false}
                          disabled={privacyBusy === 'mentorship'}
                          onClick={async () => {
                            const isOpen = user.openToMentoring !== false;
                            try {
                              setPrivacyBusy('mentorship');
                              await updateProfile({ openToMentoring: !isOpen });
                            } catch (e: unknown) {
                              alert(e instanceof Error ? e.message : 'Could not update');
                            } finally {
                              setPrivacyBusy(null);
                            }
                          }}
                          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-[var(--border)] transition-colors ${
                            user.openToMentoring !== false
                              ? 'bg-emerald-600'
                              : 'bg-neutral-400 dark:bg-neutral-600'
                          } disabled:opacity-50`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transition ${
                              user.openToMentoring !== false ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {profilePath && (
                    <p className="text-sm text-[var(--muted)]">
                      You can also adjust options on{' '}
                      <Link to={profilePath} className="text-[var(--primary)] underline">
                        your public profile
                      </Link>
                      .
                    </p>
                  )}
                </Card>
              )}

              {section === 'security' && (
                <Card variant="primary" className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--fg)] mb-1">Change password</h2>
                    <p className="text-sm text-[var(--muted)] mb-4">
                      Use a strong password you do not reuse elsewhere.
                    </p>
                    <form
                      className="space-y-3 max-w-md"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (pw.next !== pw.confirm) {
                          alert('New passwords do not match.');
                          return;
                        }
                        setPwBusy(true);
                        try {
                          await changePassword(pw.old, pw.next);
                          setPw({ old: '', next: '', confirm: '' });
                          alert('Password updated.');
                        } catch (err: unknown) {
                          alert(err instanceof Error ? err.message : 'Could not change password');
                        } finally {
                          setPwBusy(false);
                        }
                      }}
                    >
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                          Current password
                        </label>
                        <input
                          type="password"
                          autoComplete="current-password"
                          value={pw.old}
                          onChange={(e) => setPw({ ...pw, old: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                          New password
                        </label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={pw.next}
                          onChange={(e) => setPw({ ...pw, next: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] text-sm"
                          required
                          minLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                          Confirm new password
                        </label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={pw.confirm}
                          onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] text-sm"
                          required
                        />
                      </div>
                      <Button type="submit" variant="primary" disabled={pwBusy}>
                        {pwBusy ? 'Updating…' : 'Update password'}
                      </Button>
                    </form>
                  </div>

                  <div className="border-t border-[var(--border)] pt-6">
                    <h3 className="text-sm font-semibold text-[var(--fg)] mb-1">Forgot password?</h3>
                    <p className="text-sm text-[var(--muted)] mb-3">
                      We will email a reset link to <strong>{user.email}</strong>.
                    </p>
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={resetBusy}
                      onClick={async () => {
                        setResetBusy(true);
                        try {
                          await resetPassword(user.email);
                          alert('Check your inbox for a password reset link.');
                        } catch (err: unknown) {
                          alert(err instanceof Error ? err.message : 'Could not send email');
                        } finally {
                          setResetBusy(false);
                        }
                      }}
                    >
                      {resetBusy ? 'Sending…' : 'Send reset email'}
                    </Button>
                  </div>
                </Card>
              )}

              {section === 'profile' && (
                <Card variant="primary" className="p-6">
                  <h2 className="text-lg font-semibold text-[var(--fg)] mb-1">Profile & account</h2>
                  <p className="text-sm text-[var(--muted)] mb-6">
                    Update your name, bio, contact details, skills, and social links.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" onClick={() => setShowEditProfile(true)}>
                      Update profile
                    </Button>
                    {profilePath && (
                      <Link to={profilePath} className={linkSecondaryBtn}>
                        View public profile
                      </Link>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditProfile && <EditProfileForm onClose={() => setShowEditProfile(false)} />}
    </>
  );
};

export default AccountSettings;
