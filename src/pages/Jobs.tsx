import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, Plus, Filter } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHero from '../components/layout/PageHero';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../lib/roles';
import { getJobs, createJob, JobPosting } from '../services/platformFirestore';

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    remote: false,
    role: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      setJobs(await getJobs());
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (remoteOnly && !j.remote) return false;
      if (company && !j.company.toLowerCase().includes(company.toLowerCase())) return false;
      if (location && !j.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (role && !j.role.toLowerCase().includes(role.toLowerCase()) && !j.title.toLowerCase().includes(role.toLowerCase()))
        return false;
      return true;
    });
  }, [jobs, company, location, role, remoteOnly]);

  const submitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createJob({
        title: form.title,
        company: form.company,
        location: form.location,
        description: form.description,
        postedBy: user.id,
        remote: form.remote,
        role: form.role,
      });
      setShowCreate(false);
      setForm({ title: '', company: '', location: '', description: '', remote: false, role: '' });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to post job');
    }
  };

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Careers"
        title="Jobs & internships"
        titleGradientPart="Jobs"
        subtitle="Roles posted by alumni — filter by company, location, or remote-friendly listings."
        actions={
          user ? (
            <div className="flex flex-wrap gap-2 justify-end">
              <Link to="/jobs/my-applications">
                <Button variant="secondary" size="sm" className="rounded-xl shrink-0">
                  My applications
                </Button>
              </Link>
              {(user.role === 'alumni' || isAdmin(user)) && (
                <Button variant="primary" className="flex items-center gap-2 shrink-0 rounded-xl" onClick={() => setShowCreate(true)}>
                  <Plus size={18} />
                  Post a role
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      <section className="py-8 px-4 container mx-auto max-w-5xl">
        <div className="app-filter-panel">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)] mb-3">
            <Filter size={16} className="text-cyan-500" />
            Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              className="app-input"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <input
              className="app-input"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              className="app-input"
              placeholder="Role / title"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-[var(--fg)] cursor-pointer app-surface px-3 py-2.5">
              <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
              Remote only
            </label>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-[var(--muted)] py-12">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-12">No jobs match your filters.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((j) => (
              <Card key={j.id} variant="primary" className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <Link to={`/jobs/${j.id}`} className="text-lg font-semibold text-[var(--fg)] hover:text-[var(--primary)]">
                      {j.title}
                    </Link>
                    <p className="text-sm text-[var(--muted)] flex items-center gap-2 mt-1">
                      <Building2 size={14} />
                      {j.company}
                      {j.remote && (
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded">
                          Remote
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-[var(--muted)] flex items-center gap-2 mt-1">
                      <MapPin size={14} />
                      {j.location}
                    </p>
                    <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">{j.description}</p>
                  </div>
                  <Link to={`/jobs/${j.id}`}>
                    <Button variant="primary" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card variant="primary" className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-[var(--fg)]">Post a job</h2>
            <form onSubmit={submitJob} className="space-y-3">
              <input
                required
                className="app-input"
                placeholder="Job title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <input
                required
                className="app-input"
                placeholder="Company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              />
              <input
                required
                className="app-input"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
              <input
                required
                className="app-input"
                placeholder="Role type (e.g. Software Engineer)"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              />
              <textarea
                required
                className="app-textarea"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm text-[var(--fg)]">
                <input
                  type="checkbox"
                  checked={form.remote}
                  onChange={(e) => setForm((f) => ({ ...f, remote: e.target.checked }))}
                />
                Remote-friendly
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Publish
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Jobs;
