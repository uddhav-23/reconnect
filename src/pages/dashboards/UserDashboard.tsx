import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Award, Settings, Edit, Plus, Eye, UserCheck, Copy, Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHero from '../../components/layout/PageHero';
import EditProfileForm from '../../components/forms/EditProfileForm';
import { useAuth } from '../../contexts/AuthContext';
import { getBlogs, getAchievements, createAchievement, createBlog, getUserById } from '../../services/firebaseFirestore';
import { User, Achievement, Blog } from '../../types';

const UserDashboard: React.FC = () => {
  const { user, deleteAccount, exportUserData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    category: 'professional' as Achievement['category'],
  });
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    tags: '',
    status: 'published' as 'draft' | 'published',
  });

  useEffect(() => {
    const state = location.state as { openBlogComposer?: boolean } | undefined;
    if (state?.openBlogComposer) {
      setShowCreateBlog(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        
        // Load user profile
        let userData: User | null = null;
        try {
          userData = await getUserById(user.id);
          if (userData) {
            setCurrentUser(userData);
          } else {
            // If getUserById doesn't exist, use the auth user
            setCurrentUser(user);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setCurrentUser(user);
        }
        
        // Load blogs
        try {
          const blogsData = await getBlogs(user.id);
          setUserBlogs(blogsData);
        } catch (error) {
          console.error('Error loading blogs:', error);
          setUserBlogs([]);
        }
        
        // Load achievements
        try {
          const achievementsData = await getAchievements(user.id);
          setUserAchievements(achievementsData);
        } catch (error) {
          console.error('Error loading achievements:', error);
          setUserAchievements([]);
        }
        
      } catch (error) {
        console.error('Unexpected error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleAddAchievement = async () => {
    if (!user) return;
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

  const handleCreateBlog = async () => {
    if (!user) return;
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
        status: blogData.status,
      });

      const updatedBlogs = await getBlogs(user.id);
      setUserBlogs(updatedBlogs);

      setShowCreateBlog(false);
      setBlogData({ title: '', content: '', tags: '', status: 'published' });
      alert('Blog created successfully!');
      navigate(`/blog/${newBlogId}`);
    } catch (error: any) {
      console.error('Error creating blog:', error);
      alert(`Failed to create blog: ${error.message}`);
    }
  };

  const copyProfileUrl = () => {
    if (!user) return;
    const profileUrl = `${window.location.origin}/alumni/${user.id}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="primary" className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-[var(--fg)] mb-4">Not Authenticated</h2>
          <p className="text-[var(--muted)] mb-4">Please log in to access this dashboard.</p>
        </Card>
      </div>
    );
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading your dashboard...</p>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    superadmin: 'Super Admin',
    subadmin: 'Sub Admin',
    alumni: 'Alumni',
    student: 'Student',
    user: 'User',
  };

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
      value: userBlogs.length.toString(),
      icon: BookOpen,
      accent:
        'border-cyan-200/80 dark:border-cyan-500/25 bg-gradient-to-br from-cyan-50/90 to-white dark:from-cyan-950/35 dark:to-[var(--card)]',
      iconClass: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Achievements',
      value: userAchievements.length.toString(),
      icon: Award,
      accent:
        'border-amber-200/80 dark:border-amber-500/25 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/35 dark:to-[var(--card)]',
      iconClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Connections',
      value: ((currentUser as { connections?: string[] }).connections?.length || 0).toString(),
      icon: UserCheck,
      accent:
        'border-rose-200/80 dark:border-rose-500/25 bg-gradient-to-br from-rose-50/90 to-white dark:from-rose-950/35 dark:to-[var(--card)]',
      iconClass: 'text-rose-600 dark:text-rose-400',
    },
  ];

  const roleLabel = roleLabels[user.role] || 'User';
  const dashboardTitle = `${roleLabel} dashboard`;

  return (
    <>
      <div className="min-h-screen max-w-6xl mx-auto px-0 sm:px-2 pb-10">
        <PageHero
          eyebrow="Your space"
          title={dashboardTitle}
          titleGradientPart={roleLabel}
          subtitle={
            <>
              <span className="text-[var(--fg)] font-medium">{currentUser.name}</span>
              {user.role === 'alumni' && (currentUser as { currentPosition?: string; currentCompany?: string }).currentPosition && (
                <span className="block mt-1 text-sm">
                  {(currentUser as { currentPosition?: string }).currentPosition} at{' '}
                  {(currentUser as { currentCompany?: string }).currentCompany}
                </span>
              )}
              {user.role === 'student' && (currentUser as { degree?: string; currentYear?: number }).degree && (
                <span className="block mt-1 text-sm">
                  {(currentUser as { degree?: string }).degree} — Year {(currentUser as { currentYear?: number }).currentYear}
                </span>
              )}
            </>
          }
          actions={
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="secondary" onClick={copyProfileUrl} className="flex items-center gap-2 rounded-xl text-sm h-9 px-3">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Profile link'}
              </Button>
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

        {/* Profile & Content Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-8">
          {/* Profile Summary */}
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
                      {currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--fg)] mb-1">
                      {currentUser.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                      {currentUser.email}
                    </p>
                    {user.role === 'alumni' && (currentUser as any).degree && (
                      <p className="text-sm text-[var(--muted)] mt-1">
                        {(currentUser as any).degree} - Class of {(currentUser as any).graduationYear}
                      </p>
                    )}
                    {user.role === 'student' && (currentUser as any).degree && (
                      <p className="text-sm text-[var(--muted)] mt-1">
                        {(currentUser as any).degree} - Year {(currentUser as any).currentYear}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {(currentUser as { bio?: string }).bio && (
                <div className="rounded-xl border border-[var(--border)] bg-neutral-50/80 dark:bg-neutral-800/50 p-3 sm:p-4">
                  <p className="text-sm text-[var(--fg)] leading-relaxed">
                    <span className="font-semibold text-[var(--muted)]">Bio · </span>
                    {(currentUser as { bio?: string }).bio}
                  </p>
                </div>
              )}

              {(currentUser as { skills?: string[] }).skills && (currentUser as { skills?: string[] }).skills!.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-neutral-50/80 dark:bg-neutral-800/50 p-3 sm:p-4">
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentUser as { skills?: string[] }).skills!.map((skill: string) => (
                      <span key={skill} className="app-tag text-[11px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Blog Management */}
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
                <div
                  key={blog.id}
                  className="app-surface p-3 sm:p-4 border-[var(--border)] shadow-sm"
                >
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--fg)] mb-2 flex items-center gap-2 flex-wrap">
                      {blog.title}
                      {blog.status === 'draft' && (
                        <span className="text-[10px] uppercase tracking-wide bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded">
                          Draft
                        </span>
                      )}
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

        {/* Achievements */}
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
              <div key={achievement.id} className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-amber-500/[0.06] to-transparent dark:from-amber-950/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Award size={20} className="text-white" />
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

        <Card variant="secondary" className="mt-6 border-red-200/40 dark:border-red-900/35 rounded-2xl">
          <h2 className="text-lg font-bold text-[var(--fg)] mb-2">Data &amp; account</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Export your profile and content, or permanently delete your account. See also{' '}
            <a href="/privacy" className="text-[var(--primary)] underline">
              Privacy
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => exportUserData?.()}
            >
              Download my data (JSON)
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                const pwd = window.prompt('Enter your password to confirm account deletion:');
                if (!pwd) return;
                try {
                  await deleteAccount?.(pwd);
                } catch (e: unknown) {
                  alert(e instanceof Error ? e.message : 'Could not delete account');
                }
              }}
            >
              Delete account
            </Button>
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
              <div>
                <label className="block text-[var(--fg)] font-medium mb-2 text-sm">Visibility</label>
                <select
                  value={blogData.status}
                  onChange={(e) =>
                    setBlogData({ ...blogData, status: e.target.value as 'draft' | 'published' })
                  }
                  className="app-input"
                >
                  <option value="published">Publish now</option>
                  <option value="draft">Save as draft</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={handleCreateBlog}>
                  {blogData.status === 'draft' ? 'Save draft' : 'Publish blog'}
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

export default UserDashboard;

