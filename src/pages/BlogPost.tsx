import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, Share2, MessageCircle, Calendar, User, Tag, 
  ArrowLeft, Users
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { getBlogById } from '../services/firebaseFirestore';
import { Blog } from '../types';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-mono text-gray-600">Loading blog...</p>
      </div>
    );
  }

  if (notFound || !blog) {
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

  const handleLike = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    setIsLiked(!isLiked);
    // In real app, this would update the like count in backend
  };

  const handleShare = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    setShowShareModal(true);
  };

  const handleComment = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Scroll to comments section or open comment modal
    alert('Comment feature coming soon!');
  };

  // Get user's connections for sharing (not implemented with Firestore yet)
  const userConnections: any[] = [];

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
                  {blog.author.name}
                </h2>
                <p className="font-mono text-sm text-gray-700">
                  {blog.author.currentPosition} at {blog.author.currentCompany}
                </p>
                <p className="font-mono text-xs text-gray-600">
                  Class of {blog.author.graduationYear}
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
                <span>{blog.likes + (isLiked ? 1 : 0)} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 size={16} />
                <span>{blog.shares} shares</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle size={16} />
                <span>{blog.comments.length} comments</span>
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
              variant={isLiked ? "danger" : "secondary"} 
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              {isLiked ? 'LIKED' : 'LIKE'} ({blog.likes + (isLiked ? 1 : 0)})
            </Button>
            <Button 
              variant="primary" 
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 size={20} />
              SHARE ({blog.shares})
            </Button>
            <Button 
              variant="success" 
              onClick={handleComment}
              className="flex items-center gap-2"
            >
              <MessageCircle size={20} />
              COMMENT ({blog.comments.length})
            </Button>
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