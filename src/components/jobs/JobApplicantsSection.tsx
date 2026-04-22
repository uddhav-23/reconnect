import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Check, X, ExternalLink, Loader2, GraduationCap } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { getConnectionStatus, getAlumniById, getUserById } from '../../services/firebaseFirestore';
import { updateJobApplicationStatus } from '../../services/platformFirestore';
import { canSeeContactFromState, alumniPublicSummary } from '../../lib/applicantProfileAccess';
import type { JobPosting, JobApplication, Alumni, User as UserT } from '../../types';

interface RowState {
  application: JobApplication;
  baseUser: UserT | null;
  alumni: Alumni | null;
  connectionOk: boolean;
  loading: boolean;
}

function formatApplied(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

const JobApplicantsSection: React.FC<{
  job: JobPosting;
  viewerId: string;
  onJobUpdated: () => void;
}> = ({ job, viewerId, onJobUpdated }) => {
  const apps = job.applications || [];
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const loadApplicant = useCallback(
    async (app: JobApplication) => {
      const uid = app.userId;
      setRows((prev) => ({
        ...prev,
        [uid]: {
          ...(prev[uid] || {
            application: app,
            baseUser: null,
            alumni: null,
            connectionOk: false,
            loading: true,
          }),
          loading: true,
          application: app,
        },
      }));

      try {
        const baseUser = await getUserById(uid);
        let alumni: Alumni | null = null;
        if (baseUser?.role === 'alumni') {
          alumni = await getAlumniById(uid);
        }
        let connectionOk = false;
        if (baseUser) {
          const c = await getConnectionStatus(viewerId, uid);
          connectionOk = c?.status === 'accepted';
        }

        setRows((prev) => ({
          ...prev,
          [uid]: {
            application: app,
            baseUser,
            alumni,
            connectionOk,
            loading: false,
          },
        }));
      } catch {
        setRows((prev) => ({
          ...prev,
          [uid]: {
            application: app,
            baseUser: null,
            alumni: null,
            connectionOk: false,
            loading: false,
          },
        }));
      }
    },
    [viewerId]
  );

  const appsKey = JSON.stringify(
    apps.map((a) => ({
      userId: a.userId,
      appliedAt: a.appliedAt,
      status: a.status ?? 'pending',
    }))
  );

  useEffect(() => {
    const list = job.applications ?? [];
    for (const app of list) {
      void loadApplicant(app);
    }
  }, [appsKey, loadApplicant, job.applications]);

  const handleStatus = async (applicantId: string, status: 'accepted' | 'rejected') => {
    setBusy(`${applicantId}-${status}`);
    try {
      await updateJobApplicationStatus(job.id, viewerId, applicantId, status);
      onJobUpdated();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not update');
    } finally {
      setBusy(null);
    }
  };

  if (apps.length === 0) {
    return (
      <Card variant="secondary" className="p-6 border-violet-500/10">
        <h3 className="text-lg font-bold text-[var(--fg)] mb-2">Applicants</h3>
        <p className="text-sm text-[var(--muted)]">No applications yet.</p>
      </Card>
    );
  }

  return (
    <Card variant="secondary" className="p-5 sm:p-6 border-violet-500/10">
      <h3 className="text-lg font-bold text-[var(--fg)] mb-1">Applicants ({apps.length})</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Contact details respect each applicant&apos;s profile visibility (public vs private). Private profiles hide email and
        phone unless you have an accepted connection with them — same rules as the alumni directory.
      </p>
      <div className="space-y-4">
        {apps.map((app) => {
          const st = rows[app.userId];
          const loading = !st || st.loading;
          const base = st?.baseUser;
          const alumni = st?.alumni;
          const canContact =
            base &&
            canSeeContactFromState(
              viewerId,
              {
                id: base.id,
                profileVisibility: base.profileVisibility,
                connections: alumni?.connections,
              },
              st.connectionOk
            );

          const status = app.status ?? 'pending';

          return (
            <div
              key={app.userId}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-4 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-violet-900/40 dark:to-cyan-900/30 flex items-center justify-center shrink-0">
                    <User size={22} className="text-violet-700 dark:text-violet-300" />
                  </div>
                  <div className="min-w-0">
                    {loading ? (
                      <div className="flex items-center gap-2 text-[var(--muted)] text-sm">
                        <Loader2 className="animate-spin" size={16} />
                        Loading applicant…
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-[var(--fg)] truncate">{base?.name || 'Member'}</p>
                        <p className="text-xs text-[var(--muted)] capitalize">{base?.role || 'user'}</p>
                        {alumni && (
                          <p className="text-sm text-[var(--muted)] mt-1 flex items-start gap-1">
                            <GraduationCap size={14} className="shrink-0 mt-0.5" />
                            {alumniPublicSummary(alumni)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        disabled={!!busy}
                        className="rounded-xl gap-1"
                        onClick={() => void handleStatus(app.userId, 'accepted')}
                      >
                        <Check size={14} />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!!busy}
                        className="rounded-xl gap-1"
                        onClick={() => void handleStatus(app.userId, 'rejected')}
                      >
                        <X size={14} />
                        Decline
                      </Button>
                    </>
                  )}
                  {status === 'accepted' && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200">
                      Accepted
                    </span>
                  )}
                  {status === 'rejected' && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200">
                      Declined
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--muted)]">Applied {formatApplied(app.appliedAt)}</p>
              {app.note && (
                <div className="text-sm border-l-2 border-violet-500/40 pl-3 py-1">
                  <span className="text-[var(--muted)]">Note: </span>
                  {app.note}
                </div>
              )}

              {!loading && base && (
                <div className="pt-2 border-t border-[var(--border)]/80 space-y-2">
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Contact</p>
                  {canContact ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {base.email && (
                        <a href={`mailto:${base.email}`} className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline">
                          <Mail size={14} />
                          {base.email}
                        </a>
                      )}
                      {alumni?.phone && (
                        <span className="text-[var(--fg)]">{alumni.phone}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-[var(--muted)]">
                      <Lock size={16} className="shrink-0 mt-0.5" />
                      <span>
                        Email and phone are hidden — this applicant uses a <strong className="text-[var(--fg)]">private</strong>{' '}
                        profile. Connect with them from the directory to unlock contact info (same as browsing alumni).
                      </span>
                    </div>
                  )}

                  {base.role === 'alumni' && (
                    <Link
                      to={`/alumni/${base.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline mt-1"
                    >
                      View full alumni profile
                      <ExternalLink size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default JobApplicantsSection;
