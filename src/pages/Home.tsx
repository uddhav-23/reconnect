import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  ArrowRight,
  Target,
  Zap,
  Calendar,
  Briefcase,
  Award,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import HomeShowcaseRow from '../components/home/HomeShowcaseRow';
import { getHomePageData, HomePageData } from '../services/platformFirestore';
import type { Alumni, Blog } from '../types';

const statTileClass =
  'relative overflow-hidden rounded-2xl border p-6 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md';

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

  const alumniSkeletonKeys = ['a', 'b', 'c', 'd', 'e', 'f'];
  const blogSkeletonKeys = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'];

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="min-h-screen">
      <section className="home-hero-mesh relative py-16 md:py-24 px-4 border-b border-[var(--border)]/80">
        <div className="container mx-auto text-center max-w-4xl relative z-[1]">
          <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 mb-4 tracking-wide uppercase flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            Alumni ecosystem
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 text-[var(--fg)] leading-[1.1]">
            Connect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-teal-500 dark:from-violet-400 dark:via-blue-400 dark:to-teal-400">
              Alumni
            </span>
            , build careers
          </h1>
          <p className="text-base md:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Bridge the gap between education and career through a trusted alumni network—events, jobs,
            mentorship, and chapters in one place.
          </p>
          <div className="max-w-xl mx-auto mb-10">
            <div className="rounded-2xl p-[1px] bg-gradient-to-r from-violet-500/50 via-blue-500/40 to-teal-500/50 shadow-lg shadow-violet-500/10">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search alumni by name, skills, company, degree..."
                className="w-full px-5 py-3.5 rounded-2xl border border-transparent bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-violet-500/60 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-shadow text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/alumni?q=${encodeURIComponent(searchTerm)}`);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              className="flex items-center gap-2 rounded-xl shadow-lg shadow-blue-600/25"
              onClick={() => navigate('/alumni')}
            >
              <Users size={20} />
              Explore Alumni
              <ArrowRight size={20} />
            </Button>
            <Button variant="secondary" size="lg" className="rounded-xl border-2" onClick={() => navigate('/signup')}>
              Join Network
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-14 px-4 border-b border-[var(--border)]/60 bg-[var(--bg)]">
        <div className="container mx-auto max-w-7xl">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-100">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            <div
              className={`${statTileClass} border-violet-200/80 dark:border-violet-500/25 bg-gradient-to-br from-violet-50/90 to-white dark:from-violet-950/40 dark:to-[var(--card)]`}
            >
              <Users className="w-8 h-8 mb-3 text-violet-600 dark:text-violet-400" />
              <div className="text-2xl md:text-3xl font-bold text-[var(--fg)] tabular-nums">
                {loading ? '—' : data?.alumniCount ?? 0}
              </div>
              <div className="text-xs md:text-sm text-[var(--muted)] mt-1 font-medium">Alumni</div>
            </div>
            <div
              className={`${statTileClass} border-cyan-200/80 dark:border-cyan-500/25 bg-gradient-to-br from-cyan-50/90 to-white dark:from-cyan-950/35 dark:to-[var(--card)]`}
            >
              <BookOpen className="w-8 h-8 mb-3 text-cyan-600 dark:text-cyan-400" />
              <div className="text-2xl md:text-3xl font-bold text-[var(--fg)] tabular-nums">
                {loading ? '—' : data?.blogCount ?? 0}
              </div>
              <div className="text-xs md:text-sm text-[var(--muted)] mt-1 font-medium">Published posts</div>
            </div>
            <div
              className={`${statTileClass} border-amber-200/80 dark:border-amber-500/25 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/35 dark:to-[var(--card)]`}
            >
              <Zap className="w-8 h-8 mb-3 text-amber-600 dark:text-amber-400" />
              <div className="text-2xl md:text-3xl font-bold text-[var(--fg)] tabular-nums">
                {loading ? '—' : data?.activeUserCount ?? 0}
              </div>
              <div className="text-xs md:text-sm text-[var(--muted)] mt-1 font-medium">Active users (30d)</div>
            </div>
            <div
              className={`${statTileClass} border-rose-200/80 dark:border-rose-500/25 bg-gradient-to-br from-rose-50/90 to-white dark:from-rose-950/35 dark:to-[var(--card)]`}
            >
              <Target className="w-8 h-8 mb-3 text-rose-600 dark:text-rose-400" />
              <div className="text-2xl md:text-3xl font-bold text-[var(--fg)] tabular-nums">
                {loading ? '—' : data?.collegeCount ?? 0}
              </div>
              <div className="text-xs md:text-sm text-[var(--muted)] mt-1 font-medium">Colleges</div>
            </div>
          </div>
        </div>
      </section>

      <HomeShowcaseRow
        title="Featured alumni"
        subtitle="Swipe or use arrows — click a card for the full profile. Tap the heading above to open the directory."
        viewAllTo="/alumni"
        accent="violet"
      >
        {!loading && featuredAlumni.length === 0 ? (
          <p className="text-[var(--muted)] py-6 snap-start">No alumni profiles yet. Be the first to join.</p>
        ) : (
          <>
            {loading
              ? alumniSkeletonKeys.map((key) => (
                  <div
                    key={key}
                    data-showcase-card
                    className="home-showcase-card-drift shrink-0 snap-start w-[min(88vw,300px)] h-[280px] rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800 animate-pulse"
                  />
                ))
              : featuredAlumni.map((alumni: Alumni) => (
                  <button
                    key={alumni.id}
                    type="button"
                    data-showcase-card
                    onClick={() => navigate(`/alumni/${alumni.id}`)}
                    className="home-showcase-card-drift group shrink-0 snap-start w-[min(88vw,300px)] text-left rounded-2xl p-[1px] bg-gradient-to-br from-violet-500/70 via-fuchsia-500/50 to-amber-400/60 shadow-lg shadow-violet-500/10 transition-all hover:shadow-xl hover:shadow-violet-500/20 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                  >
                    <div className="h-full rounded-2xl bg-[var(--card)] p-6 flex flex-col border border-white/10 dark:border-white/5">
                      <div className="flex justify-center mb-4">
                        {alumni.profilePicture ? (
                          <img
                            src={alumni.profilePicture}
                            alt=""
                            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-violet-500/30"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                            {initials(alumni.name)}
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-[var(--fg)] line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {alumni.name}
                      </h3>
                      <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">
                        {alumni.currentPosition || 'Alumni'}
                        {alumni.currentCompany ? ` · ${alumni.currentCompany}` : ''}
                      </p>
                      {alumni.department && (
                        <p className="text-xs text-[var(--muted)] mt-3 line-clamp-1">{alumni.department}</p>
                      )}
                      <span className="mt-auto pt-4 text-sm font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                        View profile
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </button>
                ))}
          </>
        )}
      </HomeShowcaseRow>

      <HomeShowcaseRow
        title="Recent blog posts"
        subtitle="Scroll through stories from the community. Tap the heading for the full blog feed."
        viewAllTo="/blogs"
        accent="cyan"
      >
        {!loading && recentBlogs.length === 0 ? (
          <p className="text-[var(--muted)] py-6 snap-start">No posts yet. Publish from your dashboard.</p>
        ) : (
          <>
            {loading
              ? blogSkeletonKeys.map((key) => (
                  <div
                    key={key}
                    data-showcase-card
                    className="home-showcase-card-drift shrink-0 snap-start w-[min(88vw,320px)] h-[300px] rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800 animate-pulse"
                  />
                ))
              : recentBlogs.map((blog: Blog) => (
                  <button
                    key={blog.id}
                    type="button"
                    data-showcase-card
                    onClick={() => navigate(`/blog/${blog.id}`)}
                    className="home-showcase-card-drift group shrink-0 snap-start w-[min(88vw,320px)] text-left rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)] shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-cyan-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] flex flex-col"
                  >
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-cyan-500/25 via-teal-500/20 to-violet-600/25">
                      {blog.coverImage ? (
                        <img src={blog.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="text-cyan-600/80 dark:text-cyan-400/90" size={40} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-80" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-[var(--fg)] mb-2 line-clamp-2 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-[var(--muted)] line-clamp-2 flex-1">{blog.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-[var(--muted)] mt-4 pt-3 border-t border-[var(--border)]">
                        <span className="truncate">By {blog.author?.name || 'Author'}</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-semibold shrink-0 ml-2">Read →</span>
                      </div>
                    </div>
                  </button>
                ))}
          </>
        )}
      </HomeShowcaseRow>

      <HomeShowcaseRow
        title="Explore the platform"
        subtitle="Pick a card below — each opens that area of the app (events, jobs, or mentorship)."
        accent="amber"
      >
        {[
          {
            to: '/events',
            title: 'Events',
            desc: 'Reunions, webinars, and chapter meetups.',
            icon: Calendar,
            gradient: 'from-amber-500/90 to-orange-600',
          },
          {
            to: '/jobs',
            title: 'Jobs',
            desc: 'Roles posted by alumni for students and peers.',
            icon: Briefcase,
            gradient: 'from-teal-500/90 to-emerald-700',
          },
          {
            to: '/mentorship',
            title: 'Mentorship',
            desc: 'Offer or request guidance in your field.',
            icon: Award,
            gradient: 'from-violet-600/90 to-fuchsia-700',
          },
        ].map((item) => (
          <button
            key={item.title}
            type="button"
            data-showcase-card
            onClick={() => navigate(item.to)}
            className="home-showcase-card-drift group shrink-0 snap-start w-[min(88vw,300px)] text-left rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          >
            <div className={`h-2 w-full bg-gradient-to-r ${item.gradient}`} />
            <div className="p-6 bg-[var(--card)]">
              <item.icon className="w-10 h-10 mb-4 text-[var(--primary)]" />
              <h3 className="font-bold text-lg text-[var(--fg)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                Open
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </button>
        ))}
      </HomeShowcaseRow>

      <section className="py-16 md:py-24 px-4 border-t border-[var(--border)] bg-gradient-to-br from-violet-600/10 via-[var(--bg)] to-teal-600/10">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--fg)] mb-4">Join the network</h2>
          <p className="text-[var(--muted)] mb-10 leading-relaxed">
            Create your profile, connect with your cohort, and stay in the loop.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="inline-flex items-center gap-2 rounded-xl shadow-lg shadow-blue-600/20"
            onClick={() => navigate('/signup')}
          >
            <Users size={20} />
            Get started today
            <ArrowRight size={20} />
          </Button>
          <p className="text-xs text-[var(--muted)] mt-8">
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
