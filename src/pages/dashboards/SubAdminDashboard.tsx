import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Award, TrendingUp, Plus, UserPlus, Edit } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHero from '../../components/layout/PageHero';
import AddAlumniForm from '../../components/forms/AddAlumniForm';
import EditProfileForm from '../../components/forms/EditProfileForm';
import { useAuth } from '../../contexts/AuthContext';
import { getAlumni, updateAlumni, deleteAlumni, getBlogs, deleteBlog } from '../../services/firebaseFirestore';
import { createUserAsAdmin } from '../../services/firebaseAuth';
import EditAlumniForm from '../../components/forms/EditAlumniForm';

const SubAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddAlumni, setShowAddAlumni] = React.useState(false);
  const [showEditProfile, setShowEditProfile] = React.useState(false);
  const [showEditAlumni, setShowEditAlumni] = React.useState(false);
  const [selectedAlumni, setSelectedAlumni] = React.useState<any>(null);
  const [collegeAlumni, setCollegeAlumni] = React.useState<any[]>([]);
  const [collegeBlogs, setCollegeBlogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.collegeId) return;
    
    try {
      setLoading(true);
      const [alumniData, blogsData] = await Promise.all([
        getAlumni(user.collegeId),
        getBlogs(),
      ]);
      setCollegeAlumni(alumniData);
      // Filter blogs by college alumni
      const alumniIds = alumniData.map(a => a.id);
      setCollegeBlogs(blogsData.filter(blog => alumniIds.includes(blog.authorId)));
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Alumni managed',
      value: collegeAlumni.length,
      icon: Users,
      accent:
        'border-violet-200/80 dark:border-violet-500/25 bg-gradient-to-br from-violet-50/90 to-white dark:from-violet-950/40 dark:to-[var(--card)]',
      iconClass: 'text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Active blogs',
      value: collegeBlogs.length,
      icon: BookOpen,
      accent:
        'border-cyan-200/80 dark:border-cyan-500/25 bg-gradient-to-br from-cyan-50/90 to-white dark:from-cyan-950/35 dark:to-[var(--card)]',
      iconClass: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Achievements (demo)',
      value: '23',
      icon: Award,
      accent:
        'border-amber-200/80 dark:border-amber-500/25 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/35 dark:to-[var(--card)]',
      iconClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Growth (demo)',
      value: '8%',
      icon: TrendingUp,
      accent:
        'border-rose-200/80 dark:border-rose-500/25 bg-gradient-to-br from-rose-50/90 to-white dark:from-rose-950/35 dark:to-[var(--card)]',
      iconClass: 'text-rose-600 dark:text-rose-400',
    },
  ];

  const handleAddAlumni = async (alumniData: any) => {
    try {
      const alumniPayload = {
        name: alumniData.name,
        role: 'alumni' as const,
        universityId: user?.universityId || '1',
        collegeId: user?.collegeId || '1',
        phone: alumniData.phone,
        graduationYear: alumniData.graduationYear,
        degree: alumniData.degree,
        department: alumniData.department,
        currentCompany: alumniData.currentCompany,
        currentPosition: alumniData.currentPosition,
        location: alumniData.location,
        bio: alumniData.bio,
        skills: Array.isArray(alumniData.skills) ? alumniData.skills : [],
        socialLinks: alumniData.socialLinks || {},
        address: alumniData.address,
        connections: [],
        achievements: [],
        blogs: [],
        experience: [],
        education: [],
      };

      await createUserAsAdmin(alumniData.email, alumniData.password, alumniPayload);
      
      // Reload data
      await loadData();
      
      // Show credentials
      const credentials = `✅ Alumni Created Successfully!\n\nDemo Login Credentials:\nEmail: ${alumniData.email}\nPassword: ${alumniData.password}\n\nShare these with the alumni for login.`;
      alert(credentials);
      setShowAddAlumni(false);
    } catch (error: any) {
      console.error('Error creating alumni:', error);
      alert(`Failed to create alumni: ${error.message}`);
    }
  };

  const handleEditAlumni = (alumni: any) => {
    setSelectedAlumni(alumni);
    setShowEditAlumni(true);
  };

  const handleUpdateAlumni = async (alumniId: string, updates: any) => {
    try {
      await updateAlumni(alumniId, updates);
      await loadData();
      alert('Alumni profile updated successfully!');
      setShowEditAlumni(false);
      setSelectedAlumni(null);
    } catch (error: any) {
      console.error('Error updating alumni:', error);
      alert(`Failed to update alumni: ${error.message}`);
    }
  };

  const handleDeleteAlumni = async (alumniId: string, alumniName: string) => {
    if (!confirm(`Are you sure you want to delete ${alumniName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAlumni(alumniId);
      await loadData();
      alert('Alumni deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting alumni:', error);
      alert(`Failed to delete alumni: ${error.message}`);
    }
  };

  const handleDeleteBlog = async (blogId: string, blogTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteBlog(blogId);
      await loadData();
      alert('Blog deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      alert(`Failed to delete blog: ${error.message}`);
    }
  };

  return (
    <>
    <div className="min-h-screen max-w-6xl mx-auto px-0 sm:px-2 pb-10">
      <PageHero
        eyebrow="College admin"
        title="College admin dashboard"
        titleGradientPart="College"
        subtitle={<>Welcome back, <span className="font-medium text-[var(--fg)]">{user?.name}</span></>}
        actions={
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowEditProfile(true)} className="flex items-center gap-2 rounded-xl h-9">
              <Edit size={18} />
              Edit profile
            </Button>
            <Button variant="primary" onClick={() => setShowAddAlumni(true)} className="flex items-center gap-2 rounded-xl h-9">
              <UserPlus size={18} />
              Add alumni
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-xl border p-3 sm:p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${stat.accent}`}
          >
            <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 mb-2 ${stat.iconClass}`} strokeWidth={2} />
            <div className="text-xl sm:text-2xl font-bold text-[var(--fg)] tabular-nums leading-none">{stat.value}</div>
            <div className="text-[11px] sm:text-xs text-[var(--muted)] mt-1 leading-snug font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Alumni Management */}
        <Card variant="secondary" className="border-violet-500/10">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
            <h2 className="text-lg font-bold text-[var(--fg)]">
              Alumni management
            </h2>
            <Button variant="primary" size="sm" onClick={() => setShowAddAlumni(true)}>
              <Plus size={16} />
              Add New
            </Button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-4 text-[var(--muted)]">Loading alumni...</p>
            ) : collegeAlumni.length === 0 ? (
              <p className="text-center py-4 text-[var(--muted)]">No alumni found. Add your first alumni!</p>
            ) : (
              collegeAlumni.slice(0, 3).map((alumni) => (
              <div key={alumni.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-semibold text-[var(--fg)] mb-1">
                      {alumni.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                      {alumni.currentPosition} at {alumni.currentCompany}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Class of {alumni.graduationYear}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleEditAlumni(alumni)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteAlumni(alumni.id, alumni.name)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </Card>

        {/* Blog Management */}
        <Card variant="accent" className="border-cyan-500/10">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
            <h2 className="text-lg font-bold text-[var(--fg)]">
              Blog management
            </h2>
            <Button variant="secondary" size="sm" onClick={() => navigate('/blogs')}>
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-4 text-[var(--muted)]">Loading blogs...</p>
            ) : collegeBlogs.length === 0 ? (
              <p className="text-center py-4 text-[var(--muted)]">No blogs found.</p>
            ) : (
              collegeBlogs.map((blog) => (
              <div key={blog.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--fg)] mb-1">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                      By {blog.author.name}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {blog.likes} likes • {blog.tags.length} tags
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => navigate(`/blog/${blog.id}`)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteBlog(blog.id, blog.title)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="primary" className="border-violet-500/10">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[var(--fg)]">
            Quick actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="primary" className="flex items-center justify-center gap-2 py-5 rounded-xl" onClick={() => setShowAddAlumni(true)}>
            <UserPlus size={22} />
            <span>Add alumni</span>
          </Button>

          <Button variant="secondary" className="flex items-center justify-center gap-2 py-5 rounded-xl" onClick={() => navigate('/blogs')}>
            <BookOpen size={22} />
            <span>Manage blogs</span>
          </Button>

          <Button variant="success" className="flex items-center justify-center gap-2 py-5 rounded-xl" onClick={() => navigate('/alumni')}>
            <Award size={22} />
            <span>Achievements</span>
          </Button>
        </div>
      </Card>
    </div>

    {/* Add Alumni Modal */}
    {showAddAlumni && (
      <AddAlumniForm
        onClose={() => setShowAddAlumni(false)}
        onSubmit={handleAddAlumni}
        collegeId={user?.collegeId || '1'}
        universityId={user?.universityId || '1'}
      />
    )}

    {/* Edit Profile Modal */}
    {showEditProfile && (
      <EditProfileForm onClose={() => setShowEditProfile(false)} />
    )}

    {/* Edit Alumni Modal */}
    {showEditAlumni && selectedAlumni && (
      <EditAlumniForm
        alumni={selectedAlumni}
        onClose={() => {
          setShowEditAlumni(false);
          setSelectedAlumni(null);
        }}
        onSubmit={handleUpdateAlumni}
      />
    )}
    </>
  );
};

export default SubAdminDashboard;