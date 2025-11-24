import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Settings, Edit, Plus, Eye, UserCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EditProfileForm from '../../components/forms/EditProfileForm';
import { useAuth } from '../../contexts/AuthContext';
import { getAlumniById, getBlogs, getAchievements, createAchievement, createBlog } from '../../services/firebaseFirestore';
import { Alumni, Achievement, Blog } from '../../types';

const AlumniDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = React.useState(false);
  const [currentAlumni, setCurrentAlumni] = React.useState<Alumni | null>(null);
  const [userBlogs, setUserBlogs] = React.useState<Blog[]>([]);
  const [userAchievements, setUserAchievements] = React.useState<Achievement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddAchievement, setShowAddAchievement] = React.useState(false);
  const [newAchievement, setNewAchievement] = React.useState({
    title: '',
    description: '',
    category: 'professional' as Achievement['category'],
  });

  React.useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        
        // Load alumni profile first
        let alumniData: Alumni | null = null;
        try {
          alumniData = await getAlumniById(user.id);
          if (alumniData) {
            setCurrentAlumni(alumniData);
          }
        } catch (error) {
          console.error('Error loading alumni profile:', error);
          // Don't show alert here - profile might just not exist
        }
        
        // Load blogs (handle errors gracefully)
        try {
          const blogsData = await getBlogs(user.id);
          setUserBlogs(blogsData);
        } catch (error) {
          console.error('Error loading blogs:', error);
          setUserBlogs([]); // Set empty array on error
        }
        
        // Load achievements (handle errors gracefully)
        try {
          const achievementsData = await getAchievements(user.id);
          setUserAchievements(achievementsData);
        } catch (error) {
          console.error('Error loading achievements:', error);
          setUserAchievements([]); // Set empty array on error
        }
        
      } catch (error) {
        console.error('Unexpected error loading dashboard data:', error);
        // Only show alert for unexpected errors
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleAddAchievement = async () => {
    if (!user || !currentAlumni) return;
    if (!newAchievement.title || !newAchievement.description) {
      alert('Please enter a title and description for the achievement.');
      return;
    }
    try {
      const achievementPayload: Omit<Achievement, 'id'> = {
        title: newAchievement.title,
        description: newAchievement.description,
        category: newAchievement.category,
        date: new Date().toISOString(),
        image: undefined,
        userId: user.id,
      };
      const achievementId = await createAchievement(achievementPayload);
      const created: Achievement = { id: achievementId, ...achievementPayload };
      setUserAchievements([created, ...userAchievements]);
      setNewAchievement({ title: '', description: '', category: 'professional' });
      setShowAddAchievement(false);
      alert('Achievement added successfully!');
    } catch (error: any) {
      console.error('Error adding achievement:', error);
      alert(`Failed to add achievement: ${error.message}`);
    }
  };
  
  const [showCreateBlog, setShowCreateBlog] = React.useState(false);
  const [blogData, setBlogData] = React.useState({
    title: '',
    content: '',
    tags: '',
  });

  const handleCreateBlog = async () => {
    if (!user || !currentAlumni) return;
    if (!blogData.title || !blogData.content) {
      alert('Please enter a title and content for the blog.');
      return;
    }
    try {
      const tagsArray = blogData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      const newBlogId = await createBlog({
        title: blogData.title,
        content: blogData.content,
        excerpt: blogData.content.length > 160 ? blogData.content.slice(0, 157) + '...' : blogData.content,
        coverImage: undefined,
        tags: tagsArray,
        authorId: user.id,
        publishedAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: [],
        shares: 0,
      });

      // Reload user's blogs
      const updatedBlogs = await getBlogs(user.id);
      setUserBlogs(updatedBlogs);

      setShowCreateBlog(false);
      setBlogData({ title: '', content: '', tags: '' });
      alert('Blog created successfully!');
      navigate(`/blog/${newBlogId}`);
    } catch (error: any) {
      console.error('Error creating blog:', error);
      alert(`Failed to create blog: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card variant="primary" className="text-center max-w-md">
          <h2 className="text-2xl font-black font-mono text-black mb-4">NOT AUTHENTICATED</h2>
          <p className="font-mono text-gray-600 mb-4">Please log in as an alumni to access this dashboard.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-mono text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!currentAlumni) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card variant="primary" className="text-center max-w-md">
          <h2 className="text-2xl font-black font-mono text-black mb-4">PROFILE NOT FOUND</h2>
          <p className="font-mono text-gray-600 mb-4">
            Your alumni profile has not been set up yet. Please contact your admin to create your alumni profile.
          </p>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: 'Profile Views', value: '124', icon: Eye, color: 'bg-[#FF0080]' },
    { label: 'Published Blogs', value: userBlogs.length, icon: BookOpen, color: 'bg-[#00FF80]' },
    { label: 'Achievements', value: userAchievements.length, icon: Award, color: 'bg-[#0080FF]' },
    { label: 'Network Connections', value: (currentAlumni.connections || []).length, icon: UserCheck, color: 'bg-[#FF4444]' },
  ];

  return (
    <>
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black font-mono uppercase text-black transform -skew-y-1 mb-2">
              ALUMNI
              <span className="text-[#0080FF] block">DASHBOARD</span>
            </h1>
            <p className="font-mono text-lg text-gray-600 uppercase">
              Welcome back, {currentAlumni.name}
            </p>
            <p className="font-mono text-sm text-[#FF0080] font-bold">
              {currentAlumni.currentPosition} at {currentAlumni.currentCompany}
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowEditProfile(true)}
            className="flex items-center gap-2"
          >
            <Settings size={20} />
            EDIT PROFILE
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label} 
            variant="primary" 
            className={`text-center transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
          >
            <div className={`w-16 h-16 ${stat.color} border-4 border-black mx-auto mb-4 flex items-center justify-center transform -rotate-12`}>
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

      {/* Profile & Content Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Profile Summary */}
        <Card variant="secondary" className="transform rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black font-mono text-2xl text-black uppercase">
              PROFILE SUMMARY
            </h2>
            <Button variant="primary" size="sm">
              <Edit size={16} />
              EDIT
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white border-4 border-black p-4 transform -rotate-1">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#FF0080] border-4 border-black flex items-center justify-center">
                  <span className="text-white font-black font-mono text-xl">
                    {currentAlumni.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold font-mono text-black uppercase">
                    {currentAlumni.name}
                  </h3>
                  <p className="font-mono text-sm text-gray-600">
                    {currentAlumni.degree}
                  </p>
                  <p className="font-mono text-sm text-[#0080FF]">
                    Class of {currentAlumni.graduationYear}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#00FF80] border-2 border-black p-4">
              <p className="font-mono text-sm text-black">
                <strong>Bio:</strong> {currentAlumni.bio}
              </p>
            </div>
            
            <div className="bg-[#0080FF] border-2 border-black p-4">
              <p className="font-mono text-sm text-white mb-2">
                <strong>Skills:</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {currentAlumni.skills.map((skill) => (
                  <span 
                    key={skill}
                    className="bg-white text-black px-2 py-1 border-2 border-black font-mono text-xs font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Blog Management */}
        <Card variant="accent" className="transform -rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black font-mono text-2xl text-white uppercase">
              MY BLOGS
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateBlog(true)}
            >
              <Plus size={16} />
              NEW BLOG
            </Button>
          </div>
          
          <div className="space-y-4">
            {userBlogs.map((blog) => (
              <div key={blog.id} className="bg-white border-4 border-black p-4 transform rotate-1">
                <div>
                  <h3 className="font-bold font-mono text-black uppercase text-sm mb-2">
                    {blog.title}
                  </h3>
                  <p className="font-mono text-xs text-gray-600 mb-3">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-[#FF0080]">
                        {blog.likes} likes
                      </span>
                      <span className="font-mono text-xs text-gray-500">
                        {blog.publishedAt}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="success" size="sm">
                        EDIT
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/blog/${blog.id}`)}
                      >
                        VIEW
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {userBlogs.length === 0 && (
              <div className="bg-white border-4 border-black p-8 text-center transform rotate-2">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="font-mono text-gray-600 mb-4">
                  You haven't published any blogs yet
                </p>
                <Button variant="primary" onClick={() => setShowCreateBlog(true)}>
                  WRITE YOUR FIRST BLOG
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <Card variant="primary" className="transform rotate-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black font-mono text-2xl text-black uppercase">
            MY ACHIEVEMENTS
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddAchievement(true)}
          >
            <Plus size={16} />
            ADD ACHIEVEMENT
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userAchievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={`bg-[#00FF80] border-4 border-black p-4 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FF0080] border-2 border-black flex items-center justify-center">
                  <Award size={24} className="text-white" />
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
          
          {userAchievements.length === 0 && (
            <div className="col-span-full bg-white border-4 border-black p-8 text-center transform -rotate-1">
              <Award size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="font-mono text-gray-600 mb-4">
                No achievements added yet
              </p>
              <Button variant="primary" onClick={() => setShowAddAchievement(true)}>
                ADD YOUR FIRST ACHIEVEMENT
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>

    {/* Edit Profile Modal */}
    {showEditProfile && (
      <EditProfileForm onClose={() => setShowEditProfile(false)} />
    )}

    {/* Add Achievement Modal */}
    {showAddAchievement && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card variant="primary" className="max-w-lg w-full transform rotate-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black font-mono text-xl text-black uppercase flex items-center gap-2">
              <Award size={20} />
              ADD ACHIEVEMENT
            </h2>
            <Button variant="danger" size="sm" onClick={() => setShowAddAchievement(false)}>
              <Edit size={14} />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide">
                TITLE
              </label>
              <input
                type="text"
                value={newAchievement.title}
                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                className="w-full px-4 py-2 border-4 border-black font-mono text-black bg-white"
                placeholder="e.g., Best Employee of the Year"
              />
            </div>
            <div>
              <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide">
                DESCRIPTION
              </label>
              <textarea
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-4 border-black font-mono text-black bg-white"
                placeholder="Brief description of your achievement..."
              />
            </div>
            <div>
              <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide text-sm">
                CATEGORY
              </label>
              <select
                value={newAchievement.category}
                onChange={(e) => setNewAchievement({ ...newAchievement, category: e.target.value as Achievement['category'] })}
                className="w-full px-4 py-2 border-4 border-black font-mono text-black bg-white"
              >
                <option value="academic">Academic</option>
                <option value="professional">Professional</option>
                <option value="personal">Personal</option>
                <option value="community">Community</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1" onClick={handleAddAchievement}>
                SAVE
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddAchievement(false)}>
                CANCEL
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )}

    {/* Create Blog Modal */}
    {showCreateBlog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card variant="primary" className="max-w-2xl w-full transform rotate-1 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black font-mono text-xl text-black uppercase flex items-center gap-2">
              <BookOpen size={20} />
              WRITE NEW BLOG
            </h2>
            <Button variant="danger" size="sm" onClick={() => setShowCreateBlog(false)}>
              <Edit size={14} />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide">
                TITLE
              </label>
              <input
                type="text"
                value={blogData.title}
                onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                className="w-full px-4 py-2 border-4 border-black font-mono text-black bg-white"
                placeholder="Inspiring journey from campus to career"
              />
            </div>
            <div>
              <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide">
                CONTENT
              </label>
              <textarea
                value={blogData.content}
                onChange={(e) => setBlogData({ ...blogData, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 border-4 border-black font-mono text-black bg-white"
                placeholder="Share your story, insights, and experiences..."
              />
            </div>
            <div>
              <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide text-sm">
                TAGS (COMMA SEPARATED)
              </label>
              <input
                type="text"
                value={blogData.tags}
                onChange={(e) => setBlogData({ ...blogData, tags: e.target.value })}
                className="w-full px-4 py-2 border-4 border-black font-mono text-black bg-white"
                placeholder="career, technology, mentorship"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1" onClick={handleCreateBlog}>
                PUBLISH BLOG
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowCreateBlog(false)}>
                CANCEL
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )}
    </>
  );
};

export default AlumniDashboard;