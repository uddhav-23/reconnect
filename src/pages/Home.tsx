import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, ArrowRight, Target, Zap, Award, Calendar, Briefcase, Sparkles } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getHomePageData, HomePageData } from '../services/platformFirestore';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [data, setData] = React.useState<HomePageData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const d = await getHomePageData();
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load home data');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const featuredAlumni = data?.featuredAlumni ?? [];
  const recentBlogs = data?.recentBlogs ?? [];

  return (
    <div className="min-h-screen">
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[var(--bg)] to-neutral-100 dark:to-neutral-900">
        <div className="container mx-auto text-center max-w-4xl">
          <p className="text-sm font-medium text-[var(--primary)] mb-3 tracking-wide uppercase flex items-center justify-center gap-2">
            <Sparkles size={16} />
            Alumni ecosystem
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4 text-[var(--fg)]">
            Connect Alumni, Build Careers
          </h1>
          <p className="text-base md:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8">
            Bridge the gap between education and career through a trusted alumni network—events, jobs,
            mentorship, and chapters in one place.
          </p>
          <div className="max-w-xl mx-auto mb-8">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search alumni by name, skills, company, degree..."
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/alumni?q=${encodeURIComponent(searchTerm)}`);
                }
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button variant="primary" size="lg" className="flex items-center gap-2" onClick={() => navigate('/alumni')}>
              <Users size={20} />
              Explore Alumni
              <ArrowRight size={20} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/signup')}>
              Join Network
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 border-t border-[var(--border)]">
        <div className="container mx-auto">
          {error && (
            <div className="mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-100">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Alumni', value: loading ? '—' : data?.alumniCount ?? 0, icon: Users },
              { label: 'Published posts', value: loading ? '—' : data?.blogCount ?? 0, icon: BookOpen },
              { label: 'Active users (30d)', value: loading ? '—' : data?.activeUserCount ?? 0, icon: Zap },
              { label: 'Colleges', value: loading ? '—' : data?.collegeCount ?? 0, icon: Target },
            ].map((stat) => (
              <Card key={stat.label} variant="primary" className="text-center py-6">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-[var(--primary)] opacity-90" />
                <div className="text-2xl md:text-3xl font-semibold text-[var(--fg)] tabular-nums">{stat.value}</div>
                <div className="text-xs md:text-sm text-[var(--muted)] mt-1">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--fg)]">Featured alumni</h2>
            <Button variant="secondary" size="md" onClick={() => navigate('/alumni')}>
              <span className="flex items-center gap-2">
                View all
                <ArrowRight size={18} />
              </span>
            </Button>
          </div>
          {!loading && featuredAlumni.length === 0 ? (
            <p className="text-center text-[var(--muted)] py-8">No alumni profiles yet. Be the first to join.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(loading ? [1, 2, 3] : featuredAlumni).map((alumni, idx) =>
                loading ? (
                  <Card key={idx} variant="primary" className="animate-pulse h-64" />
                ) : (
                  <Card key={(alumni as { id: string }).id} variant="primary" className="overflow-hidden">
                    <div className="text-center p-2">
                      <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-700 mx-auto mb-4 flex items-center justify-center text-lg font-semibold text-[var(--fg)]">
                        {(alumni as { name: string }).name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <h3 className="font-semibold text-lg mb-1 text-[var(--fg)]">{(alumni as { name: string }).name}</h3>
                      <p className="text-sm text-[var(--muted)]">{(alumni as { currentPosition?: string }).currentPosition || 'Alumni'}</p>
                      <p className="text-sm text-[var(--muted)] mb-4">{(alumni as { currentCompany?: string }).currentCompany}</p>
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate(`/alumni/${(alumni as { id: string }).id}`)}>
                        View profile
                      </Button>
                    </div>
                  </Card>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 bg-neutral-50/80 dark:bg-neutral-900/40">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--fg)]">Recent blog posts</h2>
            <Button variant="primary" size="md" onClick={() => navigate('/blogs')}>
              <span className="flex items-center gap-2">
                View all
                <BookOpen size={18} />
              </span>
            </Button>
          </div>
          {!loading && recentBlogs.length === 0 ? (
            <p className="text-center text-[var(--muted)] py-8">No posts yet. Publish from your dashboard.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(loading ? [1, 2, 3] : recentBlogs).map((blog, idx) =>
                loading ? (
                  <Card key={idx} variant="primary" className="animate-pulse h-56" />
                ) : (
                  <Card key={(blog as { id: string }).id} variant="primary" className="flex flex-col">
                    <div className="h-36 rounded-md bg-gradient-to-br from-[var(--primary)]/20 to-neutral-200 dark:to-neutral-800 mb-4 flex items-center justify-center">
                      <BookOpen className="text-[var(--primary)]" size={36} />
                    </div>
                    <h3 className="font-semibold text-[var(--fg)] mb-2 line-clamp-2">{(blog as { title: string }).title}</h3>
                    <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2 flex-1">{(blog as { excerpt: string }).excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-[var(--muted)] mt-auto">
                      <span>By {(blog as { author?: { name?: string } }).author?.name || 'Author'}</span>
                      <Link to={`/blog/${(blog as { id: string }).id}`} className="text-[var(--primary)] font-medium hover:underline">
                        Read
                      </Link>
                    </div>
                  </Card>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-[var(--fg)] mb-10">Explore the platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="primary" className="text-center p-6">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-[var(--primary)]" />
              <h3 className="font-semibold text-lg mb-2 text-[var(--fg)]">Events</h3>
              <p className="text-sm text-[var(--muted)] mb-4">Reunions, webinars, and chapter meetups.</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/events')}>
                Browse events
              </Button>
            </Card>
            <Card variant="secondary" className="text-center p-6">
              <Briefcase className="w-10 h-10 mx-auto mb-3 text-[var(--primary)]" />
              <h3 className="font-semibold text-lg mb-2 text-[var(--fg)]">Jobs</h3>
              <p className="text-sm text-[var(--muted)] mb-4">Roles posted by alumni for students and peers.</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/jobs')}>
                Open job board
              </Button>
            </Card>
            <Card variant="accent" className="text-center p-6">
              <Award className="w-10 h-10 mx-auto mb-3 text-[var(--primary)]" />
              <h3 className="font-semibold text-lg mb-2 text-[var(--fg)]">Mentorship</h3>
              <p className="text-sm text-[var(--muted)] mb-4">Offer or request guidance in your field.</p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/mentorship')}>
                Get started
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-4 border-t border-[var(--border)]">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-[var(--fg)] mb-4">Join the network</h2>
          <p className="text-[var(--muted)] mb-8">
            Create your profile, connect with your cohort, and stay in the loop.
          </p>
          <Button variant="primary" size="lg" className="inline-flex items-center gap-2" onClick={() => navigate('/signup')}>
            <Users size={20} />
            Get started today
            <ArrowRight size={20} />
          </Button>
          <p className="text-xs text-[var(--muted)] mt-6">
            <Link to="/privacy" className="underline hover:text-[var(--fg)]">
              Privacy
            </Link>
            {' · '}
            <Link to="/terms" className="underline hover:text-[var(--fg)]">
              Terms
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
