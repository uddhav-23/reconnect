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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-[#FF0080] border-b-4 border-black py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-7xl font-black font-mono uppercase text-white text-center transform skew-y-1">
            ALUMNI
            <br />
            <span className="text-[#00FF80]">BLOGS</span>
          </h1>
          <p className="text-xl font-bold font-mono uppercase text-center mt-6 text-white">
            Stories • Insights • Experiences
          </p>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <p className="font-mono text-lg">Loading blogs...</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="font-mono text-lg text-gray-500">No blogs found.</p>
              </div>
            ) : (
              blogs.map((blog, index) => (
              <Card 
                key={blog.id} 
                variant="primary" 
                className={`transform ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'} hover:rotate-0 transition-transform duration-300`}
              >
                {/* Cover Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-[#FF0080] to-[#0080FF] border-4 border-black mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-2 left-2 w-8 h-8 bg-[#00FF80] border-2 border-black"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-white border-2 border-black"></div>
                  <div className="text-white font-black font-mono text-4xl opacity-20">
                    BLOG
                  </div>
                </div>

                {/* Blog Title */}
                <h2 className="font-black font-mono text-xl mb-4 text-black uppercase leading-tight">
                  {blog.title}
                </h2>

                {/* Excerpt */}
                <p className="font-mono text-sm text-gray-700 mb-6 line-clamp-3">
                  {blog.excerpt}
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-[#00FF80] border-2 border-black transform -rotate-1">
                  <div className="w-10 h-10 bg-[#FF0080] border-2 border-black flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold font-mono text-sm text-black uppercase">
                      {blog.author.name}
                    </p>
                    <p className="font-mono text-xs text-black">
                      {blog.author.currentPosition}
                    </p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between mb-6 font-mono text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#FF0080]">
                    <Heart size={16} />
                    <span className="font-bold">{blog.likes}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={16} className="text-gray-500" />
                    <span className="font-bold font-mono text-sm uppercase text-black">
                      Tags:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="bg-[#0080FF] text-white px-2 py-1 border-2 border-black font-mono text-xs font-bold uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button variant="primary" size="sm" className="w-full">
                    <Link to={`/blog/${blog.id}`} className="block w-full">
                      READ FULL POST
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1">
                      LIKE
                    </Button>
                    <Button variant="success" size="sm" className="flex-1">
                      SHARE
                    </Button>
                  </div>
                </div>
              </Card>
              ))
            )}
          </div>

          {/* Load More Section */}
          <div className="text-center mt-12">
            <Button variant="primary" size="lg" className="transform hover:scale-105 transition-transform">
              LOAD MORE BLOGS
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#00FF80] border-t-4 border-black">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black font-mono uppercase text-black mb-6 transform -skew-y-1">
            SHARE YOUR STORY
          </h2>
          <p className="text-xl font-bold font-mono uppercase mb-8 text-black">
            Inspire others with your journey
          </p>
          <Button variant="primary" size="lg">
            WRITE A BLOG
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Blogs;