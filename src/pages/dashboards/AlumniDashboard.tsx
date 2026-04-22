import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Settings, Edit, Plus, Eye, UserCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHero from '../../components/layout/PageHero';
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
    {
      label: 'Profile views',
      value: '124',
      icon: Eye,
      accent:
        'border-violet-200/80 dark:border-violet-500/25 bg-gradient-to-br from-violet-50/90 to-white dark:from-violet-950/40 dark:to-[var(--card)]',
      iconClass: 'text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Published blogs',
      value: String(userBlogs.length),
      icon: BookOpen,
      accent:
        'border-cyan-200/80 dark:border-cyan-500/25 bg-gradient-to-br from-cyan-50/90 to-white dark:from-cyan-950/35 dark:to-[var(--card)]',
      iconClass: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Achievements',
      value: String(userAchievements.length),
      icon: Award,
      accent:
        'border-amber-200/80 dark:border-amber-500/25 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/35 dark:to-[var(--card)]',
      iconClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Connections',
      value: String((currentAlumni.connections || []).length),
      icon: UserCheck,
      accent:
        'border-rose-200/80 dark:border-rose-500/25 bg-gradient-to-br from-rose-50/90 to-white dark:from-rose-950/35 dark:to-[var(--card)]',
      iconClass: 'text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <>
    <div className="min-h-screen max-w-6xl mx-auto px-0 sm:px-2 pb-10">
      <PageHero
        eyebrow="Your space"
        title="Alumni dashboard"
        titleGradientPart="Alumni"
        subtitle={
          <>
            <span className="text-[var(--fg)] font-medium">{currentAlumni.name}</span>
            <span className="block mt-1 text-sm">
              {currentAlumni.currentPosition} at {currentAlumni.currentCompany}
            </span>
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="primary" onClick={() => navigate('/settings')} className="flex items-center gap-2 rounded-xl h-9 px-3">
              <Settings size={18} />
              Settings
            </Button>
            <Button variant="secondary" onClick={() => setShowEditProfile(true)} className="flex items-center gap-2 rounded-xl h-9 px-3">
              <Edit size={18} />
              Edit
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-8">
        <Card variant="secondary" className="border-violet-500/10 bg-gradient-to-br from-violet-500/[0.03] to-transparent dark:from-violet-950/20">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-bold text-[var(--fg)]">Profile summary</h2>
            <Button variant="primary" size="sm" onClick={() => setShowEditProfile(true)} className="rounded-lg">
              <Edit size={16} />
              Edit
            </Button>
          </div>

          <div className="space-y-4">
            <div className="app-surface p-4 border-[var(--border)]">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-md shrink-0">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {currentAlumni.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--fg)] mb-1">{currentAlumni.name}</h3>
                  <p className="text-sm text-[var(--muted)]">{currentAlumni.degree}</p>
                  <p className="text-sm text-[var(--muted)] mt-1">Class of {currentAlumni.graduationYear}</p>
                </div>
              </div>
            </div>

            {currentAlumni.bio && (
              <div className="rounded-xl border border-[var(--border)] bg-neutral-50/80 dark:bg-neutral-800/50 p-3 sm:p-4">
                <p className="text-sm text-[var(--fg)] leading-relaxed">
                  <span className="font-semibold text-[var(--muted)]">Bio · </span>
                  {currentAlumni.bio}
                </p>
              </div>
            )}

            {currentAlumni.skills.length > 0 && (
              <div className="rounded-xl border border-[var(--border)] bg-neutral-50/80 dark:bg-neutral-800/50 p-3 sm:p-4">
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentAlumni.skills.map((skill) => (
                    <span key={skill} className="app-tag text-[11px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card variant="accent" className="border-cyan-500/10 bg-gradient-to-br from-cyan-500/[0.04] to-transparent dark:from-cyan-950/15">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-bold text-[var(--fg)]">My blogs</h2>
            <Button variant="secondary" size="sm" onClick={() => setShowCreateBlog(true)} className="rounded-lg">
              <Plus size={16} />
              New
            </Button>
          </div>

          <div className="space-y-3">
            {userBlogs.map((blog) => (
              <div key={blog.id} className="app-surface p-3 sm:p-4 border-[var(--border)] shadow-sm">
                <div>
                  <h3 className="font-semibold text-sm text-[var(--fg)] mb-2">{blog.title}</h3>
                  <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2">{blog.excerpt}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                      <span>{blog.likes} likes</span>
                      <span>{blog.publishedAt}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="success" size="sm" className="rounded-lg">
                        Edit
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/blog/${blog.id}`)} className="rounded-lg">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {userBlogs.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-6 text-center">
                <BookOpen size={36} className="mx-auto mb-3 text-cyan-600/70 dark:text-cyan-400/80" />
                <p className="text-sm text-[var(--muted)] mb-4">No posts yet — share your story with the network.</p>
                <Button variant="primary" onClick={() => setShowCreateBlog(true)} className="rounded-xl">
                  Write your first blog
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card variant="primary" className="border-amber-500/10">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-[var(--fg)]">Achievements</h2>
          <Button variant="secondary" size="sm" onClick={() => setShowAddAchievement(true)} className="rounded-lg">
            <Plus size={16} />
            Add
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {userAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-amber-500/[0.06] to-transparent dark:from-amber-950/20 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Award size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-[var(--fg)] mb-1">{achievement.title}</h3>
                  <p className="text-xs text-[var(--muted)] mb-2 line-clamp-3">{achievement.description}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="app-tag text-[10px]">{achievement.category}</span>
                    <span className="text-xs text-[var(--muted)]">{achievement.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {userAchievements.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-[var(--border)] p-6 text-center">
              <Award size={36} className="mx-auto mb-3 text-amber-600/80 dark:text-amber-400/90" />
              <p className="text-sm text-[var(--muted)] mb-4">No achievements yet.</p>
              <Button variant="primary" onClick={() => setShowAddAchievement(true)} className="rounded-xl">
                Add achievement
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card variant="primary" className="max-w-lg w-full border-violet-500/10">
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
                className="app-input"
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
                className="app-textarea min-h-[88px]"
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
                className="app-input"
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card variant="primary" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border-cyan-500/10">
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
                className="app-input"
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
                className="app-textarea min-h-[200px]"
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
                className="app-input"
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