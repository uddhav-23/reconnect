import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import { getJobs } from '../../services/platformFirestore';
import type { JobPosting } from '../../types';

const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  return (
    <Card variant="primary" className="p-6">
      <p className="text-sm text-[var(--muted)] mb-4">
        Alumni post roles from the <a href="/jobs" className="text-[var(--primary)] underline">Jobs</a> board.
      </p>
      <ul className="space-y-2 text-sm text-[var(--fg)]">
        {jobs.map((j) => (
          <li key={j.id} className="border-b border-[var(--border)] pb-2">
            {j.title} at {j.company} — {j.applications?.length || 0} applicants
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default AdminJobs;
