import React from 'react';
import { useLocation } from 'react-router-dom';
import { Filter } from 'lucide-react';
import PageHero from '../components/layout/PageHero';
import AlumniDirectoryCard from '../components/alumni/AlumniDirectoryCard';
import { getAlumni } from '../services/firebaseFirestore';
import type { Alumni as AlumniType } from '../types';

const Alumni: React.FC = () => {
  const [alumni, setAlumni] = React.useState<AlumniType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [gradYear, setGradYear] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [locationFilter, setLocationFilter] = React.useState('');
  const [companyFilter, setCompanyFilter] = React.useState('');
  const [industryFilter, setIndustryFilter] = React.useState('');
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchTerm(query);
  }, [location.search]);

  React.useEffect(() => {
    loadAlumni();
  }, []);

  const loadAlumni = async () => {
    try {
      setLoading(true);
      setError(null);
      const alumniData = await getAlumni();
      setAlumni(alumniData || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load alumni.');
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredAlumni = alumni.filter((a) => {
    if (gradYear && String(a.graduationYear) !== gradYear) return false;
    if (department && !(a.department || '').toLowerCase().includes(department.toLowerCase())) return false;
    if (locationFilter && !(a.location || '').toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (companyFilter && !(a.currentCompany || '').toLowerCase().includes(companyFilter.toLowerCase())) return false;
    if (industryFilter && !(a.industry || '').toLowerCase().includes(industryFilter.toLowerCase())) return false;

    if (!normalizedSearch) return true;
    const skills: string[] = a.skills || [];
    const haystack = [
      a.name,
      ...(a.profileVisibility === 'private' ? [] : [a.email]),
      a.currentCompany,
      a.currentPosition,
      a.location,
      a.degree,
      a.department,
      a.industry,
      ...(skills || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Network"
        title="Alumni directory"
        titleGradientPart="directory"
        subtitle={
          <>
            Connect with <strong className="text-[var(--fg)] font-semibold">{filteredAlumni.length}</strong> graduate
            {filteredAlumni.length === 1 ? '' : 's'} — search and filter to find your cohort.
          </>
        }
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-900 dark:text-amber-100">{error}</p>
          </div>
        )}
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-violet-500/40 via-blue-500/30 to-teal-500/40 shadow-lg max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, skills, company, degree, location..."
            className="w-full px-5 py-3.5 rounded-2xl border border-transparent bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-neutral-400 text-sm"
          />
        </div>
      </PageHero>

      <section className="py-6 px-4 container mx-auto max-w-6xl">
        <div className="app-filter-panel">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)] mb-3">
            <Filter size={16} className="text-violet-500" />
            Refine results
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              className="app-input"
              placeholder="Graduation year"
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
            />
            <input
              className="app-input"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <input
              className="app-input"
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            <input
              className="app-input"
              placeholder="Company"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            />
            <input
              className="app-input"
              placeholder="Industry"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="app-page-section pb-12">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-sm text-[var(--muted)]">Loading alumni…</p>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/40">
              <p className="text-sm text-[var(--muted)] max-w-md mx-auto px-4">
                {alumni.length === 0
                  ? 'No alumni profiles yet. Invite your cohort to sign up.'
                  : 'No alumni match your filters. Try adjusting search or filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAlumni.map((alumniItem) => (
                <AlumniDirectoryCard key={alumniItem.id} alumni={alumniItem} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Alumni;
