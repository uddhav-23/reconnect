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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading profile...</p>
      </div>
    );
  }

  if (notFound || !alumni) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="primary" className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--fg)] mb-4">Alumni Not Found</h1>
          <Button variant="primary" onClick={() => navigate('/alumni')}>
            Back to Alumni
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
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 px-4 bg-gradient-to-b from-[var(--bg)] to-neutral-100 dark:to-neutral-900">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Profile Picture */}
            <div className="w-24 h-24 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shadow-subtle">
              <span className="text-[var(--fg)] font-semibold text-2xl">
                {alumni.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-[var(--fg)]">
                {alumni.name}
              </h1>
              <div className="space-y-2 mb-6">
                <p className="text-lg font-medium text-[var(--fg)]">
                  {alumni.currentPosition}
                </p>
                <p className="text-base text-[var(--muted)] flex items-center gap-2">
                  <Building2 size={18} />
                  {alumni.currentCompany}
                </p>
                <p className="text-sm text-[var(--muted)] flex items-center gap-2">
                  <MapPin size={16} />
                  {alumni.location}
                </p>
                <p className="text-sm text-[var(--muted)] flex items-center gap-2">
                  <Calendar size={16} />
                  Class of {alumni.graduationYear}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant={isConnected ? "success" : hasRequestedConnection ? "secondary" : "secondary"} 
                  onClick={handleConnect}
                  disabled={isConnecting || isConnected || hasRequestedConnection}
                  className="flex items-center gap-2"
                >
                  <Users size={16} />
                  {isConnected
                    ? 'Connected'
                    : hasRequestedConnection
                    ? 'Request Sent'
                    : isConnecting
                    ? 'Sending...'
                    : 'Connect'}
                </Button>
                <Button variant="primary" onClick={handleMessage} className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  Message
                </Button>
                <Button variant="success" className="flex items-center gap-2">
                  <Share2 size={16} />
                  Share Profile
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
            <Card variant="secondary">
              <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">
                Contact Info
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[var(--muted)]" />
                  <span className="text-sm text-[var(--fg)]">{alumni.email}</span>
                </div>
                {alumni.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-[var(--muted)]" />
                    <span className="text-sm text-[var(--fg)]">{alumni.phone}</span>
                  </div>
                )}
                {alumni.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-[var(--muted)] mt-1" />
                    <span className="text-sm text-[var(--fg)]">{alumni.address}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Social Links */}
            <Card variant="accent">
              <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">
                Social Links
              </h2>
              <div className="space-y-3">
                {alumni.socialLinks.linkedin && (
                  <a 
                    href={alumni.socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[var(--fg)] hover:text-[var(--primary)] transition-colors"
                  >
                    <Linkedin size={16} />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
                {alumni.socialLinks.github && (
                  <a 
                    href={alumni.socialLinks.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[var(--fg)] hover:text-[var(--primary)] transition-colors"
                  >
                    <Github size={16} />
                    <span className="text-sm">GitHub</span>
                  </a>
                )}
                {alumni.socialLinks.instagram && (
                  <a 
                    href={alumni.socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[var(--fg)] hover:text-[var(--primary)] transition-colors"
                  >
                    <Instagram size={16} />
                    <span className="text-sm">Instagram</span>
                  </a>
                )}
                {alumni.socialLinks.personal && (
                  <a 
                    href={alumni.socialLinks.personal} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[var(--fg)] hover:text-[var(--primary)] transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span className="text-sm">Personal Website</span>
                  </a>
                )}
              </div>
            </Card>

            {/* Skills */}
            <Card variant="primary">
              <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {alumni.skills.map((skill) => (
                  <span 
                    key={skill}
                    className="bg-neutral-100 dark:bg-neutral-800 text-[var(--fg)] px-2 py-1 border border-[var(--border)] text-xs rounded"
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
            <Card variant="primary">
              <h2 className="text-2xl font-semibold text-[var(--fg)] mb-4">
                About
              </h2>
              <p className="text-[var(--muted)] leading-relaxed">
                {alumni.bio}
              </p>
            </Card>

            {/* Education */}
            <Card variant="secondary">
              <h2 className="text-2xl font-semibold text-[var(--fg)] mb-6 flex items-center gap-3">
                <GraduationCap size={24} />
                Education
              </h2>
              <div className="space-y-4">
                {alumni.education.map((edu) => (
                  <div key={edu.id} className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4">
                    <h3 className="font-semibold text-[var(--fg)] mb-1">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                      {edu.institution}
                    </p>
                    <p className="text-sm text-[var(--muted)] mt-1">
                      {edu.startYear} - {edu.endYear || 'Present'}
                    </p>
                    {edu.grade && (
                      <p className="text-sm text-[var(--muted)] mt-1">
                        Grade: {edu.grade}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Work Experience */}
            <Card variant="accent">
              <h2 className="text-2xl font-semibold text-[var(--fg)] mb-6 flex items-center gap-3">
                <Briefcase size={24} />
                Work Experience
              </h2>
              <div className="space-y-4">
                {alumni.experience.map((exp) => (
                  <div key={exp.id} className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-[var(--fg)]">
                          {exp.position}
                        </h3>
                        <p className="text-sm text-[var(--muted)]">
                          {exp.company}
                        </p>
                      </div>
                      {exp.current && (
                        <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 text-xs rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted)] mb-2">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card variant="primary">
              <h2 className="text-2xl font-semibold text-[var(--fg)] mb-6 flex items-center gap-3">
                <Award size={24} />
                Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alumni.achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[var(--primary)] rounded-md flex items-center justify-center flex-shrink-0">
                        <Award size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-[var(--fg)] mb-1">
                          {achievement.title}
                        </h3>
                        <p className="text-xs text-[var(--muted)] mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="bg-neutral-200 dark:bg-neutral-700 text-[var(--fg)] px-2 py-1 text-xs rounded">
                            {achievement.category}
                          </span>
                          <span className="text-xs text-[var(--muted)]">
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
              <Card variant="secondary">
                <h2 className="text-2xl font-semibold text-[var(--fg)] mb-6">
                  Recent Blogs
                </h2>
                <div className="space-y-4">
                  {alumni.blogs.slice(0, 3).map((blog) => (
                    <div key={blog.id} className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4">
                      <h3 className="font-semibold text-sm text-[var(--fg)] mb-2">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-[var(--muted)] mb-3">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                            <Heart size={12} />
                            {blog.likes}
                          </span>
                          <span className="text-xs text-[var(--muted)]">
                            {blog.publishedAt}
                          </span>
                        </div>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => navigate(`/blog/${blog.id}`)}
                        >
                          Read More
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
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">
              Login Required
            </h2>
            <p className="text-[var(--muted)] mb-6">
              You need to be logged in to connect with alumni and access messaging features.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="primary" 
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                Login
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowConnectModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="primary" className="max-w-lg w-full">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
              <MessageCircle size={18} />
              Send Message
            </h2>
            <p className="text-sm text-[var(--muted)] mb-3">
              To: <span className="font-medium text-[var(--fg)]">{alumni.name}</span>
            </p>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors duration-200 mb-4"
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
                {isSendingMessage ? 'Sending...' : 'Send'}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowMessageModal(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AlumniProfile;