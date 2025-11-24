import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Building2, Calendar, Github, Linkedin, ExternalLink, 
  Mail, Phone, Award, Briefcase, GraduationCap, Users, MessageCircle,
  Share2, Heart, Instagram
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { getAlumniById, createConnection, createMessage } from '../services/firebaseFirestore';
import { Alumni } from '../types';

const AlumniProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasRequestedConnection, setHasRequestedConnection] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    const loadAlumni = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const alumniData = await getAlumniById(id);
        if (!alumniData) {
          setNotFound(true);
        } else {
          setAlumni(alumniData);
        }
      } catch (error) {
        console.error('Error loading alumni profile:', error);
        alert('Failed to load alumni profile. Please check your Firebase configuration.');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadAlumni();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-mono text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (notFound || !alumni) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card variant="primary" className="text-center">
          <h1 className="text-2xl font-black font-mono text-black mb-4">ALUMNI NOT FOUND</h1>
          <Button variant="primary" onClick={() => navigate('/alumni')}>
            BACK TO ALUMNI
          </Button>
        </Card>
      </div>
    );
  }

  const isConnected = user != null && alumni.connections?.includes(user.id);

  const handleConnect = async () => {
    if (!user) {
      setShowConnectModal(true);
      return;
    }
    
    if (user.id === alumni.id) {
      alert("You can't connect with yourself.");
      return;
    }

    try {
      setIsConnecting(true);
      await createConnection({
        requesterId: user.id,
        receiverId: alumni.id,
        status: 'pending',
      });
      setHasRequestedConnection(true);
      alert('Connection request sent!');
    } catch (error: any) {
      console.error('Error creating connection:', error);
      alert(`Failed to send connection request: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = () => {
    if (!user) {
      setShowConnectModal(true);
      return;
    }
    
    setShowMessageModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-[#0080FF] border-b-4 border-black py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Profile Picture */}
            <div className="w-32 h-32 bg-[#FF0080] border-4 border-black flex items-center justify-center transform -rotate-6">
              <span className="text-white font-black font-mono text-4xl">
                {alumni.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-black font-mono uppercase text-white mb-4 transform skew-y-1">
                {alumni.name}
              </h1>
              <div className="space-y-2 mb-6">
                <p className="text-xl font-bold font-mono text-[#00FF80] uppercase">
                  {alumni.currentPosition}
                </p>
                <p className="text-lg font-bold font-mono text-white flex items-center gap-2">
                  <Building2 size={20} />
                  {alumni.currentCompany}
                </p>
                <p className="font-mono text-white flex items-center gap-2">
                  <MapPin size={16} />
                  {alumni.location}
                </p>
                <p className="font-mono text-white flex items-center gap-2">
                  <Calendar size={16} />
                  Class of {alumni.graduationYear}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant={isConnected ? "success" : hasRequestedConnection ? "secondary" : "secondary"} 
                  onClick={handleConnect}
                  disabled={isConnecting || isConnected || hasRequestedConnection}
                  className="flex items-center gap-2"
                >
                  <Users size={16} />
                  {isConnected
                    ? 'CONNECTED'
                    : hasRequestedConnection
                    ? 'REQUEST SENT'
                    : isConnecting
                    ? 'SENDING...'
                    : 'CONNECT'}
                </Button>
                <Button variant="primary" onClick={handleMessage} className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  MESSAGE
                </Button>
                <Button variant="success" className="flex items-center gap-2">
                  <Share2 size={16} />
                  SHARE PROFILE
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Contact Info */}
            <Card variant="secondary" className="transform rotate-1">
              <h2 className="font-black font-mono text-xl text-black uppercase mb-4">
                CONTACT INFO
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-600" />
                  <span className="font-mono text-sm">{alumni.email}</span>
                </div>
                {alumni.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-600" />
                    <span className="font-mono text-sm">{alumni.phone}</span>
                  </div>
                )}
                {alumni.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-600 mt-1" />
                    <span className="font-mono text-sm">{alumni.address}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Social Links */}
            <Card variant="accent" className="transform -rotate-1">
              <h2 className="font-black font-mono text-xl text-white uppercase mb-4">
                SOCIAL LINKS
              </h2>
              <div className="space-y-3">
                {alumni.socialLinks.linkedin && (
                  <a 
                    href={alumni.socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white hover:text-[#00FF80] transition-colors"
                  >
                    <Linkedin size={16} />
                    <span className="font-mono text-sm">LinkedIn</span>
                  </a>
                )}
                {alumni.socialLinks.github && (
                  <a 
                    href={alumni.socialLinks.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white hover:text-[#00FF80] transition-colors"
                  >
                    <Github size={16} />
                    <span className="font-mono text-sm">GitHub</span>
                  </a>
                )}
                {alumni.socialLinks.instagram && (
                  <a 
                    href={alumni.socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white hover:text-[#00FF80] transition-colors"
                  >
                    <Instagram size={16} />
                    <span className="font-mono text-sm">Instagram</span>
                  </a>
                )}
                {alumni.socialLinks.personal && (
                  <a 
                    href={alumni.socialLinks.personal} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white hover:text-[#00FF80] transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span className="font-mono text-sm">Personal Website</span>
                  </a>
                )}
              </div>
            </Card>

            {/* Skills */}
            <Card variant="primary" className="transform rotate-1">
              <h2 className="font-black font-mono text-xl text-black uppercase mb-4">
                SKILLS
              </h2>
              <div className="flex flex-wrap gap-2">
                {alumni.skills.map((skill) => (
                  <span 
                    key={skill}
                    className="bg-[#0080FF] text-white px-3 py-1 border-2 border-black font-mono text-sm font-bold uppercase"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <Card variant="primary" className="transform -rotate-1">
              <h2 className="font-black font-mono text-2xl text-black uppercase mb-4">
                ABOUT
              </h2>
              <p className="font-mono text-gray-700 leading-relaxed">
                {alumni.bio}
              </p>
            </Card>

            {/* Education */}
            <Card variant="secondary" className="transform rotate-1">
              <h2 className="font-black font-mono text-2xl text-black uppercase mb-6 flex items-center gap-3">
                <GraduationCap size={24} />
                EDUCATION
              </h2>
              <div className="space-y-4">
                {alumni.education.map((edu) => (
                  <div key={edu.id} className="bg-white border-4 border-black p-4 transform -rotate-1">
                    <h3 className="font-bold font-mono text-black uppercase">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="font-mono text-sm text-gray-600">
                      {edu.institution}
                    </p>
                    <p className="font-mono text-sm text-[#0080FF]">
                      {edu.startYear} - {edu.endYear || 'Present'}
                    </p>
                    {edu.grade && (
                      <p className="font-mono text-sm text-[#FF0080] font-bold">
                        Grade: {edu.grade}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Work Experience */}
            <Card variant="accent" className="transform -rotate-1">
              <h2 className="font-black font-mono text-2xl text-white uppercase mb-6 flex items-center gap-3">
                <Briefcase size={24} />
                WORK EXPERIENCE
              </h2>
              <div className="space-y-4">
                {alumni.experience.map((exp) => (
                  <div key={exp.id} className="bg-white border-4 border-black p-4 transform rotate-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold font-mono text-black uppercase">
                          {exp.position}
                        </h3>
                        <p className="font-mono text-sm text-gray-600">
                          {exp.company}
                        </p>
                      </div>
                      {exp.current && (
                        <span className="bg-[#00FF80] text-black px-2 py-1 border-2 border-black font-mono text-xs font-bold uppercase">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-sm text-[#0080FF] mb-2">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </p>
                    <p className="font-mono text-sm text-gray-700">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card variant="primary" className="transform rotate-1">
              <h2 className="font-black font-mono text-2xl text-black uppercase mb-6 flex items-center gap-3">
                <Award size={24} />
                ACHIEVEMENTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alumni.achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-[#00FF80] border-4 border-black p-4 transform -rotate-1">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#FF0080] border-2 border-black flex items-center justify-center">
                        <Award size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold font-mono text-black uppercase text-sm mb-1">
                          {achievement.title}
                        </h3>
                        <p className="font-mono text-xs text-gray-700 mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="bg-[#0080FF] text-white px-2 py-1 border-2 border-black font-mono text-xs font-bold uppercase">
                            {achievement.category}
                          </span>
                          <span className="font-mono text-xs text-gray-600">
                            {achievement.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Blogs */}
            {alumni.blogs.length > 0 && (
              <Card variant="secondary" className="transform -rotate-1">
                <h2 className="font-black font-mono text-2xl text-black uppercase mb-6">
                  RECENT BLOGS
                </h2>
                <div className="space-y-4">
                  {alumni.blogs.slice(0, 3).map((blog) => (
                    <div key={blog.id} className="bg-white border-4 border-black p-4 transform rotate-1">
                      <h3 className="font-bold font-mono text-black uppercase text-sm mb-2">
                        {blog.title}
                      </h3>
                      <p className="font-mono text-xs text-gray-600 mb-3">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-xs text-[#FF0080] flex items-center gap-1">
                            <Heart size={12} />
                            {blog.likes}
                          </span>
                          <span className="font-mono text-xs text-gray-500">
                            {blog.publishedAt}
                          </span>
                        </div>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => navigate(`/blog/${blog.id}`)}
                        >
                          READ MORE
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="primary" className="max-w-md w-full">
            <h2 className="font-black font-mono text-xl text-black uppercase mb-4">
              LOGIN REQUIRED
            </h2>
            <p className="font-mono text-gray-700 mb-6">
              You need to be logged in to connect with alumni and access messaging features.
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
                onClick={() => setShowConnectModal(false)}
                className="flex-1"
              >
                CANCEL
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="primary" className="max-w-lg w-full transform rotate-1">
            <h2 className="font-black font-mono text-xl text-black uppercase mb-4 flex items-center gap-2">
              <MessageCircle size={18} />
              SEND MESSAGE
            </h2>
            <p className="font-mono text-sm text-gray-700 mb-3">
              To: <span className="font-bold">{alumni.name}</span>
            </p>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-4 border-black font-mono shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 bg-white mb-4"
              placeholder="Write your message..."
            />
            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                disabled={isSendingMessage}
                onClick={async () => {
                  if (!user) {
                    setShowMessageModal(false);
                    setShowConnectModal(true);
                    return;
                  }
                  const content = messageContent.trim();
                  if (!content) {
                    alert('Please enter a message.');
                    return;
                  }
                  try {
                    setIsSendingMessage(true);
                    await createMessage({
                      senderId: user.id,
                      receiverId: alumni.id,
                      content,
                    });
                    alert('Message sent!');
                    setMessageContent('');
                    setShowMessageModal(false);
                  } catch (error: any) {
                    console.error('Error sending message:', error);
                    alert(`Failed to send message: ${error.message}`);
                  } finally {
                    setIsSendingMessage(false);
                  }
                }}
              >
                {isSendingMessage ? 'SENDING...' : 'SEND'}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowMessageModal(false)}
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

export default AlumniProfile;