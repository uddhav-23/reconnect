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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-mono text-gray-600">Loading blog...</p>
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card variant="primary" className="text-center">
          <h1 className="text-2xl font-black font-mono text-black mb-4">BLOG NOT FOUND</h1>
          <Button variant="primary" onClick={() => navigate('/blogs')}>
            BACK TO BLOGS
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-[#FF0080] border-b-4 border-black py-8 px-4">
        <div className="container mx-auto">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/blogs')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            BACK TO BLOGS
          </Button>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-black font-mono uppercase text-white mb-6 transform -skew-y-1 leading-tight">
              {blog.title}
            </h1>
            
            {/* Author Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-[#00FF80] border-4 border-black transform rotate-1">
              <div className="w-16 h-16 bg-[#0080FF] border-4 border-black flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold font-mono text-black uppercase">
                  {blog.author?.name ?? 'Author'}
                </h2>
                <p className="font-mono text-sm text-gray-700">
                  {blog.author?.currentPosition} at {blog.author?.currentCompany}
                </p>
                <p className="font-mono text-xs text-gray-600">
                  {blog.author?.graduationYear != null && `Class of ${blog.author.graduationYear}`}
                </p>
              </div>
            </div>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white font-mono">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={16} />
                <span>{displayLikeCount} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 size={16} />
                <span>{blog.shares} shares</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle size={16} />
                <span>{displayCommentCount} comments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tags */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={20} className="text-gray-500" />
              <span className="font-bold font-mono text-lg uppercase text-black">
                Tags:
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {blog.tags.map((tag) => (
                <span 
                  key={tag}
                  className="bg-[#0080FF] text-white px-4 py-2 border-4 border-black font-mono font-bold uppercase transform -rotate-1"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <Card variant="primary" className="mb-8 transform rotate-1">
            <div className="prose prose-lg max-w-none">
              <div 
                className="font-mono text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: blog.content.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<strong>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }}
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button 
              variant={effectiveDemoLiked ? "danger" : "secondary"} 
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart size={20} fill={effectiveDemoLiked ? "currentColor" : "none"} />
              {effectiveDemoLiked ? 'LIKED' : 'LIKE'} ({displayLikeCount})
            </Button>
            <Button 
              variant="primary" 
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 size={20} />
              SHARE ({blog.shares})
            </Button>
            <Button variant="success" onClick={() => document.getElementById('comments')?.scrollIntoView()} className="flex items-center gap-2">
              <MessageCircle size={20} />
              COMMENT ({displayCommentCount})
            </Button>
            <Button variant="secondary" onClick={reportPost} className="flex items-center gap-2">
              Report
            </Button>
          </div>

          <div id="comments" className="mb-8">
            <h3 className="font-bold font-mono text-lg uppercase text-black mb-4">Comments</h3>
            {isDemoPost && (
              <p className="text-xs font-mono text-gray-600 mb-3">
                Featured demo post: new comments below are kept for this visit only.
              </p>
            )}
            <div className="space-y-3 mb-4">
              {isDemoPost &&
                demoSessionComments.map((c) => (
                  <div key={c.id} className="p-3 border-2 border-black bg-white font-mono text-sm">
                    <span className="block text-xs font-bold text-gray-600 mb-1">{c.authorName}</span>
                    {c.content}
                  </div>
                ))}
              {(blog.comments || []).map((c) => (
                <div key={c.id} className="p-3 border-2 border-black bg-white font-mono text-sm">
                  {c.content}
                </div>
              ))}
            </div>
            {user ? (
              <div className="flex flex-col gap-2">
                <textarea
                  className="w-full border-4 border-black p-3 font-mono"
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
              <p className="font-mono text-gray-600">Log in to comment.</p>
            )}
          </div>

          {/* Author Card */}
          <Card variant="secondary" className="transform -rotate-1">
            <h3 className="font-black font-mono text-xl text-black uppercase mb-4">
              ABOUT THE AUTHOR
            </h3>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-[#FF0080] border-4 border-black flex items-center justify-center transform rotate-12">
                <User size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold font-mono text-black uppercase mb-2">
                  {blog.author.name}
                </h4>
                <p className="font-mono text-sm text-gray-700 mb-3">
                  {blog.author.bio}
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => navigate(`/alumni/${blog.author.id}`)}
                  >
                    VIEW PROFILE
                  </Button>
                  <Button variant="success" size="sm">
                    CONNECT
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="primary" className="max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="font-black font-mono text-xl text-black uppercase mb-4">
              SHARE WITH CONNECTIONS
            </h2>
            
            {userConnections.length > 0 ? (
              <div className="space-y-3 mb-6">
                {userConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-3 bg-[#00FF80] border-2 border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF0080] border-2 border-black flex items-center justify-center">
                        <Users size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold font-mono text-black text-sm">
                          {connection.name}
                        </p>
                        <p className="font-mono text-xs text-gray-700">
                          {connection.currentPosition}
                        </p>
                      </div>
                    </div>
                    <Button variant="primary" size="sm">
                      SHARE
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="font-mono text-gray-600 mb-4">
                  No connections yet. Connect with alumni to share posts!
                </p>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setShowShareModal(false);
                    navigate('/alumni');
                  }}
                >
                  FIND ALUMNI
                </Button>
              </div>
            )}
            
            <div className="flex gap-4">
              <Button 
                variant="secondary" 
                onClick={() => setShowShareModal(false)}
                className="flex-1"
              >
                CLOSE
              </Button>
              <Button 
                variant="success" 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                  setShowShareModal(false);
                }}
                className="flex-1"
              >
                COPY LINK
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="primary" className="max-w-md w-full">
            <h2 className="font-black font-mono text-xl text-black uppercase mb-4">
              LOGIN REQUIRED
            </h2>
            <p className="font-mono text-gray-700 mb-6">
              You need to be logged in to like, share, and comment on posts.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="primary" 
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                LOGIN
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowLoginModal(false)}
                className="flex-1"
              >
                CANCEL
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BlogPost;