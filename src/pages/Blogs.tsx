import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Heart, User, BookOpen, PenLine } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHero from '../components/layout/PageHero';
import { getBlogs } from '../services/firebaseFirestore';
import { useAuth } from '../contexts/AuthContext';
import { mergeDisplayBlogs } from '../lib/blogDisplayMerge';
import { saveLocalBlog } from '../lib/localBlogsStorage';
import type { Blog } from '../types';

const Blogs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showComposer, setShowComposer] = React.useState(false);
  const [composer, setComposer] = React.useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
  });
  const [saving, setSaving] = React.useState(false);

  const loadBlogs = async () => {
    try {
      const blogsData = await getBlogs();
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error loading blogs:', error);
      setBlogs(mergeDisplayBlogs([]));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    void loadBlogs();
  }, []);

  const handleWriteBlog = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/dashboard/${user.role}`, { state: { openBlogComposer: true } });
  };

  const handleQuickLocalPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const title = composer.title.trim();
    const content = composer.content.trim();
    if (!title || !content) {
      alert('Please add a title and body.');
      return;
    }
    setSaving(true);
    try {
      const tags = composer.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      saveLocalBlog(
        {
          title,
          content,
          excerpt: composer.excerpt.trim(),
          tags: tags.length ? tags : ['community'],
        },
        user
      );
      setComposer({ title: '', content: '', excerpt: '', tags: '' });
      setShowComposer(false);
      await loadBlogs();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Community"
        title="Alumni blogs"
        titleGradientPart="blogs"
        subtitle="Stories, insights, and experiences from the network — including featured posts and your own drafts from the dashboard."
      />

      <section className="app-page-section">
        <div className="container mx-auto max-w-3xl">
          {user && (
            <Card variant="secondary" className="p-6 mb-10 border-violet-500/10 bg-gradient-to-br from-violet-500/[0.04] to-cyan-500/[0.03] dark:from-violet-900/15 dark:to-cyan-900/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--fg)] flex items-center gap-2">
                    <PenLine size={20} />
                    Add a post
                  </h2>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    Publish from your dashboard (saved to the network), or add a quick story stored only in this
                    browser — both appear on this page.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" type="button" onClick={handleWriteBlog}>
                    Dashboard editor
                  </Button>
                  <Button variant="secondary" type="button" onClick={() => setShowComposer((s) => !s)}>
                    {showComposer ? 'Close' : 'Quick post (this device)'}
                  </Button>
                </div>
              </div>
              {showComposer && (
                <form onSubmit={handleQuickLocalPost} className="space-y-3 border-t border-[var(--border)] pt-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={composer.title}
                    onChange={(e) => setComposer({ ...composer, title: e.target.value })}
                    className="app-input"
                    required
                  />
                  <textarea
                    placeholder="Write your story (markdown-style line breaks are kept)"
                    value={composer.content}
                    onChange={(e) => setComposer({ ...composer, content: e.target.value })}
                    rows={6}
                    className="app-textarea min-h-[160px]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Short excerpt (optional)"
                    value={composer.excerpt}
                    onChange={(e) => setComposer({ ...composer, excerpt: e.target.value })}
                    className="app-input"
                  />
                  <input
                    type="text"
                    placeholder="Tags: career, alumni, tech"
                    value={composer.tags}
                    onChange={(e) => setComposer({ ...composer, tags: e.target.value })}
                    className="app-input"
                  />
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Publish quick post'}
                  </Button>
                </form>
              )}
            </Card>
          )}
        </div>
      </section>

      <section className="app-page-section pb-20">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-[var(--muted)]">Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--muted)]">No blogs found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {blogs.map((blog) => (
                <Card key={blog.id} variant="primary" className="overflow-hidden flex flex-col border-violet-500/10 hover:border-violet-400/30 transition-colors">
                  <div className="h-40 -mx-6 -mt-6 mb-4 rounded-t-2xl bg-gradient-to-br from-cyan-500/25 via-teal-500/15 to-violet-600/25 flex items-center justify-center">
                    <BookOpen size={40} className="text-cyan-600 dark:text-cyan-400" />
                  </div>

                  <h2 className="font-bold text-lg mb-2 text-[var(--fg)] line-clamp-2">{blog.title}</h2>

                  <p className="text-sm mb-4 text-[var(--muted)] line-clamp-3 flex-1">{blog.excerpt}</p>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center">
                      <User size={16} className="text-violet-700 dark:text-violet-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)]">{blog.author?.name ?? 'Alumni'}</p>
                      <p className="text-xs text-[var(--muted)]">{blog.author?.currentPosition ?? ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <Calendar size={14} />
                      <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <Heart size={14} />
                      <span>{blog.likes}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {(blog.tags || []).map((tag) => (
                        <span key={tag} className="app-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link to={`/blog/${blog.id}`} className="block w-full">
                    <Button variant="primary" size="sm" className="w-full">
                      Read Full Post
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-14 sm:py-16 px-4 border-t border-[var(--border)] home-hero-mesh">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-4">Share your story</h2>
          <p className="text-base text-[var(--muted)] mb-6 max-w-xl mx-auto leading-relaxed">
            Long-form posts with drafts and publishing live on your dashboard. Quick posts above stay on this device
            only — perfect for demos and notes.
          </p>
          <Button variant="primary" size="lg" type="button" onClick={handleWriteBlog}>
            {user ? 'Open blog editor' : 'Log in to write'}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Blogs;
