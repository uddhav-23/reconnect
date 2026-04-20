import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Building2, Calendar, Github, Linkedin, ExternalLink, BadgeCheck, Filter } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
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
      <section className="py-20 px-4 bg-gradient-to-b from-[var(--bg)] to-neutral-100 dark:to-neutral-900">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">Alumni Directory</h1>
          <p className="text-base md:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-6">
            Connect with {filteredAlumni.length} graduate{filteredAlumni.length === 1 ? '' : 's'}
          </p>
          {error && (
            <div className="max-w-xl mx-auto mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md">
              <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
            </div>
          )}
          <div className="max-w-xl mx-auto mb-8">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, skills, company, degree, location..."
              className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-neutral-400 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="py-6 px-4 container mx-auto max-w-6xl">
        <Card variant="secondary" className="p-4 mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--fg)] mb-3">
            <Filter size={16} />
            Refine results
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm"
              placeholder="Graduation year"
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
            />
            <input
              className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <input
              className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm"
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            <input
              className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm"
              placeholder="Company"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            />
            <input
              className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm"
              placeholder="Industry"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            />
          </div>
        </Card>
      </section>

      <section className="py-8 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-[var(--muted)]">Loading alumni...</p>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--muted)]">
                {alumni.length === 0
                  ? 'No alumni profiles yet. Invite your cohort to sign up.'
                  : 'No alumni match your filters. Try adjusting search or filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAlumni.map((alumniItem) => (
                <Card key={alumniItem.id} variant="primary">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-md bg-neutral-200 dark:bg-neutral-700 mx-auto mb-4 flex items-center justify-center shadow-subtle">
                      <span className="text-[var(--fg)] font-semibold text-lg">
                        {alumniItem.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-[var(--fg)]">{alumniItem.name}</h3>
                      {alumniItem.verifiedAlumni && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400" title="Verified alumni">
                          <BadgeCheck size={16} />
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-1 text-[var(--muted)]">{alumniItem.currentPosition || 'Alumni'}</p>
                    {alumniItem.currentCompany && (
                      <p className="text-sm text-[var(--muted)] flex items-center justify-center gap-2">
                        <Building2 size={16} />
                        {alumniItem.currentCompany}
                      </p>
                    )}

                    <div className="space-y-1 mt-3 mb-4">
                      {alumniItem.location && (
                        <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
                          <MapPin size={14} />
                          <span>{alumniItem.location}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
                        <Calendar size={14} />
                        <span>Class of {alumniItem.graduationYear}</span>
                      </div>
                    </div>

                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-md p-3 mb-4">
                      <p className="text-sm font-medium text-[var(--fg)]">{alumniItem.degree}</p>
                      <p className="text-xs text-[var(--muted)]">{alumniItem.department}</p>
                    </div>

                    {alumniItem.bio && (
                      <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">
                        {alumniItem.bio.length > 120 ? `${alumniItem.bio.substring(0, 120)}...` : alumniItem.bio}
                      </p>
                    )}

                    {alumniItem.skills && alumniItem.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {alumniItem.skills.slice(0, 4).map((skill: string) => (
                            <span
                              key={skill}
                              className="bg-neutral-100 dark:bg-neutral-800 text-[var(--fg)] px-2 py-1 border border-[var(--border)] text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {alumniItem.skills.length > 4 && (
                            <span className="bg-neutral-100 dark:bg-neutral-800 text-[var(--fg)] px-2 py-1 border border-[var(--border)] text-xs rounded">
                              +{alumniItem.skills.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-xs text-[var(--muted)]">{(alumniItem.achievements || []).length} Achievements</p>
                    </div>

                    {alumniItem.socialLinks && alumniItem.profileVisibility !== 'private' && (
                      <div className="flex justify-center gap-2 mb-4">
                        {alumniItem.socialLinks.linkedin && (
                          <a
                            href={alumniItem.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            aria-label="LinkedIn"
                          >
                            <Linkedin size={14} />
                          </a>
                        )}
                        {alumniItem.socialLinks.github && (
                          <a
                            href={alumniItem.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            aria-label="GitHub"
                          >
                            <Github size={14} />
                          </a>
                        )}
                        {alumniItem.socialLinks.personal && (
                          <a
                            href={alumniItem.socialLinks.personal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            aria-label="Personal Website"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button variant="primary" size="sm" className="w-full">
                        <Link to={`/alumni/${alumniItem.id}`} className="flex items-center justify-center gap-2 w-full">
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Alumni;
