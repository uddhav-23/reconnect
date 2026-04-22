import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, MessageSquare, UserPlus, Clock, CheckCircle2, XCircle, ChevronRight, Sparkles } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHero from '../components/layout/PageHero';
import { useAuth } from '../contexts/AuthContext';
import type { Mentorship } from '../types';
import { getUserById } from '../services/firebaseFirestore';
import { listMentorshipsForUser, updateMentorshipStatus } from '../services/platformFirestore';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-600 dark:from-violet-400 dark:to-cyan-400 mb-3">
      {children}
    </h2>
  );
}

const MentorshipHub: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Mentorship[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const respond = async (id: string, status: 'accepted' | 'declined') => {
    setBusyId(id);
    try {
      await updateMentorshipStatus(id, status);
      await load();
      if (status === 'accepted') {
        navigate(`/mentorship/${id}`);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not update request');
    } finally {
      setBusyId(null);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const incomingPending = rows.filter((m) => m.mentorId === user.id && m.status === 'pending');
  const outgoingPending = rows.filter((m) => m.menteeId === user.id && m.status === 'pending');
  const active = rows.filter((m) => m.status === 'accepted' || m.status === 'completed');
  const declined = rows.filter((m) => m.status === 'declined');

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Guidance"
        title="Mentorship hub"
        titleGradientPart="Mentorship"
        subtitle={
          <>
            Manage requests, active pairings, and message threads — separate from general{' '}
            <Link to="/messages" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
              direct messages
            </Link>
            .
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2 justify-end">
            <Link to="/mentorship">
              <Button variant="secondary" size="sm" className="rounded-xl gap-2 h-9">
                <UserPlus size={16} />
                New request
              </Button>
            </Link>
          </div>
        }
      />

      <section className="app-page-section">
        <div className="container mx-auto max-w-4xl space-y-10 px-4">
          <div className="app-surface border-violet-500/15 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
              <Sparkles size={28} strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-[var(--fg)] text-lg">Your mentorship workspace</p>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Accept or decline incoming requests here. After acceptance, open the thread to chat — messaging unlocks only for
                active mentorships.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-[var(--muted)] text-center py-12">Loading…</p>
          ) : (
            <>
              {incomingPending.length > 0 && (
                <div>
                  <SectionTitle>Needs your response (you are the mentor)</SectionTitle>
                  <div className="space-y-3">
                    {incomingPending.map((m) => (
                      <Card key={m.id} variant="primary" className="p-4 border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-[var(--fg)]">{m.topic}</p>
                            <p className="text-sm text-[var(--muted)]">
                              From {names[m.menteeId] || 'Mentee'} · pending
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={busyId === m.id}
                              className="rounded-xl"
                              onClick={() => void respond(m.id, 'accepted')}
                            >
                              {busyId === m.id ? '…' : 'Accept'}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={busyId === m.id}
                              className="rounded-xl"
                              onClick={() => void respond(m.id, 'declined')}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {outgoingPending.length > 0 && (
                <div>
                  <SectionTitle>Awaiting mentor</SectionTitle>
                  <div className="space-y-3">
                    {outgoingPending.map((m) => (
                      <Card key={m.id} variant="secondary" className="p-4 flex items-start gap-3">
                        <Clock className="text-[var(--muted)] shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="font-medium text-[var(--fg)]">{m.topic}</p>
                          <p className="text-sm text-[var(--muted)]">
                            Sent to {names[m.mentorId] || 'Mentor'} — they haven&apos;t responded yet.
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <SectionTitle>Active mentorships</SectionTitle>
                {active.length === 0 ? (
                  <Card variant="primary" className="p-8 text-center border-violet-500/10">
                    <GraduationCap className="mx-auto text-violet-500/70 mb-3" size={40} />
                    <p className="text-[var(--muted)] text-sm">
                      No active mentorships yet. Accept a request above or{' '}
                      <Link to="/mentorship" className="text-violet-600 dark:text-violet-400 underline font-medium">
                        send a new request
                      </Link>
                      .
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {active.map((m) => {
                      const otherId = m.mentorId === user.id ? m.menteeId : m.mentorId;
                      const label = m.mentorId === user.id ? 'Mentee' : 'Mentor';
                      return (
                        <Card
                          key={m.id}
                          variant="primary"
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-violet-500/15"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-violet-900/50 dark:to-cyan-900/40 flex items-center justify-center shrink-0">
                              <MessageSquare className="text-violet-700 dark:text-violet-300" size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--fg)]">{m.topic}</p>
                              <p className="text-sm text-[var(--muted)]">
                                {label}: {names[otherId] || otherId} ·{' '}
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{m.status}</span>
                              </p>
                            </div>
                          </div>
                          <Link to={`/mentorship/${m.id}`}>
                            <Button variant="primary" size="sm" className="rounded-xl gap-2 w-full sm:w-auto">
                              Open thread
                              <ChevronRight size={16} />
                            </Button>
                          </Link>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {declined.length > 0 && (
                <div>
                  <SectionTitle>Declined</SectionTitle>
                  <div className="space-y-2">
                    {declined.map((m) => {
                      const other = m.mentorId === user.id ? m.menteeId : m.mentorId;
                      return (
                        <Card key={m.id} variant="secondary" className="p-3 flex items-center gap-2 opacity-80">
                          <XCircle size={18} className="text-[var(--muted)] shrink-0" />
                          <p className="text-sm text-[var(--muted)]">
                            <span className="font-medium text-[var(--fg)]">{m.topic}</span> · {names[other] || other}
                          </p>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {incomingPending.length === 0 &&
                outgoingPending.length === 0 &&
                active.length === 0 &&
                declined.length === 0 && (
                  <Card variant="primary" className="p-10 text-center">
                    <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={44} />
                    <p className="text-[var(--fg)] font-semibold mb-2">Nothing here yet</p>
                    <p className="text-sm text-[var(--muted)] mb-6">
                      Start from the alumni directory or send a mentorship request.
                    </p>
                    <Link to="/mentorship">
                      <Button variant="primary" className="rounded-xl">
                        Go to mentorship
                      </Button>
                    </Link>
                  </Card>
                )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default MentorshipHub;
