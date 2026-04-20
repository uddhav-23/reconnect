import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllBlogsAdmin, deleteBlog, updateBlog } from '../../services/firebaseFirestore';
import type { Blog } from '../../types';

const AdminPosts: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setBlogs(await getAllBlogsAdmin());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm('Remove this post permanently?')) return;
    await deleteBlog(id);
    await load();
  };

  const flag = async (id: string) => {
    await updateBlog(id, { moderationStatus: 'removed' });
    await load();
  };

  if (loading) {
    return <p className="text-[var(--muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-3">
      {blogs.map((b) => (
        <Card key={b.id} variant="primary" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium text-[var(--fg)]">{b.title}</p>
            <p className="text-xs text-[var(--muted)]">
              {b.status || 'published'} · {b.moderationStatus || 'ok'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => flag(b.id)}>
              Remove from feed
            </Button>
            <Button size="sm" variant="primary" onClick={() => remove(b.id)}>
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminPosts;
