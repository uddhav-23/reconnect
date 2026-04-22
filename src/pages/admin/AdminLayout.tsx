import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../lib/roles';
import PageHero from '../../components/layout/PageHero';

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
    <div className="min-h-screen">
      <PageHero
        eyebrow="Admin"
        title="Administration"
        titleGradientPart="Admin"
        subtitle="Moderation, verification, and platform tools."
      />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <nav className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border)] pb-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 rounded-xl text-sm font-medium border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] shadow-sm hover:border-violet-400/50 hover:shadow-md transition-all"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
