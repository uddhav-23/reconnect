import React from 'react';
import { Users, Building2, GraduationCap, TrendingUp, Plus, Settings, Edit, Phone, Mail, User as UserIcon } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import AddCollegeForm from '../../components/forms/AddCollegeForm';
import EditProfileForm from '../../components/forms/EditProfileForm';
import CreateSubAdminForm from '../../components/forms/CreateSubAdminForm';
import { useAuth } from '../../contexts/AuthContext';
import { getColleges, createCollege, updateCollege, getAlumni, createAlumni } from '../../services/firebaseFirestore';
import { createUser } from '../../services/firebaseAuth';
import CreateUserForm from '../../components/forms/CreateUserForm';

const SuperAdminDashboard: React.FC = () => {
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
    { label: 'Total Alumni', value: alumni.length, icon: GraduationCap, color: 'bg-[#FF0080]' },
    { label: 'Active Colleges', value: colleges.length, icon: Building2, color: 'bg-[#00FF80]' },
    { label: 'Monthly Growth', value: '12%', icon: TrendingUp, color: 'bg-[#0080FF]' },
    { label: 'Total Users', value: '547', icon: Users, color: 'bg-[#FF4444]' },
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
      await createUser(collegeData.adminEmail, collegeData.adminPassword, {
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
        await createUser(payload.adminEmail, payload.adminPassword, {
          name: payload.adminName,
          role: 'subadmin',
          universityId: selectedCollege.universityId,
          collegeId: selectedCollege.id,
          phone: payload.adminContactNumber,
        });
      } catch (error: any) {
        // User might already exist, that's okay
        if (!error.message.includes('already in use')) {
          throw error;
        }
      }

      // Reload data
      await loadData();

      alert('Sub-admin credentials saved successfully!');
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
      }
      
      // Create user account
      await createUser(userData.email, userData.password, userPayload);

      // If alumni, create alumni profile
      if (userData.role === 'alumni') {
        const alumniPayload: any = {
          email: userData.email,
          name: userData.name,
          role: 'alumni' as const,
          universityId: user?.universityId || '1',
          collegeId: userPayload.collegeId,
          graduationYear: userData.graduationYear || new Date().getFullYear(),
          degree: userData.degree || '',
          department: userData.department || '',
          skills: [],
          achievements: [],
          blogs: [],
          connections: [],
          experience: [],
          education: [],
          socialLinks: {},
        };
        
        // Only add optional fields if they have values
        if (userData.currentCompany) {
          alumniPayload.currentCompany = userData.currentCompany;
        }
        if (userData.currentPosition) {
          alumniPayload.currentPosition = userData.currentPosition;
        }
        if (userData.location) {
          alumniPayload.location = userData.location;
        }
        
        await createAlumni(alumniPayload);
      }

      // Show credentials
      setCreatedCredentials({
        email: userData.email,
        password: userData.password,
      });

      // Reload data
      await loadData();
      
      setShowCreateUser(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error.message}`);
    }
  };

  const handleCreateUserClick = (role: 'superadmin' | 'subadmin' | 'alumni' | 'student' | 'user') => {
    setCreateUserRole(role);
    setShowCreateUser(true);
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-black font-mono text-[#0080FF] mb-4 animate-pulse">
            LOADING...
          </div>
          <p className="font-mono text-gray-600">Authenticating user...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card variant="primary" className="text-center max-w-md">
          <h2 className="text-2xl font-black font-mono text-black mb-4">NOT AUTHENTICATED</h2>
          <p className="font-mono text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <Button variant="primary" onClick={() => window.location.href = '/login'}>
            GO TO LOGIN
          </Button>
        </Card>
      </div>
    );
  }

  // Verify user is superadmin
  if (user.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card variant="primary" className="text-center max-w-md bg-red-50 border-red-500">
          <h2 className="text-2xl font-black font-mono text-red-600 mb-4">ACCESS DENIED</h2>
          <p className="font-mono text-gray-700 mb-2">Your role: <strong>{user.role}</strong></p>
          <p className="font-mono text-gray-600 mb-4">You need to be a superadmin to access this page.</p>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            GO TO HOME
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black font-mono uppercase text-black transform -skew-y-1 mb-2">
              SUPER ADMIN
              <span className="text-[#FF0080] block">DASHBOARD</span>
            </h1>
            <p className="font-mono text-lg text-gray-600 uppercase">
              Welcome back, {user?.name}
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
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
              onClick={() => handleCreateUserClick('superadmin')}
              className="flex items-center gap-2"
            >
              <UserIcon size={20} />
              CREATE SUPER ADMIN
            </Button>
            <Button 
              variant="success" 
              onClick={() => handleCreateUserClick('alumni')}
              className="flex items-center gap-2"
            >
              <GraduationCap size={20} />
              CREATE ALUMNI
            </Button>
            <Button variant="primary" className="flex items-center gap-2">
            <Settings size={20} />
            SETTINGS
          </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions - Prominent Buttons */}
      <div className="mb-8">
        <Card variant="primary" className="transform rotate-0">
          <h2 className="font-black font-mono text-2xl text-black uppercase mb-6 text-center">
            QUICK ACTIONS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleAddCollegeClick}
              className="flex flex-col items-center justify-center gap-3 py-8 transform hover:scale-105 transition-transform"
            >
              <Building2 size={40} />
              <span className="font-black font-mono text-xl uppercase">ADD NEW COLLEGE</span>
              <span className="font-mono text-sm">Create college & assign sub-admin</span>
            </Button>
            
            <Button 
              variant="success" 
              size="lg" 
              onClick={() => handleCreateUserClick('alumni')}
              className="flex flex-col items-center justify-center gap-3 py-8 transform hover:scale-105 transition-transform"
            >
              <GraduationCap size={40} />
              <span className="font-black font-mono text-xl uppercase">CREATE ALUMNI</span>
              <span className="font-mono text-sm">Add new alumni to network</span>
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => handleCreateUserClick('subadmin')}
              className="flex flex-col items-center justify-center gap-3 py-8 transform hover:scale-105 transition-transform"
            >
              <UserIcon size={40} />
              <span className="font-black font-mono text-xl uppercase">CREATE SUB-ADMIN</span>
              <span className="font-mono text-sm">Add new sub-admin user</span>
            </Button>
          </div>
        </Card>
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

      {/* Sub-Admin Creation Section - Prominent */}
      <Card variant="secondary" className="transform rotate-0 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black font-mono text-3xl text-black uppercase mb-2">
              SUB-ADMIN MANAGEMENT
            </h2>
            <p className="font-mono text-sm text-gray-600">
              Create and manage sub-admins for your colleges
            </p>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => handleCreateUserClick('subadmin')}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            CREATE NEW SUB-ADMIN
          </Button>
        </div>
        
        <div className="bg-[#00FF80] border-4 border-black p-6 transform -rotate-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-black font-mono text-black mb-2">
                {colleges.filter(c => c.adminName).length}
              </div>
              <div className="font-bold font-mono text-sm text-black uppercase">
                Active Sub-Admins
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black font-mono text-black mb-2">
                {colleges.length}
              </div>
              <div className="font-bold font-mono text-sm text-black uppercase">
                Total Colleges
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black font-mono text-black mb-2">
                {colleges.filter(c => !c.adminName).length}
              </div>
              <div className="font-bold font-mono text-sm text-black uppercase">
                Pending Assignments
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* University Management */}
        <Card variant="secondary" className="transform rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black font-mono text-2xl text-black uppercase">
              UNIVERSITY MANAGEMENT
            </h2>
            <Button variant="primary" size="sm" onClick={handleAddCollegeClick}>
              <Plus size={16} />
              ADD COLLEGE
            </Button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="font-mono text-center py-4">Loading colleges...</p>
            ) : colleges.length === 0 ? (
              <p className="font-mono text-center py-4 text-gray-500">No colleges found. Add your first college!</p>
            ) : (
              colleges.map((college) => (
              <div key={college.id} className="bg-white border-4 border-black p-4 transform -rotate-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold font-mono text-black uppercase">
                    {college.name}
                  </h3>
                  <p className="font-mono text-sm text-gray-600">
                    {college.departments.length} Departments
                  </p>
                  <div className="mt-3 space-y-1 font-mono text-xs text-gray-700">
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
                  MANAGE SUB-ADMIN
                </Button>
              </div>
            </div>
              ))
            )}
          </div>
        </Card>

        {/* Sub-Admin Management */}
        <Card variant="primary" className="transform -rotate-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black font-mono text-2xl text-black uppercase">
              SUB-ADMIN MANAGEMENT
            </h2>
            <Button 
              variant="success" 
              size="sm"
              onClick={() => handleCreateUserClick('subadmin')}
            >
              <Plus size={16} />
              CREATE SUB-ADMIN
            </Button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="font-mono text-center py-4">Loading sub-admins...</p>
            ) : colleges.length === 0 ? (
              <p className="font-mono text-center py-4 text-gray-500">No colleges found. Create a college first!</p>
            ) : (
              colleges.map((college) => (
                <div key={college.id} className="bg-white border-4 border-black p-4 transform rotate-1">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold font-mono text-black uppercase">
                        {college.name}
                      </h3>
                      <p className="font-mono text-sm text-gray-600">
                        {college.departments?.length || 0} Departments
                      </p>
                      <div className="mt-3 space-y-1 font-mono text-xs">
                        {college.adminName ? (
                          <>
                            <div className="flex items-center gap-2 text-gray-700">
                              <UserIcon size={14} />
                              <span className="font-bold">Sub-Admin:</span> {college.adminName}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail size={14} />
                              <span>{college.adminEmail}</span>
                            </div>
                            {college.adminContactNumber && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone size={14} />
                                <span>{college.adminContactNumber}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-[#FF0080] font-bold">⚠️ No sub-admin assigned</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleManageCollege(college.id)}
                      >
                        {college.adminName ? 'UPDATE' : 'ASSIGN'}
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
      <Card variant="primary" className="transform rotate-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black font-mono text-2xl text-black uppercase">
            RECENT ACTIVITIES
          </h2>
          <Button variant="secondary" size="sm">
            <span onClick={handleAddCollegeClick}>ADD COLLEGE</span>
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-[#00FF80] border-2 border-black">
            <div className="w-12 h-12 bg-[#FF0080] border-2 border-black flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold font-mono text-black">
                New alumni registration
              </p>
              <p className="font-mono text-sm text-gray-700">
                Sarah Davis joined from College of Business
              </p>
            </div>
            <span className="font-mono text-sm text-gray-600">2 min ago</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-[#0080FF] border-2 border-black">
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center">
              <Building2 size={20} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="font-bold font-mono text-white">
                College admin updated
              </p>
              <p className="font-mono text-sm text-gray-300">
                New sub-admin assigned to Engineering College
              </p>
            </div>
            <span className="font-mono text-sm text-gray-300">1 hour ago</span>
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
        <Card variant="primary" className="max-w-md w-full transform rotate-1">
          <div className="text-center">
            <h2 className="text-2xl font-black font-mono uppercase text-black mb-4">
              ✅ USER CREATED SUCCESSFULLY!
            </h2>
            <div className="bg-[#00FF80] border-4 border-black p-6 mb-4 transform -rotate-1">
              <p className="font-bold font-mono text-black uppercase mb-4">DEMO LOGIN CREDENTIALS</p>
              <div className="space-y-3 text-left">
                <div>
                  <p className="font-mono text-sm text-gray-600 uppercase">Email:</p>
                  <p className="font-black font-mono text-lg text-black break-all">{createdCredentials.email}</p>
                </div>
                <div>
                  <p className="font-mono text-sm text-gray-600 uppercase">Password:</p>
                  <p className="font-black font-mono text-lg text-black">{createdCredentials.password}</p>
                </div>
              </div>
            </div>
            <p className="font-mono text-sm text-gray-600 mb-4">
              Share these credentials with the user. They can login at /login
            </p>
            <Button 
              variant="primary" 
              onClick={() => {
                navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`);
                alert('Credentials copied to clipboard!');
              }}
              className="mb-2"
            >
              COPY CREDENTIALS
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setCreatedCredentials(null)}
              className="w-full"
            >
              CLOSE
            </Button>
          </div>
        </Card>
      </div>
    )}
    </>
  );
};

export default SuperAdminDashboard;