import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, MessageSquare, Loader2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHero from '../components/layout/PageHero';
import { useAuth } from '../contexts/AuthContext';
import type { Mentorship as MentorshipRow } from '../types';
import { listMentorshipsForUser, createMentorshipRequest, updateMentorshipStatus } from '../services/platformFirestore';
import { useNavigate } from 'react-router-dom';
import { getUserById } from '../services/firebaseFirestore';

const Mentorship: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<MentorshipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mentorId, setMentorId] = useState('');
  const [topic, setTopic] = useState('');
  const [names, setNames] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await listMentorshipsForUser(user.id);
      setRows(list);
      const nm: Record<string, string> = {};
      for (const m of list) {
        const other = m.mentorId === user.id ? m.menteeId : m.mentorId;
        if (!nm[other]) {
          const u = await getUserById(other);
          nm[other] = u?.name || other;
        }
      }
      setNames(nm);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSendRequest = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!user) {
      navigate('/login');
      return;
    }

    const mid = mentorId.trim();
    const top = topic.trim();
    if (!mid || !top) {
      setFormError('Enter the mentor’s profile ID (from their /alumni/… URL) and describe your goals.');
      return;
    }
    if (mid === user.id) {
      setFormError('You cannot send a mentorship request to yourself.');
      return;
    }

    setSubmitting(true);
    try {
      const mentor = await getUserById(mid);
      if (!mentor) {
        setFormError(
          'No account matches that ID. Open the alumni directory, open their profile, and copy only the ID from the address bar after /alumni/'
        );
        return;
      }
      if (mentor.role !== 'alumni') {
        setFormError('Mentorship requests can only be sent to users with the alumni role.');
        return;
      }
      if (mentor.openToMentoring === false) {
        setFormError('This alum is not accepting mentorship requests right now.');
        return;
      }

      await createMentorshipRequest({
        mentorId: mid,
        menteeId: user.id,
        topic: top,
      });
      setMentorId('');
      setTopic('');
      setFormSuccess('Request sent. The alum will get a notification and can accept or decline here.');
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: string }).code) : '';
      if (code === 'permission-denied' || msg.toLowerCase().includes('permission')) {
        setFormError(
          'Permission denied. Deploy the latest Firestore rules (firebase deploy --only firestore:rules) and try again.'
        );
      } else {
        setFormError(msg || 'Could not send request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const respond = async (id: string, status: 'accepted' | 'declined') => {
    try {
      await updateMentorshipStatus(id, status);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const toggleOpen = async () => {
    if (!user || !updateProfile) return;
    const isOpen = user.openToMentoring !== false;
    await updateProfile({ openToMentoring: !isOpen });
  };

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Guidance"
        title="Mentorship"
        titleGradientPart="Mentor"
        subtitle={
          <>
            Find someone in the{' '}
            <Link to="/alumni" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
              alumni directory
            </Link>
            , open their profile, then paste the ID from the URL:{' '}
            <code className="text-xs sm:text-sm app-tag font-mono">/alumni/THIS_ID</code>
          </>
        }
      />

      <section className="py-10 px-4 container mx-auto max-w-4xl space-y-8">
        <Card variant="primary" className="p-5 border-violet-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[var(--fg)]">Mentorship hub</p>
            <p className="text-sm text-[var(--muted)]">
              View requests, accept or decline, and open active chat threads in one place.
            </p>
          </div>
          <Button variant="primary" className="rounded-xl w-full sm:w-auto" to="/mentorship/hub">
            Open hub
          </Button>
        </Card>

        {user?.role === 'alumni' && (
          <Card variant="secondary" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-[var(--fg)]">Open to mentoring</p>
              <p className="text-sm text-[var(--muted)]">Let others know you are willing to help.</p>
            </div>
            <Button variant={user.openToMentoring !== false ? 'primary' : 'secondary'} onClick={toggleOpen}>
              {user.openToMentoring !== false ? 'Enabled' : 'Disabled'}
            </Button>
          </Card>
        )}

        <Card variant="primary" className="p-6">
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
            <UserPlus size={20} />
            New request
          </h2>
          {!user ? (
            <p className="text-[var(--muted)]">
              <Link to="/login" className="text-[var(--primary)] underline">
                Sign in
              </Link>{' '}
              to request mentorship.
            </p>
          ) : (
            <form className="space-y-3 max-w-md" onSubmit={(e) => void handleSendRequest(e)}>
              {formError && (
                <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-900 dark:text-emerald-100">
                  {formSuccess}
                </div>
              )}
              <div>
                <label htmlFor="mentor-id" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Mentor profile ID
                </label>
                <input
                  id="mentor-id"
                  required
                  disabled={submitting}
                  className="app-input disabled:opacity-60"
                  placeholder="e.g. Kj8s… (from /alumni/…)"
                  value={mentorId}
                  onChange={(e) => setMentorId(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="topic" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Goals / topic
                </label>
                <input
                  id="topic"
                  required
                  disabled={submitting}
                  className="app-input disabled:opacity-60"
                  placeholder="What you would like help with"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" disabled={submitting} className="min-w-[140px]">
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Sending…
                  </>
                ) : (
                  'Send request'
                )}
              </Button>
            </form>
          )}
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
            <MessageSquare size={20} />
            <Link to="/mentorship/hub" className="hover:underline">
              My mentorships
            </Link>
          </h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            For a full list, use the <Link to="/mentorship/hub" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">mentorship hub</Link>. Below is a quick
            summary. Mentors: use Accept / Decline, then open the thread only when the request is accepted.
          </p>
          {loading ? (
            <p className="text-[var(--muted)]">Loading…</p>
          ) : !user ? null : rows.length === 0 ? (
            <p className="text-[var(--muted)]">No mentorship threads yet.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((m) => {
                const other = m.mentorId === user!.id ? m.menteeId : m.mentorId;
                const isMentor = m.mentorId === user!.id;
                return (
                  <Card key={m.id} variant="primary" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[var(--fg)]">{m.topic}</p>
                      <p className="text-sm text-[var(--muted)]">
                        With {names[other] || other} · {m.status}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {isMentor && m.status === 'pending' && (
                        <>
                          <Button size="sm" variant="primary" onClick={() => void respond(m.id, 'accepted')}>
                            Accept
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => void respond(m.id, 'declined')}>
                            Decline
                          </Button>
                        </>
                      )}
                      {(m.status === 'accepted' || m.status === 'completed') && (
                        <Button size="sm" variant="secondary" className="rounded-xl" to={`/mentorship/${m.id}`}>
                          Open chat
                        </Button>
                      )}
                      {m.status === 'pending' && (
                        <span className="text-xs text-[var(--muted)] self-center">Chat unlocks after acceptance</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Mentorship;
