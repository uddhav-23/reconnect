import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../lib/roles';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  if (!user || !isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  const links = [
    { to: '/admin', label: 'Overview' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/posts', label: 'Posts' },
    { to: '/admin/events', label: 'Events' },
    { to: '/admin/jobs', label: 'Jobs' },
    { to: '/admin/reports', label: 'Reports' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-2xl font-semibold text-[var(--fg)] mb-2">Administration</h1>
      <p className="text-sm text-[var(--muted)] mb-6">Moderation and verification tools</p>
      <nav className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border)] pb-4">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="px-3 py-1.5 rounded-md text-sm border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--primary)] transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
};

export default AdminLayout;
