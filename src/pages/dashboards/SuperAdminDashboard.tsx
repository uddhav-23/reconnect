import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, GraduationCap, TrendingUp, Plus, Settings, Edit, Phone, Mail, User as UserIcon } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHero from '../../components/layout/PageHero';
import AddCollegeForm from '../../components/forms/AddCollegeForm';
import EditProfileForm from '../../components/forms/EditProfileForm';
import CreateSubAdminForm from '../../components/forms/CreateSubAdminForm';
import { useAuth } from '../../contexts/AuthContext';
import { getColleges, createCollege, updateCollege, getAlumni } from '../../services/firebaseFirestore';
import { createUserAsAdmin, isEmailAlreadyInUseError } from '../../services/firebaseAuth';
import CreateUserForm from '../../components/forms/CreateUserForm';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [showAddCollege, setShowAddCollege] = React.useState(false);
  const [showEditProfile, setShowEditProfile] = React.useState(false);
  const [showSubAdminForm, setShowSubAdminForm] = React.useState(false);
  const [showCreateUser, setShowCreateUser] = React.useState(false);
  const [createUserRole, setCreateUserRole] = React.useState<'superadmin' | 'subadmin' | 'alumni' | 'student' | 'user'>('user');
  const [selectedCollegeId, setSelectedCollegeId] = React.useState<string | null>(null);
  const [colleges, setColleges] = React.useState<any[]>([]);
  const [alumni, setAlumni] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createdCredentials, setCreatedCredentials] = React.useState<{email: string, password: string} | null>(null);

  React.useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) {
      console.warn('Cannot load data: user not authenticated');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Loading data for user:', user.id, 'universityId:', user.universityId);
      
      const [collegesData, alumniData] = await Promise.all([
        getColleges(user.universityId).catch(err => {
          console.error('Error loading colleges:', err);
          return []; // Return empty array on error
        }),
        getAlumni(undefined, user.universityId).catch(err => {
          console.error('Error loading alumni:', err);
          return []; // Return empty array on error
        }),
      ]);
      
      setColleges(collegesData);
      setAlumni(alumniData);
      console.log('Data loaded successfully:', { colleges: collegesData.length, alumni: alumniData.length });
    } catch (error: any) {
      console.error('Error loading data:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Failed to load data: ${error.message || 'Please check your Firebase configuration.'}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedCollege = selectedCollegeId
    ? colleges.find(college => college.id === selectedCollegeId) || null
    : null;

  const stats = [
    {
      label: 'Total alumni',
      value: alumni.length,
      icon: GraduationCap,
      accent:
        'border-violet-200/80 dark:border-violet-500/25 bg-gradient-to-br from-violet-50/90 to-white dark:from-violet-950/40 dark:to-[var(--card)]',
      iconClass: 'text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Colleges',
      value: colleges.length,
      icon: Building2,
      accent:
        'border-cyan-200/80 dark:border-cyan-500/25 bg-gradient-to-br from-cyan-50/90 to-white dark:from-cyan-950/35 dark:to-[var(--card)]',
      iconClass: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      label: 'Growth (demo)',
      value: '12%',
      icon: TrendingUp,
      accent:
        'border-amber-200/80 dark:border-amber-500/25 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/35 dark:to-[var(--card)]',
      iconClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Users (demo)',
      value: '547',
      icon: Users,
      accent:
        'border-rose-200/80 dark:border-rose-500/25 bg-gradient-to-br from-rose-50/90 to-white dark:from-rose-950/35 dark:to-[var(--card)]',
      iconClass: 'text-rose-600 dark:text-rose-400',
    },
  ];

  const handleAddCollege = async (collegeData: any) => {
    try {
      // Verify user is authenticated and has correct role
      if (!user) {
        alert('You must be logged in to create a college');
        return;
      }
      
      if (user.role !== 'superadmin') {
        alert(`Permission denied. Your role is: ${user.role}. You need to be a superadmin.`);
        return;
      }
      
      console.log('Creating college with user:', {
        id: user.id,
        email: user.email,
        role: user.role,
        universityId: user.universityId
      });

      // Create college in Firestore
      const collegePayload = {
        name: collegeData.name,
        description: collegeData.description,
        establishedYear: collegeData.establishedYear,
        website: collegeData.website,
        contactEmail: collegeData.contactEmail,
        phone: collegeData.phone,
        departments: collegeData.departments,
        universityId: user?.universityId || '1',
        adminName: collegeData.adminName,
        adminEmail: collegeData.adminEmail,
        adminPassword: collegeData.adminPassword,
        adminContactNumber: collegeData.adminContactNumber,
        createdAt: new Date().toISOString(),
      };

      const collegeId = await createCollege(collegePayload);
      
      // Create sub-admin user account
      await createUserAsAdmin(collegeData.adminEmail, collegeData.adminPassword, {
        name: collegeData.adminName,
        role: 'subadmin',
        universityId: user?.universityId || '1',
        collegeId: collegeId,
        phone: collegeData.adminContactNumber,
      });
      
      // Reload data
      await loadData();
      
      alert('College and sub-admin created successfully!');
      setShowAddCollege(false);
    } catch (error: any) {
      console.error('Error creating college:', error);
      alert(`Failed to create college: ${error.message}`);
    }
  };

  const handleAddCollegeClick = () => {
    setShowAddCollege(true);
  };

  const handleManageCollege = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    setShowSubAdminForm(true);
  };

  const handleCreateSubAdmin = async (payload: {
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    adminContactNumber: string;
  }) => {
    if (!selectedCollege) {
      return;
    }

    try {
      // Update college with new admin credentials
      await updateCollege(selectedCollege.id, {
        adminName: payload.adminName,
        adminEmail: payload.adminEmail,
        adminPassword: payload.adminPassword,
        adminContactNumber: payload.adminContactNumber,
      });

      // Create or update sub-admin user account
      try {
        await createUserAsAdmin(payload.adminEmail, payload.adminPassword, {
          name: payload.adminName,
          role: 'subadmin',
          universityId: selectedCollege.universityId,
          collegeId: selectedCollege.id,
          phone: payload.adminContactNumber,
        });
      } catch (error: unknown) {
        // Same email was already registered when the college was created (Add college flow).
        if (!isEmailAlreadyInUseError(error)) {
          throw error;
        }
      }

      // Reload data
      await loadData();

      alert(
        'Sub-admin contact details saved on the college.\n\n' +
          'If this email already had an account (for example from when the college was first added), no new login was created—that is normal.'
      );
      setShowSubAdminForm(false);
      setSelectedCollegeId(null);
    } catch (error: any) {
      console.error('Error updating sub-admin:', error);
      alert(`Failed to update sub-admin: ${error.message}`);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      // Prepare user data, removing undefined fields
      const userPayload: any = {
        name: userData.name,
        role: userData.role,
        universityId: user?.universityId || '1',
      };
      
      // Only add optional fields if they have values
      if (userData.phone) {
        userPayload.phone = userData.phone;
      }
      if (userData.collegeId) {
        userPayload.collegeId = userData.collegeId;
      }
      
      // For alumni, require collegeId (should be provided in form)
      if (userData.role === 'alumni') {
        if (!userData.collegeId) {
          alert('Please select a college for the alumni');
          return;
        }
        userPayload.collegeId = userData.collegeId;
        userPayload.graduationYear = userData.graduationYear || new Date().getFullYear();
        userPayload.degree = userData.degree || '';
        userPayload.department = userData.department || '';
        userPayload.skills = [];
        userPayload.achievements = [];
        userPayload.blogs = [];
        userPayload.connections = [];
        userPayload.experience = [];
        userPayload.education = [];
        userPayload.socialLinks = {};
        if (userData.currentCompany) userPayload.currentCompany = userData.currentCompany;
        if (userData.currentPosition) userPayload.currentPosition = userData.currentPosition;
        if (userData.location) userPayload.location = userData.location;
      }

      await createUserAsAdmin(userData.email, userData.password, userPayload);

      // Show credentials
      setCreatedCredentials({
        email: userData.email,
        password: userData.password,
      });

      // Reload data
      await loadData();
      
      setShowCreateUser(false);
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      const msg = error instanceof Error ? error.message : String(error);
      if (isEmailAlreadyInUseError(error)) {
        alert(
          'This email is already registered in Firebase Authentication for this app.\n\n' +
            'Common cases:\n' +
            '• You already created this user, or they signed up themselves.\n' +
            '• Adding a college already created a sub-admin with the college admin email—use a different email for another sub-admin, or manage the existing user in Firebase Console → Authentication.\n\n' +
            `Technical detail: ${msg}`
        );
      } else {
        alert(`Failed to create user: ${msg}`);
      }
    }
  };

  const handleCreateUserClick = (role: 'superadmin' | 'subadmin' | 'alumni' | 'student' | 'user') => {
    setCreateUserRole(role);
    setShowCreateUser(true);
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-semibold text-[var(--fg)] mb-4 animate-pulse">
            Loading...
          </div>
          <p className="text-[var(--muted)]">Authenticating user...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="primary" className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-[var(--fg)] mb-4">Not Authenticated</h2>
          <p className="text-[var(--muted)] mb-4">Please log in to access the dashboard.</p>
          <Button variant="primary" onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  // Verify user is superadmin
  if (user.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="primary" className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-[var(--fg)] mb-4">Access Denied</h2>
          <p className="text-[var(--muted)] mb-2">Your role: <strong>{user.role}</strong></p>
          <p className="text-[var(--muted)] mb-4">You need to be a superadmin to access this page.</p>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen max-w-6xl mx-auto px-0 sm:px-2 pb-10">
      <PageHero
        eyebrow="Platform"
        title="Super admin dashboard"
        titleGradientPart="Super"
        subtitle={<>Welcome back, <span className="font-medium text-[var(--fg)]">{user?.name}</span></>}
        actions={
          <div className="flex flex-wrap gap-2 justify-end max-w-xl lg:max-w-none">
            <Button variant="secondary" onClick={() => setShowEditProfile(true)} className="flex items-center gap-2 rounded-xl h-9 text-sm">
              <Edit size={18} />
              Edit
            </Button>
            <Button variant="primary" onClick={() => handleCreateUserClick('superadmin')} className="flex items-center gap-2 rounded-xl h-9 text-sm">
              <UserIcon size={18} />
              Super admin
            </Button>
            <Button variant="success" onClick={() => handleCreateUserClick('alumni')} className="flex items-center gap-2 rounded-xl h-9 text-sm">
              <GraduationCap size={18} />
              Alumni
            </Button>
            <Button variant="primary" className="flex items-center gap-2 rounded-xl h-9 text-sm" onClick={() => navigate('/settings')}>
              <Settings size={18} />
              Settings
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <Card variant="primary" className="border-violet-500/10 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--fg)] mb-4 text-center sm:text-left">
            Quick actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddCollegeClick}
              className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl"
            >
              <Building2 size={32} />
              <span className="font-semibold">Add college</span>
              <span className="text-xs text-[var(--primary-fg)] opacity-90">Create & assign sub-admin</span>
            </Button>

            <Button
              variant="success"
              size="lg"
              onClick={() => handleCreateUserClick('alumni')}
              className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl"
            >
              <GraduationCap size={32} />
              <span className="font-semibold">Create alumni</span>
              <span className="text-xs text-white opacity-90">Add to network</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleCreateUserClick('subadmin')}
              className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl"
            >
              <UserIcon size={32} />
              <span className="font-semibold">Create sub-admin</span>
              <span className="text-sm text-[var(--muted)]">College scope</span>
            </Button>
          </div>
        </Card>
      </div>

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

      {/* Sub-Admin Creation Section - Prominent */}
      <Card variant="secondary" className="mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--fg)] mb-2">
              Sub-Admin Management
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Create and manage sub-admins for your colleges
            </p>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => handleCreateUserClick('subadmin')}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Create New Sub-Admin
          </Button>
        </div>
        
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/80 dark:bg-neutral-900/40 p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-semibold text-[var(--fg)] mb-2">
                {colleges.filter(c => c.adminName).length}
              </div>
              <div className="text-sm text-[var(--muted)]">
                Active Sub-Admins
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-semibold text-[var(--fg)] mb-2">
                {colleges.length}
              </div>
              <div className="text-sm text-[var(--muted)]">
                Total Colleges
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-semibold text-[var(--fg)] mb-2">
                {colleges.filter(c => !c.adminName).length}
              </div>
              <div className="text-sm text-[var(--muted)]">
                Pending Assignments
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* University Management */}
        <Card variant="secondary">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-[var(--fg)]">
              University Management
            </h2>
            <Button variant="primary" size="sm" onClick={handleAddCollegeClick}>
              <Plus size={16} />
              Add College
            </Button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-4 text-[var(--muted)]">Loading colleges...</p>
            ) : colleges.length === 0 ? (
              <p className="text-center py-4 text-[var(--muted)]">No colleges found. Add your first college!</p>
            ) : (
              colleges.map((college) => (
              <div key={college.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-[var(--fg)] mb-1">
                    {college.name}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {college.departments.length} Departments
                  </p>
                  <div className="mt-3 space-y-1 text-xs text-[var(--muted)]">
                    <div className="flex items-center gap-2">
                      <UserIcon size={14} />
                      <span>{college.adminName || 'Pending assignment'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <span>{college.adminEmail}</span>
                    </div>
                    {college.adminContactNumber && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{college.adminContactNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="success" size="sm" onClick={() => handleManageCollege(college.id)}>
                  Manage Sub-Admin
                </Button>
              </div>
            </div>
              ))
            )}
          </div>
        </Card>

        {/* Sub-Admin Management */}
        <Card variant="primary">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-[var(--fg)]">
              Sub-Admin Management
            </h2>
            <Button 
              variant="success" 
              size="sm"
              onClick={() => handleCreateUserClick('subadmin')}
            >
              <Plus size={16} />
              Create Sub-Admin
            </Button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-4 text-[var(--muted)]">Loading sub-admins...</p>
            ) : colleges.length === 0 ? (
              <p className="text-center py-4 text-[var(--muted)]">No colleges found. Create a college first!</p>
            ) : (
              colleges.map((college) => (
                <div key={college.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--fg)] mb-1">
                        {college.name}
                      </h3>
                      <p className="text-sm text-[var(--muted)]">
                        {college.departments?.length || 0} Departments
                      </p>
                      <div className="mt-3 space-y-1 text-xs">
                        {college.adminName ? (
                          <>
                            <div className="flex items-center gap-2 text-[var(--muted)]">
                              <UserIcon size={14} />
                              <span className="font-medium">Sub-Admin:</span> {college.adminName}
                            </div>
                            <div className="flex items-center gap-2 text-[var(--muted)]">
                              <Mail size={14} />
                              <span>{college.adminEmail}</span>
                            </div>
                            {college.adminContactNumber && (
                              <div className="flex items-center gap-2 text-[var(--muted)]">
                                <Phone size={14} />
                                <span>{college.adminContactNumber}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-amber-600 dark:text-amber-400 font-medium">⚠️ No sub-admin assigned</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleManageCollege(college.id)}
                      >
                        {college.adminName ? 'Update' : 'Assign'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card variant="primary">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-[var(--fg)]">
            Recent Activities
          </h2>
          <Button variant="secondary" size="sm" onClick={handleAddCollegeClick}>
            Add College
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-[var(--card)]/80 dark:bg-neutral-900/40 rounded-xl border border-[var(--border)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[var(--fg)]">
                New alumni registration
              </p>
              <p className="text-sm text-[var(--muted)]">
                Sarah Davis joined from College of Business
              </p>
            </div>
            <span className="text-sm text-[var(--muted)]">2 min ago</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-[var(--card)]/80 dark:bg-neutral-900/40 rounded-xl border border-[var(--border)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[var(--fg)]">
                College admin updated
              </p>
              <p className="text-sm text-[var(--muted)]">
                New sub-admin assigned to Engineering College
              </p>
            </div>
            <span className="text-sm text-[var(--muted)]">1 hour ago</span>
          </div>
        </div>
      </Card>
    </div>

    {/* Add College Modal */}
    {showAddCollege && (
      <AddCollegeForm
        onClose={() => setShowAddCollege(false)}
        onSubmit={handleAddCollege}
      />
    )}

    {/* Edit Profile Modal */}
    {showEditProfile && (
      <EditProfileForm onClose={() => setShowEditProfile(false)} />
    )}

    {/* Create / Update Sub Admin Modal */}
    {showSubAdminForm && selectedCollege && (
      <CreateSubAdminForm
        college={selectedCollege}
        onClose={() => {
          setShowSubAdminForm(false);
          setSelectedCollegeId(null);
        }}
        onSubmit={handleCreateSubAdmin}
      />
    )}

    {/* Create User Modal */}
    {showCreateUser && (
      <CreateUserForm
        userRole={createUserRole}
        colleges={colleges.map(c => ({ id: c.id, name: c.name }))}
        onClose={() => {
          setShowCreateUser(false);
          setCreatedCredentials(null);
        }}
        onSubmit={handleCreateUser}
      />
    )}

    {/* Credentials Display Modal */}
    {createdCredentials && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card variant="primary" className="max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[var(--fg)] mb-4">
              ✅ User Created Successfully!
            </h2>
            <div className="bg-[var(--card)]/80 dark:bg-neutral-900/40 rounded-xl border border-[var(--border)] p-6 mb-4">
              <p className="font-semibold text-[var(--fg)] mb-4">Demo Login Credentials</p>
              <div className="space-y-3 text-left">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Email:</p>
                  <p className="font-semibold text-[var(--fg)] break-all">{createdCredentials.email}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Password:</p>
                  <p className="font-semibold text-[var(--fg)]">{createdCredentials.password}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-[var(--muted)] mb-4">
              Share these credentials with the user. They can login at /login
            </p>
            <Button 
              variant="primary" 
              onClick={() => {
                navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`);
                alert('Credentials copied to clipboard!');
              }}
              className="mb-2 w-full"
            >
              Copy Credentials
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setCreatedCredentials(null)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </Card>
      </div>
    )}
    </>
  );
};

export default SuperAdminDashboard;