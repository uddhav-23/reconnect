import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Building2, Calendar, Github, Linkedin, ExternalLink } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getAlumni } from '../services/firebaseFirestore';

const Alumni: React.FC = () => {
  const [alumni, setAlumni] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
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
      const alumniData = await getAlumni();
      setAlumni(alumniData);
    } catch (error) {
      console.error('Error loading alumni:', error);
      alert('Failed to load alumni. Please check your Firebase configuration.');
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-[#00FF80] border-b-4 border-black py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-7xl font-black font-mono uppercase text-black text-center transform -skew-y-1">
            ALUMNI
            <br />
            <span className="text-[#FF0080]">DIRECTORY</span>
          </h1>
          <p className="text-xl font-bold font-mono uppercase text-center mt-6 text-black">
            Connect with {filteredAlumni.length}+ successful graduates
          </p>
          <div className="mt-6 max-w-xl mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, skills, company, degree, location..."
              className="w-full px-4 py-3 border-4 border-black font-mono text-sm shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200"
            />
          </div>
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <p className="font-mono text-lg">Loading alumni...</p>
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="font-mono text-lg text-gray-500">
                  No alumni found for &quot;{searchTerm}&quot;
                </p>
              </div>
            ) : (
              filteredAlumni.map((alumniItem, index) => (
              <Card 
                key={alumniItem.id} 
                variant="primary" 
                className={`transform ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'} hover:scale-105 transition-transform`}
              >
                {/* Profile Picture */}
                <div className="w-24 h-24 bg-[#FF0080] border-4 border-black mx-auto mb-6 flex items-center justify-center transform -rotate-12">
                  <span className="text-white font-black font-mono text-2xl">
                    {alumniItem.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>

                {/* Basic Info */}
                <div className="text-center mb-6">
                  <h3 className="font-black font-mono text-xl mb-2 text-black uppercase">
                    {alumniItem.name}
                  </h3>
                  <p className="font-bold font-mono text-sm mb-1 text-[#FF0080] uppercase">
                    {alumniItem.currentPosition || 'Alumni'}
                  </p>
                  {alumniItem.currentCompany && (
                    <p className="font-bold font-mono text-sm text-[#0080FF] uppercase flex items-center justify-center gap-2">
                      <Building2 size={16} />
                      {alumniItem.currentCompany}
                    </p>
                  )}
                </div>

                {/* Location & Year */}
                <div className="space-y-2 mb-6">
                  {alumniItem.location && (
                    <div className="flex items-center justify-center gap-2 font-mono text-sm">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="text-black">{alumniItem.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 font-mono text-sm">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-black">Class of {alumniItem.graduationYear}</span>
                  </div>
                </div>

                {/* Education */}
                <div className="bg-[#00FF80] border-2 border-black p-3 mb-6 transform rotate-1">
                  <p className="font-bold font-mono text-sm text-black uppercase text-center">
                    {alumniItem.degree}
                  </p>
                  <p className="font-mono text-xs text-black text-center">
                    {alumniItem.department}
                  </p>
                </div>

                {/* Bio */}
                {alumniItem.bio && (
                  <p className="font-mono text-sm text-gray-700 mb-6 text-center">
                    {alumniItem.bio.length > 120 ? `${alumniItem.bio.substring(0, 120)}...` : alumniItem.bio}
                  </p>
                )}

                {/* Skills */}
                {alumniItem.skills && alumniItem.skills.length > 0 && (
                  <div className="mb-6">
                    <p className="font-bold font-mono text-sm text-black uppercase mb-3 text-center">
                      Skills:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {alumniItem.skills.slice(0, 4).map((skill: string) => (
                        <span 
                          key={skill}
                          className="bg-[#0080FF] text-white px-2 py-1 border-2 border-black font-mono text-xs font-bold uppercase"
                        >
                          {skill}
                        </span>
                      ))}
                      {alumniItem.skills.length > 4 && (
                        <span className="bg-gray-200 text-black px-2 py-1 border-2 border-black font-mono text-xs font-bold">
                          +{alumniItem.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Achievements Count */}
                <div className="bg-[#FF0080] border-2 border-black p-3 mb-6 text-center">
                  <p className="font-black font-mono text-white uppercase">
                    {(alumniItem.achievements || []).length} Achievements
                  </p>
                </div>

                {/* Social Links */}
                {alumniItem.socialLinks && (
                  <div className="flex justify-center gap-3 mb-6">
                    {alumniItem.socialLinks.linkedin && (
                      <a 
                        href={alumniItem.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-[#0080FF] border-2 border-black p-2 hover:bg-[#0066CC] transition-colors"
                      >
                        <Linkedin size={16} className="text-white" />
                      </a>
                    )}
                    {alumniItem.socialLinks.github && (
                      <a 
                        href={alumniItem.socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-black border-2 border-black p-2 hover:bg-gray-800 transition-colors"
                      >
                        <Github size={16} className="text-white" />
                      </a>
                    )}
                    {alumniItem.socialLinks.personal && (
                      <a 
                        href={alumniItem.socialLinks.personal} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-[#00FF80] border-2 border-black p-2 hover:bg-[#00E673] transition-colors"
                      >
                        <ExternalLink size={16} className="text-black" />
                      </a>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button variant="primary" size="sm" className="w-full">
                    <Link to={`/alumni/${alumniItem.id}`} className="block w-full">
                      VIEW PROFILE
                    </Link>
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full">
                    CONNECT
                  </Button>
                </div>
              </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Alumni;