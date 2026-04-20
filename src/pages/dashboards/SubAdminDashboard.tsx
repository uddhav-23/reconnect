import React from 'react';
import { Users, BookOpen, Award, TrendingUp, Plus, UserPlus, Edit } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import AddAlumniForm from '../../components/forms/AddAlumniForm';
import EditProfileForm from '../../components/forms/EditProfileForm';
import { useAuth } from '../../contexts/AuthContext';
import { getAlumni, updateAlumni, deleteAlumni, getBlogs, deleteBlog } from '../../services/firebaseFirestore';
import { createUserAsAdmin } from '../../services/firebaseAuth';
import EditAlumniForm from '../../components/forms/EditAlumniForm';

const SubAdminDashboard: React.FC = () => {
  const { user } = useAuth();
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
    { label: 'Alumni Managed', value: collegeAlumni.length, icon: Users },
    { label: 'Active Blogs', value: collegeBlogs.length, icon: BookOpen },
    { label: 'Total Achievements', value: '23', icon: Award },
    { label: 'Monthly Growth', value: '8%', icon: TrendingUp },
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
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2 text-[var(--fg)]">
              College Admin Dashboard
            </h1>
            <p className="text-base text-[var(--muted)]">
              Welcome back, {user?.name}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button 
              variant="secondary" 
              onClick={() => setShowEditProfile(true)}
              className="flex items-center gap-2"
            >
              <Edit size={18} />
              Edit Profile
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setShowAddAlumni(true)}
              className="flex items-center gap-2"
            >
              <UserPlus size={18} />
              Add Alumni
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            variant="primary" 
            className="text-center"
          >
            <div className="w-16 h-16 rounded-md bg-neutral-200 dark:bg-neutral-700 mx-auto mb-4 flex items-center justify-center shadow-subtle">
              <stat.icon size={28} className="text-[var(--fg)]" />
            </div>
            <div className="text-3xl font-semibold text-[var(--fg)] mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-[var(--muted)]">
              {stat.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Alumni Management */}
        <Card variant="secondary">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-[var(--fg)]">
              Alumni Management
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
              <div key={alumni.id} className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4">
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
        <Card variant="accent">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-[var(--fg)]">
              Blog Management
            </h2>
            <Button variant="secondary" size="sm">
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
              <div key={blog.id} className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4">
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
                    <Button variant="primary" size="sm">
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
      <Card variant="primary">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--fg)]">
            Quick Actions
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" className="flex items-center justify-center gap-2 py-6" onClick={() => setShowAddAlumni(true)}>
            <UserPlus size={24} />
            <span>Add New Alumni</span>
          </Button>
          
          <Button variant="secondary" className="flex items-center justify-center gap-2 py-6">
            <BookOpen size={24} />
            <span>Manage Blogs</span>
          </Button>
          
          <Button variant="success" className="flex items-center justify-center gap-2 py-6">
            <Award size={24} />
            <span>View Achievements</span>
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