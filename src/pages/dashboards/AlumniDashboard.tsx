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
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="primary" className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-[var(--fg)] mb-4">Not Authenticated</h2>
          <p className="text-[var(--muted)] mb-4">Please log in as an alumni to access this dashboard.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading your dashboard...</p>
      </div>
    );
  }

  if (!currentAlumni) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="primary" className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-[var(--fg)] mb-4">Profile Not Found</h2>
          <p className="text-[var(--muted)] mb-4">
            Your alumni profile has not been set up yet. Please contact your admin to create your alumni profile.
          </p>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: 'Profile Views', value: '124', icon: Eye },
    { label: 'Published Blogs', value: userBlogs.length, icon: BookOpen },
    { label: 'Achievements', value: userAchievements.length, icon: Award },
    { label: 'Network Connections', value: (currentAlumni.connections || []).length, icon: UserCheck },
  ];

  return (
    <>
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2 text-[var(--fg)]">
              Alumni Dashboard
            </h1>
            <p className="text-base text-[var(--muted)]">
              Welcome back, {currentAlumni.name}
            </p>
            <p className="text-sm text-[var(--muted)] mt-1">
              {currentAlumni.currentPosition} at {currentAlumni.currentCompany}
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowEditProfile(true)}
            className="flex items-center gap-2"
          >
            <Settings size={18} />
            Edit Profile
          </Button>
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

      {/* Profile & Content Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Profile Summary */}
        <Card variant="secondary">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-[var(--fg)]">
              Profile Summary
            </h2>
            <Button variant="primary" size="sm" onClick={() => setShowEditProfile(true)}>
              <Edit size={16} />
              Edit
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shadow-subtle">
                  <span className="text-[var(--fg)] font-semibold text-xl">
                    {currentAlumni.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--fg)] mb-1">
                    {currentAlumni.name}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {currentAlumni.degree}
                  </p>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    Class of {currentAlumni.graduationYear}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-md border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--fg)]">
                <strong className="font-medium">Bio:</strong> {currentAlumni.bio}
              </p>
            </div>
            
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-md border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--fg)] mb-2 font-medium">
                Skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentAlumni.skills.map((skill) => (
                  <span 
                    key={skill}
                    className="bg-[var(--card)] text-[var(--fg)] px-2 py-1 border border-[var(--border)] text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Blog Management */}
        <Card variant="accent">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-[var(--fg)]">
              My Blogs
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateBlog(true)}
            >
              <Plus size={16} />
              New Blog
            </Button>
          </div>
          
          <div className="space-y-4">
            {userBlogs.map((blog) => (
              <div key={blog.id} className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4">
                <div>
                  <h3 className="font-semibold text-sm text-[var(--fg)] mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mb-3">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[var(--muted)]">
                        {blog.likes} likes
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {blog.publishedAt}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="success" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/blog/${blog.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {userBlogs.length === 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-8 text-center">
                <BookOpen size={48} className="mx-auto mb-4 text-[var(--muted)]" />
                <p className="text-[var(--muted)] mb-4">
                  You haven't published any blogs yet
                </p>
                <Button variant="primary" onClick={() => setShowCreateBlog(true)}>
                  Write Your First Blog
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <Card variant="primary">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-[var(--fg)]">
            My Achievements
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddAchievement(true)}
          >
            <Plus size={16} />
            Add Achievement
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-neutral-100 dark:bg-neutral-800 rounded-md border border-[var(--border)] p-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <Award size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-[var(--fg)] mb-1">
                    {achievement.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mb-2">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
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
          
          {userAchievements.length === 0 && (
            <div className="col-span-full bg-[var(--card)] border border-[var(--border)] rounded-md p-8 text-center">
              <Award size={48} className="mx-auto mb-4 text-[var(--muted)]" />
              <p className="text-[var(--muted)] mb-4">
                No achievements added yet
              </p>
              <Button variant="primary" onClick={() => setShowAddAchievement(true)}>
                Add Your First Achievement
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
        <Card variant="primary" className="max-w-lg w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--fg)] flex items-center gap-2">
              <Award size={20} />
              Add Achievement
            </h2>
            <Button variant="danger" size="sm" onClick={() => setShowAddAchievement(false)}>
              <Edit size={14} />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[var(--fg)] font-medium mb-2 text-sm">
                Title
              </label>
              <input
                type="text"
                value={newAchievement.title}
                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                placeholder="e.g., Best Employee of the Year"
              />
            </div>
            <div>
              <label className="block text-[var(--fg)] font-medium mb-2 text-sm">
                Description
              </label>
              <textarea
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                placeholder="Brief description of your achievement..."
              />
            </div>
            <div>
              <label className="block text-[var(--fg)] font-medium mb-2 text-sm">
                Category
              </label>
              <select
                value={newAchievement.category}
                onChange={(e) => setNewAchievement({ ...newAchievement, category: e.target.value as Achievement['category'] })}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              >
                <option value="academic">Academic</option>
                <option value="professional">Professional</option>
                <option value="personal">Personal</option>
                <option value="community">Community</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1" onClick={handleAddAchievement}>
                Save
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddAchievement(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )}

    {/* Create Blog Modal */}
    {showCreateBlog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card variant="primary" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--fg)] flex items-center gap-2">
              <BookOpen size={20} />
              Write New Blog
            </h2>
            <Button variant="danger" size="sm" onClick={() => setShowCreateBlog(false)}>
              <Edit size={14} />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[var(--fg)] font-medium mb-2 text-sm">
                Title
              </label>
              <input
                type="text"
                value={blogData.title}
                onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                placeholder="Inspiring journey from campus to career"
              />
            </div>
            <div>
              <label className="block text-[var(--fg)] font-medium mb-2 text-sm">
                Content
              </label>
              <textarea
                value={blogData.content}
                onChange={(e) => setBlogData({ ...blogData, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                placeholder="Share your story, insights, and experiences..."
              />
            </div>
            <div>
              <label className="block text-[var(--fg)] font-medium mb-2 text-sm">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={blogData.tags}
                onChange={(e) => setBlogData({ ...blogData, tags: e.target.value })}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                placeholder="career, technology, mentorship"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1" onClick={handleCreateBlog}>
                Publish Blog
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowCreateBlog(false)}>
                Cancel
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