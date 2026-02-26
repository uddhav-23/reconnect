import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Building2, Calendar, Github, Linkedin, ExternalLink } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getAlumni } from '../services/firebaseFirestore';
import { mockAlumni } from '../data/mockData';

const Alumni: React.FC = () => {
  const [alumni, setAlumni] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [usingMockData, setUsingMockData] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    // Initialize search from query param if present
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
      setUsingMockData(false);
      
      // Try to fetch from Firebase
      const alumniData = await getAlumni();
      
      if (alumniData && alumniData.length > 0) {
        setAlumni(alumniData);
      } else {
        // If Firebase returns empty array, use mock data
        console.warn('No alumni found in Firebase, using mock data');
        setAlumni(mockAlumni);
        setUsingMockData(true);
      }
    } catch (error: any) {
      console.error('Error loading alumni from Firebase:', error);
      
      // Check if it's a permission error
      const isPermissionError = error?.code === 'permission-denied' || 
                                error?.message?.toLowerCase().includes('permission') ||
                                error?.message?.toLowerCase().includes('rules');
      
      // Fallback to mock data if Firebase fails
      console.log('Falling back to mock data');
      setAlumni(mockAlumni);
      setUsingMockData(true);
      
      if (isPermissionError) {
        setError('Firebase permissions issue. Please check your Firestore security rules. Showing sample data.');
      } else {
        setError('Unable to connect to Firebase. Showing sample data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredAlumni = normalizedSearch
    ? alumni.filter((a) => {
        const skills: string[] = a.skills || [];
        const haystack = [
          a.name,
          a.email,
          a.currentCompany,
          a.currentPosition,
          a.location,
          a.degree,
          a.department,
          ...(skills || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : alumni;
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 px-4 bg-gradient-to-b from-[var(--bg)] to-neutral-100 dark:to-neutral-900">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
            Alumni Directory
          </h1>
          <p className="text-base md:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-6">
            Connect with {filteredAlumni.length}+ successful graduates
          </p>
          {error && (
            <div className="max-w-xl mx-auto mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md">
              <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
            </div>
          )}
          {usingMockData && !error && (
            <div className="max-w-xl mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Showing sample data. Configure Firebase to see real alumni data.
              </p>
            </div>
          )}
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, skills, company, degree, location..."
              className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors duration-200 font-mono text-sm"
            />
          </div>
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-[var(--muted)]">Loading alumni...</p>
            </div>
          ) : filteredAlumni.length === 0 && searchTerm ? (
            <div className="text-center py-8">
              <p className="text-[var(--muted)]">
                No alumni found for &quot;{searchTerm}&quot;
              </p>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--muted)]">
                No alumni found. Try refreshing the page or check your Firebase configuration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAlumni.map((alumniItem) => (
                <Card key={alumniItem.id} variant="primary">
                  <div className="text-center">
                    {/* Profile Picture */}
                    <div className="w-16 h-16 rounded-md bg-neutral-200 dark:bg-neutral-700 mx-auto mb-4 flex items-center justify-center shadow-subtle">
                      <span className="text-[var(--fg)] font-semibold text-lg">
                        {alumniItem.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>

                    {/* Basic Info */}
                    <h3 className="font-semibold text-lg mb-1 text-[var(--fg)]">
                      {alumniItem.name}
                    </h3>
                    <p className="text-sm mb-1 text-[var(--muted)]">
                      {alumniItem.currentPosition || 'Alumni'}
                    </p>
                    {alumniItem.currentCompany && (
                      <p className="text-sm text-[var(--muted)] flex items-center justify-center gap-2">
                        <Building2 size={16} />
                        {alumniItem.currentCompany}
                      </p>
                    )}

                    {/* Location & Year */}
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

                    {/* Education */}
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-md p-3 mb-4">
                      <p className="text-sm font-medium text-[var(--fg)]">
                        {alumniItem.degree}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {alumniItem.department}
                      </p>
                    </div>

                    {/* Bio */}
                    {alumniItem.bio && (
                      <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">
                        {alumniItem.bio.length > 120 ? `${alumniItem.bio.substring(0, 120)}...` : alumniItem.bio}
                      </p>
                    )}

                    {/* Skills */}
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

                    {/* Achievements Count */}
                    <div className="mb-4">
                      <p className="text-xs text-[var(--muted)]">
                        {(alumniItem.achievements || []).length} Achievements
                      </p>
                    </div>

                    {/* Social Links */}
                    {alumniItem.socialLinks && (
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

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button variant="primary" size="sm" className="w-full">
                        <Link to={`/alumni/${alumniItem.id}`} className="flex items-center justify-center gap-2 w-full">
                          View Profile
                        </Link>
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full">
                        Connect
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