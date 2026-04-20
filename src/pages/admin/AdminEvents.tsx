import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import { getUpcomingEvents } from '../../services/platformFirestore';
import type { PlatformEvent } from '../../types';

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<PlatformEvent[]>([]);

  useEffect(() => {
    getUpcomingEvents(200).then(setEvents);
  }, []);

  return (
    <Card variant="primary" className="p-6">
      <p className="text-sm text-[var(--muted)] mb-4">
        Create or edit events from the public <a href="/events" className="text-[var(--primary)] underline">Events</a> page
        (admin button). Listed below are upcoming entries.
      </p>
      <ul className="space-y-2 text-sm">
        {events.map((e) => (
          <li key={e.id} className="border-b border-[var(--border)] pb-2 text-[var(--fg)]">
            {e.title} — {new Date(e.startAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default AdminEvents;
