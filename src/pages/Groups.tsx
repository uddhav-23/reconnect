import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHero from '../components/layout/PageHero';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../lib/roles';
import type { Group } from '../types';
import { getGroups, createGroup } from '../services/platformFirestore';

const Groups: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'interest' as 'chapter' | 'interest' | 'batch',
    batchYear: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      setGroups(await getGroups());
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createGroup({
        name: form.name,
        description: form.description,
        type: form.type,
        members: [user.id],
        adminIds: isAdmin(user) ? [user.id] : [user.id],
        batchYear: form.type === 'batch' && form.batchYear ? Number(form.batchYear) : undefined,
      });
      setShow(false);
      setForm({ name: '', description: '', type: 'interest', batchYear: '' });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Community"
        title="Groups & chapters"
        titleGradientPart="Groups"
        subtitle="Regional chapters, interests, and graduating batches."
        actions={
          user ? (
            <Button variant="primary" className="flex items-center gap-2 shrink-0 rounded-xl" onClick={() => setShow(true)}>
              <Plus size={18} />
              Create
            </Button>
          ) : undefined
        }
      />

      <section className="py-10 px-4 container mx-auto max-w-5xl">
        {loading ? (
          <p className="text-[var(--muted)] text-center py-12">Loading…</p>
        ) : groups.length === 0 ? (
          <Card variant="primary" className="text-center py-12 text-[var(--muted)]">
            No groups yet. Create the first one.
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {groups.map((g) => (
              <Link key={g.id} to={`/groups/${g.id}`}>
                <Card variant="primary" className="p-6 h-full hover:border-[var(--primary)] transition-colors">
                  <div className="flex items-start gap-3">
                    <Users className="text-[var(--primary)] shrink-0" />
                    <div>
                      <h2 className="font-semibold text-[var(--fg)]">{g.name}</h2>
                      <p className="text-xs uppercase tracking-wide text-[var(--muted)] mt-1">{g.type}</p>
                      <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">{g.description}</p>
                      <p className="text-xs text-[var(--muted)] mt-3">{g.members?.length || 0} members</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card variant="primary" className="w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4 text-[var(--fg)]">Create group</h2>
            <form onSubmit={create} className="space-y-3">
              <input
                required
                className="app-input"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <textarea
                required
                className="app-textarea min-h-[80px]"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <select
                className="app-input"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Group['type'] }))}
              >
                <option value="chapter">Chapter</option>
                <option value="interest">Interest</option>
                <option value="batch">Batch</option>
              </select>
              {form.type === 'batch' && (
                <input
                  type="number"
                  className="app-input"
                  placeholder="Graduation year"
                  value={form.batchYear}
                  onChange={(e) => setForm((f) => ({ ...f, batchYear: e.target.value }))}
                />
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShow(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Groups;
