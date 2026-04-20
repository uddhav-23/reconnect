import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';

const AdminOverview: React.FC = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Link to="/admin/users">
      <Card variant="primary" className="p-6 h-full hover:border-[var(--primary)] transition-colors">
        <h2 className="font-semibold text-[var(--fg)]">Users</h2>
        <p className="text-sm text-[var(--muted)] mt-2">Verify alumni, review accounts</p>
      </Card>
    </Link>
    <Link to="/admin/posts">
      <Card variant="secondary" className="p-6 h-full hover:border-[var(--primary)] transition-colors">
        <h2 className="font-semibold text-[var(--fg)]">Posts</h2>
        <p className="text-sm text-[var(--muted)] mt-2">Moderate blogs and drafts</p>
      </Card>
    </Link>
    <Link to="/admin/events">
      <Card variant="accent" className="p-6 h-full hover:border-[var(--primary)] transition-colors">
        <h2 className="font-semibold text-[var(--fg)]">Events</h2>
        <p className="text-sm text-[var(--muted)] mt-2">Campus-wide calendar</p>
      </Card>
    </Link>
    <Link to="/admin/jobs">
      <Card variant="primary" className="p-6 h-full hover:border-[var(--primary)] transition-colors">
        <h2 className="font-semibold text-[var(--fg)]">Jobs</h2>
        <p className="text-sm text-[var(--muted)] mt-2">Review postings</p>
      </Card>
    </Link>
    <Link to="/admin/reports">
      <Card variant="secondary" className="p-6 h-full hover:border-[var(--primary)] transition-colors">
        <h2 className="font-semibold text-[var(--fg)]">Reports</h2>
        <p className="text-sm text-[var(--muted)] mt-2">Flagged content queue</p>
      </Card>
    </Link>
  </div>
);

export default AdminOverview;
