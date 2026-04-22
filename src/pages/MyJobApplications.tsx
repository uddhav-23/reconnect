import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Hash,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHero from '../components/layout/PageHero';
import { useAuth } from '../contexts/AuthContext';
import { listJobsAppliedByUser } from '../services/platformFirestore';
import type { JobApplication, JobPosting } from '../types';

function statusMeta(s: JobApplication['status']) {
  const status = s ?? 'pending';
  switch (status) {
    case 'accepted':
      return {
        label: 'Accepted',
        Icon: CheckCircle2,
        className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800',
      };
    case 'rejected':
      return {
        label: 'Not selected',
        Icon: XCircle,
        className: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800',
      };
    default:
      return {
        label: 'Pending review',
        Icon: Clock,
        className: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800',
      };
  }
}

function formatApplied(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

const MyJobApplications: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<{ job: JobPosting; application: JobApplication }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await listJobsAppliedByUser(user.id);
      setRows(list);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user) {
    return null;
  }

  const pending = rows.filter((r) => (r.application.status ?? 'pending') === 'pending').length;
  const accepted = rows.filter((r) => r.application.status === 'accepted').length;
  const rejected = rows.filter((r) => r.application.status === 'rejected').length;

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Careers"
        title="My job applications"
        titleGradientPart="applications"
        subtitle="Track every role you’ve applied for and see when a poster accepts or declines."
        actions={
          <Link to="/jobs">
            <Button variant="secondary" size="sm" className="rounded-xl h-9">
              Browse jobs
            </Button>
          </Link>
        }
      />

      <section className="app-page-section">
        <div className="container mx-auto max-w-4xl px-4 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-violet-200/80 dark:border-violet-500/25 bg-gradient-to-br from-violet-50/90 to-white dark:from-violet-950/40 dark:to-[var(--card)] p-4">
              <p className="text-xs font-medium text-[var(--muted)]">Total</p>
              <p className="text-2xl font-bold text-[var(--fg)] tabular-nums">{rows.length}</p>
            </div>
            <div className="rounded-xl border border-amber-200/80 dark:border-amber-500/25 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/35 dark:to-[var(--card)] p-4">
              <p className="text-xs font-medium text-[var(--muted)]">Pending</p>
              <p className="text-2xl font-bold text-[var(--fg)] tabular-nums">{pending}</p>
            </div>
            <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-500/25 bg-gradient-to-br from-emerald-50/90 to-white dark:from-emerald-950/35 dark:to-[var(--card)] p-4">
              <p className="text-xs font-medium text-[var(--muted)]">Accepted</p>
              <p className="text-2xl font-bold text-[var(--fg)] tabular-nums">{accepted}</p>
            </div>
            <div className="rounded-xl border border-rose-200/80 dark:border-rose-500/25 bg-gradient-to-br from-rose-50/90 to-white dark:from-rose-950/35 dark:to-[var(--card)] p-4">
              <p className="text-xs font-medium text-[var(--muted)]">Not selected</p>
              <p className="text-2xl font-bold text-[var(--fg)] tabular-nums">{rejected}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-[var(--muted)] py-16 justify-center">
              <Loader2 className="animate-spin" size={22} />
              Loading applications…
            </div>
          ) : rows.length === 0 ? (
            <Card variant="primary" className="p-10 text-center border-violet-500/10">
              <Briefcase className="mx-auto text-violet-500/70 mb-4" size={44} />
              <p className="text-[var(--fg)] font-semibold mb-2">No applications yet</p>
              <p className="text-sm text-[var(--muted)] mb-6">Explore open roles and apply with an optional note to the poster.</p>
              <Link to="/jobs">
                <Button variant="primary" className="rounded-xl">
                  View jobs
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {rows.map(({ job, application }) => {
                const meta = statusMeta(application.status);
                return (
                  <Card key={`${job.id}-${application.userId}`} variant="primary" className="p-4 sm:p-5 border-[var(--border)]">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2 flex-wrap">
                          <Hash size={16} className="text-[var(--muted)] shrink-0 mt-1" />
                          <div>
                            <Link to={`/jobs/${job.id}`} className="font-bold text-[var(--fg)] hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                              {job.title}
                            </Link>
                            <p className="text-sm text-[var(--muted)]">
                              {job.company} · {job.location}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-2">Applied {formatApplied(application.appliedAt)}</p>
                        {application.note && (
                          <p className="text-sm text-[var(--muted)] mt-2 border-l-2 border-violet-500/30 pl-3">
                            Your note: {application.note}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:items-end gap-3 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${meta.className}`}
                        >
                          <meta.Icon size={14} />
                          {meta.label}
                        </span>
                        <Link to={`/jobs/${job.id}`}>
                          <Button variant="secondary" size="sm" className="rounded-xl gap-1 w-full sm:w-auto">
                            Job detail
                            <ChevronRight size={14} />
                          </Button>
                        </Link>
                      </div>
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

export default MyJobApplications;
