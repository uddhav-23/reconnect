import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, User, Tag } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getBlogs } from '../services/firebaseFirestore';

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const blogsData = await getBlogs();
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error loading blogs:', error);
      alert('Failed to load blogs. Please check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 px-4 bg-gradient-to-b from-[var(--bg)] to-neutral-100 dark:to-neutral-900">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
            Alumni Blogs
          </h1>
          <p className="text-base md:text-lg text-[var(--muted)] max-w-2xl mx-auto">
            Stories • Insights • Experiences
          </p>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="py-16 px-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Card key={blog.id} variant="primary">
                  {/* Cover Image Placeholder */}
                  <div className="h-40 rounded-md bg-neutral-200 dark:bg-neutral-700 mb-4 flex items-center justify-center">
                    <BookOpen size={40} />
                  </div>

                  {/* Blog Title */}
                  <h2 className="font-semibold text-base mb-2 text-[var(--fg)]">
                    {blog.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm mb-4 text-[var(--muted)] line-clamp-3">
                    {blog.excerpt}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--fg)]">
                        {blog.author.name}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {blog.author.currentPosition}
                      </p>
                    </div>
                  </div>

                  {/* Meta Info */}
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

                  {/* Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="bg-neutral-100 dark:bg-neutral-800 text-[var(--fg)] px-2 py-1 border border-[var(--border)] text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button variant="primary" size="sm" className="w-full">
                      <Link to={`/blog/${blog.id}`} className="flex items-center justify-center gap-2 w-full">
                        Read Full Post
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="flex-1">
                        Like
                      </Button>
                      <Button variant="success" size="sm" className="flex-1">
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Load More Section */}
          {blogs.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="primary" size="lg">
                Load More Blogs
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-[var(--fg)] mb-4">
            Share Your Story
          </h2>
          <p className="text-base md:text-lg text-[var(--muted)] mb-6">
            Inspire others with your journey
          </p>
          <Button variant="primary" size="lg">
            Write a Blog
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Blogs;