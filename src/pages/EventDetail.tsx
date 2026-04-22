import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { getEventById, rsvpEvent, PlatformEvent } from '../services/platformFirestore';
import { getUserById } from '../services/firebaseFirestore';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ev, setEv] = useState<PlatformEvent | null>(null);
  const [organizerName, setOrganizerName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const e = await getEventById(id);
        setEv(e);
        if (e?.organizerId) {
          const o = await getUserById(e.organizerId);
          setOrganizerName(o?.name || 'Organizer');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const rsvp = async () => {
    if (!user || !ev) {
      navigate('/login');
      return;
    }
    await rsvpEvent(ev.id, user.id);
    const updated = await getEventById(ev.id);
    setEv(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (!ev) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="primary" className="text-center p-8">
          <p className="text-[var(--fg)] mb-4">Event not found.</p>
          <Link to="/events">
            <Button variant="primary">Back to events</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="home-hero-mesh border-b border-[var(--border)]/70 py-8 sm:py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <Button variant="secondary" className="mb-6 flex items-center gap-2 rounded-xl" onClick={() => navigate('/events')}>
            <ArrowLeft size={16} />
            All events
          </Button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--fg)] mb-4 leading-tight">{ev.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)] mb-3">
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-violet-500 shrink-0" />
              {new Date(ev.startAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-cyan-600 shrink-0" />
              {ev.location}
            </span>
            <span className="flex items-center gap-2">
              <Users size={16} className="text-teal-600 shrink-0" />
              {ev.attendeeIds?.length || 0} attending
            </span>
          </div>
          <p className="text-sm text-[var(--muted)]">Organized by {organizerName}</p>
        </div>
      </section>
      <div className="py-8 sm:py-10 px-4 container mx-auto max-w-3xl">
        <div className="prose dark:prose-invert max-w-none text-[var(--fg)] whitespace-pre-wrap mb-8 leading-relaxed">{ev.description}</div>
        {user && (
          <Button variant="primary" className="rounded-xl" onClick={rsvp}>
            {ev.attendeeIds?.includes(user.id) ? 'You are attending' : 'RSVP'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
