import React from 'react';
import { Users, BookOpen, Award, TrendingUp, Plus, UserPlus, Edit } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import AddAlumniForm from '../../components/forms/AddAlumniForm';
import EditProfileForm from '../../components/forms/EditProfileForm';
import { useAuth } from '../../contexts/AuthContext';
import { getAlumni, createAlumni, updateAlumni, deleteAlumni, getBlogs, deleteBlog } from '../../services/firebaseFirestore';
import { createUser } from '../../services/firebaseAuth';
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
    { label: 'Alumni Managed', value: collegeAlumni.length, icon: Users, color: 'bg-[#FF0080]' },
    { label: 'Active Blogs', value: collegeBlogs.length, icon: BookOpen, color: 'bg-[#00FF80]' },
    { label: 'Total Achievements', value: '23', icon: Award, color: 'bg-[#0080FF]' },
    { label: 'Monthly Growth', value: '8%', icon: TrendingUp, color: 'bg-[#FF4444]' },
  ];

  const handleAddAlumni = async (alumniData: any) => {
    try {
      // Create user account first
      await createUser(alumniData.email, alumniData.password, {
        name: alumniData.name,
        role: 'alumni',
        universityId: user?.universityId || '1',
        collegeId: user?.collegeId || '1',
        phone: alumniData.phone,
      });

      // Create alumni profile in Firestore
      const alumniPayload = {
        email: alumniData.email,
        name: alumniData.name,
        role: 'alumni' as const,
        universityId: user?.universityId || '1',
        collegeId: user?.collegeId || '1',
        graduationYear: alumniData.graduationYear,
        degree: alumniData.degree,
        department: alumniData.department,
        currentCompany: alumniData.currentCompany,
        currentPosition: alumniData.currentPosition,
        location: alumniData.location,
        bio: alumniData.bio,
        skills: alumniData.skills,
        socialLinks: alumniData.socialLinks,
        phone: alumniData.phone,
        address: alumniData.address,
        connections: [],
        achievements: [],
        blogs: [],
        experience: [],
        education: [],
      };

      await createAlumni(alumniPayload);
      
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
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black font-mono uppercase text-black transform skew-y-1 mb-2">
              COLLEGE ADMIN
              <span className="text-[#00FF80] block">DASHBOARD</span>
            </h1>
            <p className="font-mono text-lg text-gray-600 uppercase">
              Welcome back, {user?.name}
            </p>
            <p className="font-mono text-sm text-[#FF0080] font-bold">
              COLLEGE OF ENGINEERING
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              onClick={() => setShowEditProfile(true)}
              className="flex items-center gap-2"
            >
              <Edit size={20} />
              EDIT PROFILE
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setShowAddAlumni(true)}
              className="flex items-center gap-2"
            >
            <UserPlus size={20} />
            ADD ALUMNI
          </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label} 
            variant="primary" 
            className={`text-center transform ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}
          >
            <div className={`w-16 h-16 ${stat.color} border-4 border-black mx-auto mb-4 flex items-center justify-center transform rotate-12`}>
              <stat.icon size={32} className="text-white" />
            </div>
            <div className="font-black font-mono text-3xl text-black mb-2">
              {stat.value}
            </div>
            <div className="font-bold font-mono text-sm text-gray-600 uppercase">
              {stat.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Alumni Management */}
        <Card variant="secondary" className="transform -rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black font-mono text-2xl text-black uppercase">
              ALUMNI MANAGEMENT
            </h2>
            <Button variant="primary" size="sm">
              <Plus size={16} />
              <span onClick={() => setShowAddAlumni(true)}>ADD NEW</span>
            </Button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="font-mono text-center py-4">Loading alumni...</p>
            ) : collegeAlumni.length === 0 ? (
              <p className="font-mono text-center py-4 text-gray-500">No alumni found. Add your first alumni!</p>
            ) : (
              collegeAlumni.slice(0, 3).map((alumni, index) => (
              <div key={alumni.id} className="bg-white border-4 border-black p-4 transform rotate-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold font-mono text-black uppercase">
                      {alumni.name}
                    </h3>
                    <p className="font-mono text-sm text-gray-600">
                      {alumni.currentPosition} at {alumni.currentCompany}
                    </p>
                    <p className="font-mono text-xs text-[#0080FF]">
                      Class of {alumni.graduationYear}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleEditAlumni(alumni)}>
                      EDIT
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteAlumni(alumni.id, alumni.name)}>
                      DELETE
                    </Button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </Card>

        {/* Blog Management */}
        <Card variant="accent" className="transform rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black font-mono text-2xl text-white uppercase">
              BLOG MANAGEMENT
            </h2>
            <Button variant="secondary" size="sm">
              VIEW ALL
            </Button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="font-mono text-center py-4">Loading blogs...</p>
            ) : collegeBlogs.length === 0 ? (
              <p className="font-mono text-center py-4 text-gray-500">No blogs found.</p>
            ) : (
              collegeBlogs.map((blog, index) => (
              <div key={blog.id} className="bg-white border-4 border-black p-4 transform -rotate-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold font-mono text-black uppercase text-sm">
                      {blog.title}
                    </h3>
                    <p className="font-mono text-sm text-gray-600">
                      By {blog.author.name}
                    </p>
                    <p className="font-mono text-xs text-[#FF0080]">
                      {blog.likes} likes • {blog.tags.length} tags
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">
                      EDIT
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteBlog(blog.id, blog.title)}>
                      DELETE
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
      <Card variant="primary" className="transform rotate-0">
        <div className="mb-6">
          <h2 className="font-black font-mono text-2xl text-black uppercase">
            QUICK ACTIONS
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" className="flex items-center justify-center gap-2 py-6">
            <UserPlus size={24} />
            <span onClick={() => setShowAddAlumni(true)}>ADD NEW ALUMNI</span>
          </Button>
          
          <Button variant="secondary" className="flex items-center justify-center gap-2 py-6">
            <BookOpen size={24} />
            <span>MANAGE BLOGS</span>
          </Button>
          
          <Button variant="success" className="flex items-center justify-center gap-2 py-6">
            <Award size={24} />
            <span>VIEW ACHIEVEMENTS</span>
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