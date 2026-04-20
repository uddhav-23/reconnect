import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../lib/roles';
import {
  getUpcomingEvents,
  createEvent,
  rsvpEvent,
  PlatformEvent,
} from '../services/platformFirestore';

const Events: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    startAt: '',
    endAt: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      setEvents(await getUpcomingEvents(100));
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRsvp = async (eventId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      await rsvpEvent(eventId, user.id);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'RSVP failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin(user)) return;
    try {
      await createEvent({
        title: form.title,
        description: form.description,
        location: form.location,
        startAt: form.startAt,
        endAt: form.endAt || undefined,
        organizerId: user.id,
        attendeeIds: [],
      });
      setShowCreate(false);
      setForm({ title: '', description: '', location: '', startAt: '', endAt: '' });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create event');
    }
  };

  return (
    <div className="min-h-screen">
      <section className="py-16 px-4 bg-gradient-to-b from-[var(--bg)] to-neutral-100 dark:to-neutral-900">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-[var(--fg)] mb-2">Events</h1>
            <p className="text-[var(--muted)]">Upcoming reunions, webinars, and meetups.</p>
          </div>
          {user && isAdmin(user) && (
            <Button variant="primary" onClick={() => setShowCreate(true)} className="flex items-center gap-2 shrink-0">
              <Plus size={18} />
              New event
            </Button>
          )}
        </div>
      </section>

      <section className="py-12 px-4 container mx-auto max-w-5xl">
        {loading ? (
          <p className="text-[var(--muted)] text-center py-12">Loading events…</p>
        ) : events.length === 0 ? (
          <Card variant="primary" className="text-center py-12 text-[var(--muted)]">
            No upcoming events yet. Check back soon.
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => (
              <Card key={ev.id} variant="primary" className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <Link to={`/events/${ev.id}`} className="text-xl font-semibold text-[var(--fg)] hover:text-[var(--primary)]">
                      {ev.title}
                    </Link>
                    <p className="text-sm text-[var(--muted)] mt-2 flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(ev.startAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-[var(--muted)] mt-1 flex items-center gap-2">
                      <MapPin size={14} />
                      {ev.location}
                    </p>
                    <p className="text-sm mt-3 text-[var(--fg)] line-clamp-2">{ev.description}</p>
                    <p className="text-xs text-[var(--muted)] mt-2 flex items-center gap-1">
                      <Users size={12} />
                      {ev.attendeeIds?.length || 0} attending
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => handleRsvp(ev.id)}>
                      RSVP
                    </Button>
                    <Link to={`/events/${ev.id}`}>
                      <Button variant="primary" size="sm" className="w-full">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card variant="primary" className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Create event</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)]"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <textarea
                required
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] min-h-[100px]"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <input
                required
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)]"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
              <label className="block text-xs text-[var(--muted)]">Start (local)</label>
              <input
                required
                type="datetime-local"
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)]"
                value={form.startAt}
                onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
              />
              <label className="block text-xs text-[var(--muted)]">End (optional)</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)]"
                value={form.endAt}
                onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
              />
              <div className="flex gap-2 justify-end pt-2">
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

export default Events;
