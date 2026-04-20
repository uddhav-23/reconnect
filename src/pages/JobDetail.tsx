import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Users } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { getJobById, applyToJob, JobPosting } from '../services/platformFirestore';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setJob(await getJobById(id));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
      const j = await getJobById(job.id);
      setJob(j);
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
          <Link to="/jobs" className="block mt-4">
            <Button variant="primary">Back</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const applied = user && job.applications?.some((a) => a.userId === user.id);

  return (
    <div className="min-h-screen py-10 px-4 container mx-auto max-w-3xl">
      <Button variant="secondary" className="mb-6 flex items-center gap-2" onClick={() => navigate('/jobs')}>
        <ArrowLeft size={16} />
        All jobs
      </Button>
      <h1 className="text-3xl font-semibold text-[var(--fg)] mb-2">{job.title}</h1>
      <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)] mb-6">
        <span className="flex items-center gap-1">
          <Building2 size={16} />
          {job.company}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={16} />
          {job.location}
        </span>
        {job.remote && <span className="text-emerald-600 dark:text-emerald-400">Remote</span>}
        <span className="flex items-center gap-1">
          <Users size={16} />
          {job.applications?.length || 0} applicants
        </span>
      </div>
      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-[var(--fg)] mb-8">{job.description}</div>

      {user && user.id !== job.postedBy && (user.role === 'student' || user.role === 'user' || user.role === 'alumni') && (
        <Card variant="secondary" className="p-4">
          {applied ? (
            <p className="text-[var(--muted)]">You have already applied.</p>
          ) : (
            <>
              <textarea
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] mb-3 text-sm"
                placeholder="Optional note to the poster"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button variant="primary" onClick={apply}>
                Apply
              </Button>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default JobDetail;
