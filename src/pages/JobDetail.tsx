import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Users, Briefcase } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import JobApplicantsSection from '../components/jobs/JobApplicantsSection';
import { useAuth } from '../contexts/AuthContext';
import { getJobById, applyToJob } from '../services/platformFirestore';
import type { JobPosting } from '../types';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  const refreshJob = useCallback(async () => {
    if (!id) return;
    const j = await getJobById(id);
    setJob(j);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await refreshJob();
      } finally {
        setLoading(false);
      }
    })();
  }, [id, refreshJob]);

  const apply = async () => {
    if (!user || !job) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student' && user.role !== 'user' && user.role !== 'alumni') {
      alert('Only members can apply.');
      return;
    }
    try {
      await applyToJob(job.id, user.id, note || undefined);
      await refreshJob();
      alert('Application submitted.');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Apply failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="primary" className="p-8 text-center">
          Job not found.
          <Button variant="primary" className="mt-4 inline-flex" to="/jobs">
            Back
          </Button>
        </Card>
      </div>
    );
  }

  const applied = user && job.applications?.some((a) => a.userId === user.id);

  return (
    <div className="min-h-screen">
      <section className="home-hero-mesh border-b border-[var(--border)]/70 py-8 sm:py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <Button variant="secondary" className="mb-6 flex items-center gap-2 rounded-xl" onClick={() => navigate('/jobs')}>
            <ArrowLeft size={16} />
            All jobs
          </Button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--fg)] mb-3 leading-tight">{job.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
        <span className="flex items-center gap-1">
          <Building2 size={16} />
          {job.company}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={16} />
          {job.location}
        </span>
        {job.remote && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200">
            Remote
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users size={16} />
          {job.applications?.length || 0} applicants
        </span>
          </div>
        </div>
      </section>

      <div className="py-8 sm:py-10 px-4 container mx-auto max-w-3xl space-y-8">
        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-[var(--fg)] leading-relaxed">{job.description}</div>

        {user && user.id === job.postedBy && (
          <JobApplicantsSection job={job} viewerId={user.id} onJobUpdated={() => void refreshJob()} />
        )}

        {user && user.id !== job.postedBy && (user.role === 'student' || user.role === 'user' || user.role === 'alumni') && (
          <Card variant="secondary" className="p-5 border-violet-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <p className="font-semibold text-[var(--fg)]">Apply for this role</p>
              <Button variant="secondary" size="sm" className="rounded-xl gap-2 w-full sm:w-auto" to="/jobs/my-applications">
                <Briefcase size={16} />
                My applications
              </Button>
            </div>
            {applied ? (
              <div className="space-y-3">
                <p className="text-[var(--muted)] text-sm">
                  You&apos;ve submitted an application. Track status on{' '}
                  <Link to="/jobs/my-applications" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
                    My job applications
                  </Link>
                  .
                </p>
                {(() => {
                  const mine = job.applications?.find((a) => a.userId === user.id);
                  const st = mine?.status ?? 'pending';
                  const label =
                    st === 'accepted'
                      ? 'Accepted'
                      : st === 'rejected'
                        ? 'Not selected'
                        : 'Pending review';
                  return (
                    <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                      Status: {label}
                    </span>
                  );
                })()}
              </div>
            ) : (
              <>
                <textarea
                  className="app-textarea mb-3 min-h-[88px]"
                  placeholder="Optional note to the poster"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button variant="primary" onClick={apply} className="rounded-xl">
                  Apply
                </Button>
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
