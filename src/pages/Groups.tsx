import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
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
      <section className="py-16 px-4 bg-gradient-to-b from-[var(--bg)] to-neutral-100 dark:to-neutral-900">
        <div className="container mx-auto max-w-5xl flex justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-[var(--fg)] mb-2">Groups & chapters</h1>
            <p className="text-[var(--muted)]">Regional chapters, interests, and graduating batches.</p>
          </div>
          {user && (
            <Button variant="primary" className="flex items-center gap-2 shrink-0" onClick={() => setShow(true)}>
              <Plus size={18} />
              Create
            </Button>
          )}
        </div>
      </section>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card variant="primary" className="w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-[var(--fg)]">Create group</h2>
            <form onSubmit={create} className="space-y-3">
              <input
                required
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)]"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <textarea
                required
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] min-h-[80px]"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <select
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)]"
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
                  className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)]"
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
