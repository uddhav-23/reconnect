import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, Share2, MessageCircle, Calendar, User, Tag, 
  ArrowLeft, Users
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { getBlogById, likeBlog, addBlogComment } from '../services/firebaseFirestore';
import { createContentReport, createAppNotification } from '../services/platformFirestore';
import { Blog } from '../types';
import { isAdmin } from '../lib/roles';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  /** Featured demo posts (mock-blog-*) — likes/comments stay in this session only */
  const [demoLikeFlip, setDemoLikeFlip] = useState(false);
  const [demoSessionComments, setDemoSessionComments] = useState<{ id: string; content: string; authorName: string }[]>(
    []
  );

  useEffect(() => {
    setDemoLikeFlip(false);
    setDemoSessionComments([]);
  }, [id]);

  useEffect(() => {
    const loadBlog = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const blogData = await getBlogById(id);
        if (!blogData) {
          setNotFound(true);
        } else {
          setBlog(blogData);
        }
      } catch (error) {
        console.error('Error loading blog:', error);
        alert('Failed to load blog post. Please check your Firebase configuration.');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    loadBlog();
  }, [id]);

  useEffect(() => {
    if (!blog || !user) return;
    setIsLiked(!!blog.likedBy?.includes(user.id));
  }, [blog, user]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <p className="text-[var(--muted)] font-medium">Loading post…</p>
      </div>
    );
  }

  if (
    notFound ||
    !blog ||
    (blog.status === 'draft' &&
      (!user || (user.id !== blog.authorId && !isAdmin(user))))
  ) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
        <Card variant="primary" className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[var(--fg)] mb-3">Post not found</h1>
          <p className="text-sm text-[var(--muted)] mb-6">This story may have been removed or is still a draft.</p>
          <Button variant="primary" onClick={() => navigate('/blogs')}>
            Back to blogs
          </Button>
        </Card>
      </div>
    );
  }

  const handleLike = async () => {
    if (!user || !blog) {
      setShowLoginModal(true);
      return;
    }
    if (blog.id.startsWith('mock-blog-')) {
      setDemoLikeFlip((f) => !f);
      return;
    }
    try {
      await likeBlog(blog.id, user.id);
      const fresh = await getBlogById(blog.id);
      if (fresh) {
        setBlog(fresh);
        setIsLiked(!!fresh.likedBy?.includes(user.id));
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Could not update like.');
    }
  };

  const handleShare = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    setShowShareModal(true);
  };

  const submitComment = async () => {
    if (!user || !blog || !commentText.trim()) {
      setShowLoginModal(true);
      return;
    }
    if (blog.id.startsWith('mock-blog-')) {
      setDemoSessionComments((prev) => [
        ...prev,
        {
          id: `demo_${Date.now()}`,
          content: commentText.trim(),
          authorName: user.name,
        },
      ]);
      setCommentText('');
      return;
    }
    setSubmittingComment(true);
    try {
      await addBlogComment(blog.id, { content: commentText.trim(), authorId: user.id });
      if (blog.authorId !== user.id) {
        await createAppNotification({
          userId: blog.authorId,
          type: 'comment',
          title: 'New comment',
          body: `${user.name} commented on your post.`,
          actorId: user.id,
          link: `/blog/${blog.id}`,
        });
      }
      const fresh = await getBlogById(blog.id);
      if (fresh) setBlog(fresh);
      setCommentText('');
    } catch {
      alert('Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const reportPost = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const reason = window.prompt('Describe the issue:');
    if (!reason?.trim()) return;
    try {
      await createContentReport({
        targetType: 'blog',
        targetId: blog!.id,
        reporterId: user.id,
        reason: reason.trim(),
      });
      alert('Report submitted. Thank you.');
    } catch {
      alert('Could not submit report.');
    }
  };

  // Get user's connections for sharing (not implemented with Firestore yet)
  const userConnections: { id: string; name: string; currentPosition?: string }[] = [];

  const isDemoPost = blog.id.startsWith('mock-blog-');
  const effectiveDemoLiked = isDemoPost ? isLiked !== demoLikeFlip : isLiked;
  const displayLikeCount = isDemoPost
    ? blog.likes +
      (effectiveDemoLiked && !isLiked ? 1 : 0) +
      (!effectiveDemoLiked && isLiked ? -1 : 0)
    : blog.likes;
  const displayCommentCount =
    (blog.comments?.length || 0) + (isDemoPost ? demoSessionComments.length : 0);

  return (
    <div className="min-h-screen">
      <section className="home-hero-mesh border-b border-[var(--border)]/70 py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button variant="secondary" onClick={() => navigate('/blogs')} className="mb-6 flex items-center gap-2 rounded-xl">
            <ArrowLeft size={16} />
            Back to blogs
          </Button>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--fg)] leading-tight mb-6">
            {blog.title}
          </h1>

          <div className="app-surface p-4 sm:p-5 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-inner">
              <User size={26} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-[var(--fg)]">{blog.author?.name ?? 'Author'}</h2>
              <p className="text-sm text-[var(--muted)]">
                {[blog.author?.currentPosition, blog.author?.currentCompany].filter(Boolean).join(' · ')}
              </p>
              {blog.author?.graduationYear != null && (
                <p className="text-xs text-[var(--muted)] mt-1">Class of {blog.author.graduationYear}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-violet-500 shrink-0" />
              <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-rose-500 shrink-0" />
              <span>{displayLikeCount} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 size={16} className="text-cyan-600 shrink-0" />
              <span>{blog.shares} shares</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-teal-600 shrink-0" />
              <span>{displayCommentCount} comments</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto">
          {blog.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-[var(--fg)] font-semibold">
                <Tag size={18} className="text-violet-500" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span key={tag} className="app-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Card variant="primary" className="mb-8">
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-[var(--fg)] prose-p:text-[var(--fg)]">
              <div
                className="text-[var(--fg)] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: blog.content
                    .replace(/\n/g, '<br>')
                    .replace(/#{1,6}\s/g, '<strong>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                }}
              />
            </div>
          </Card>

          <div className="flex flex-wrap gap-3 mb-10">
            <Button
              variant={effectiveDemoLiked ? 'danger' : 'secondary'}
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart size={20} fill={effectiveDemoLiked ? 'currentColor' : 'none'} />
              {effectiveDemoLiked ? 'Liked' : 'Like'} ({displayLikeCount})
            </Button>
            <Button variant="primary" onClick={handleShare} className="flex items-center gap-2">
              <Share2 size={20} />
              Share ({blog.shares})
            </Button>
            <Button
              variant="success"
              onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2"
            >
              <MessageCircle size={20} />
              Comment ({displayCommentCount})
            </Button>
            <Button variant="secondary" onClick={reportPost} className="flex items-center gap-2">
              Report
            </Button>
          </div>

          <div id="comments" className="mb-10">
            <h3 className="text-lg font-bold text-[var(--fg)] mb-4">Comments</h3>
            {isDemoPost && (
              <p className="text-xs text-[var(--muted)] mb-3">
                Demo post: comments you add here are kept for this visit only.
              </p>
            )}
            <div className="space-y-3 mb-4">
              {isDemoPost &&
                demoSessionComments.map((c) => (
                  <div key={c.id} className="app-surface p-4 text-sm text-[var(--fg)]">
                    <span className="block text-xs font-semibold text-[var(--muted)] mb-1">{c.authorName}</span>
                    {c.content}
                  </div>
                ))}
              {(blog.comments || []).map((c) => (
                <div key={c.id} className="app-surface p-4 text-sm text-[var(--fg)]">
                  {c.content}
                </div>
              ))}
            </div>
            {user ? (
              <div className="flex flex-col gap-3">
                <textarea
                  className="app-textarea"
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                />
                <Button variant="primary" onClick={submitComment} disabled={submittingComment}>
                  {submittingComment ? 'Posting…' : 'Post comment'}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">Log in to comment.</p>
            )}
          </div>

          <Card variant="secondary" className="border-violet-500/15 bg-gradient-to-br from-violet-500/[0.06] to-cyan-500/[0.04] dark:from-violet-900/20 dark:to-cyan-900/10">
            <h3 className="text-lg font-bold text-[var(--fg)] mb-4">About the author</h3>
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shrink-0">
                <User size={32} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[var(--fg)] mb-2">{blog.author.name}</h4>
                <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">{blog.author.bio}</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm" onClick={() => navigate(`/alumni/${blog.author.id}`)}>
                    View profile
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/messages')}>
                    Messages
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card variant="primary" className="max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-lg font-bold text-[var(--fg)] mb-4">Share with connections</h2>

            {userConnections.length > 0 ? (
              <div className="space-y-3 mb-6">
                {userConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-3 app-surface border-[var(--border)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shrink-0">
                        <Users size={16} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--fg)] text-sm truncate">{connection.name}</p>
                        <p className="text-xs text-[var(--muted)] truncate">{connection.currentPosition}</p>
                      </div>
                    </div>
                    <Button variant="primary" size="sm">
                      Share
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto mb-4 text-[var(--muted)]" />
                <p className="text-sm text-[var(--muted)] mb-4">
                  No connections yet. Find alumni to share posts with.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowShareModal(false);
                    navigate('/alumni');
                  }}
                >
                  Browse alumni
                </Button>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <Button variant="secondary" onClick={() => setShowShareModal(false)} className="flex-1 min-w-[120px]">
                Close
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  void navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                  setShowShareModal(false);
                }}
                className="flex-1 min-w-[120px]"
              >
                Copy link
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card variant="primary" className="max-w-md w-full">
            <h2 className="text-lg font-bold text-[var(--fg)] mb-3">Log in required</h2>
            <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
              Sign in to like, share, and comment on posts.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button variant="primary" onClick={() => navigate('/login')} className="flex-1 min-w-[120px]">
                Log in
              </Button>
              <Button variant="secondary" onClick={() => setShowLoginModal(false)} className="flex-1 min-w-[120px]">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BlogPost;