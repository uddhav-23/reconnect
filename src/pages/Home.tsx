import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, Award, ArrowRight, Target, Zap } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { mockAlumni, mockBlogs } from '../data/mockData';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const featuredAlumni = mockAlumni.slice(0, 3);
  const [searchTerm, setSearchTerm] = React.useState('');
  const recentBlogs = mockBlogs.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[var(--bg)] to-neutral-100 dark:to-neutral-900">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
            Connect Alumni, Build Careers
          </h1>
          <p className="text-base md:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-6">
            Bridge the gap between education and career through a trusted alumni network.
          </p>
          <div className="max-w-xl mx-auto mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search alumni by name, skills, company, degree..."
              className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors duration-200 font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/alumni?q=${encodeURIComponent(searchTerm)}`);
                }
              }}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
            <Button variant="primary" size="lg" className="flex items-center gap-2" onClick={() => navigate('/alumni')}>
              <Users size={20} />
              Explore Alumni
              <ArrowRight size={20} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
              Join Network
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="primary" className="text-center">
              <div className="text-3xl font-semibold text-[var(--fg)] mb-1">500+</div>
              <div className="text-sm text-[var(--muted)]">Alumni connected</div>
            </Card>
            <Card variant="secondary" className="text-center">
              <div className="text-3xl font-semibold text-[var(--fg)] mb-1">50+</div>
              <div className="text-sm text-[var(--muted)]">Colleges</div>
            </Card>
            <Card variant="accent" className="text-center">
              <div className="text-3xl font-semibold text-[var(--fg)] mb-1">100+</div>
              <div className="text-sm text-[var(--muted)]">Success stories</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Alumni */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--fg)]">
              Featured Alumni
            </h2>
            <Button variant="secondary" size="md">
              <Link to="/alumni" className="flex items-center gap-2">
                View All
                <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredAlumni.map((alumni) => (
              <Card key={alumni.id} variant="primary">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-md bg-neutral-200 dark:bg-neutral-700 mx-auto mb-4 flex items-center justify-center shadow-subtle">
                    <Users size={28} />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 text-[var(--fg)]">
                    {alumni.name}
                  </h3>
                  <p className="text-sm mb-1 text-[var(--muted)]">
                    {alumni.currentPosition}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {alumni.currentCompany}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {alumni.skills.slice(0, 3).map((skill) => (
                      <span 
                        key={skill}
                        className="bg-neutral-100 dark:bg-neutral-800 text-[var(--fg)] px-2 py-1 border border-[var(--border)] text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Blogs */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--fg)]">
              Latest Blogs
            </h2>
            <Button variant="primary" size="md">
              <Link to="/blogs" className="flex items-center gap-2">
                View All
                <BookOpen size={20} />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentBlogs.map((blog) => (
              <Card key={blog.id} variant="primary">
                <div className="h-40 rounded-md bg-neutral-200 dark:bg-neutral-700 mb-4 flex items-center justify-center">
                  <BookOpen size={40} />
                </div>
                <h3 className="font-semibold text-base mb-2 text-[var(--fg)]">
                  {blog.title}
                </h3>
                <p className="text-sm mb-4 text-[var(--muted)]">
                  {blog.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)]">
                    By {blog.author.name}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {blog.likes} likes
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {blog.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="bg-neutral-100 dark:bg-neutral-800 text-[var(--fg)] px-2 py-1 border border-[var(--border)] text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-[var(--fg)] mb-10">
            Powerful Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="primary" className="text-center">
              <Target size={40} className="mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-[var(--fg)]">
                Networking
              </h3>
              <p className="text-sm text-[var(--muted)]">
                Connect with alumni across different industries and build meaningful professional relationships
              </p>
            </Card>
            
            <Card variant="secondary" className="text-center">
              <Zap size={40} className="mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-[var(--fg)]">
                Mentorship
              </h3>
              <p className="text-sm text-[var(--muted)]">
                Get guidance from experienced professionals and share your knowledge with junior alumni
              </p>
            </Card>
            
            <Card variant="accent" className="text-center">
              <Award size={40} className="mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-[var(--fg)]">
                Achievements
              </h3>
              <p className="text-sm text-[var(--muted)]">
                Showcase your professional milestones and celebrate the success of your peers
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-[var(--fg)] mb-4">
            Join the network
          </h2>
          <p className="text-base md:text-lg text-[var(--muted)] mb-6">
            Connect, learn, grow, and succeed with peers and mentors.
          </p>
          <Button variant="primary" size="lg" className="flex items-center gap-2 mx-auto">
            <Users size={20} />
            Get started today
            <ArrowRight size={20} />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;