import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Alumni from './pages/Alumni';
import AlumniProfile from './pages/AlumniProfile';
import Blogs from './pages/Blogs';
import BlogPost from './pages/BlogPost';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import SubAdminDashboard from './pages/dashboards/SubAdminDashboard';
import UserDashboard from './pages/dashboards/UserDashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Mentorship from './pages/Mentorship';
import MentorshipThread from './pages/MentorshipThread';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPosts from './pages/admin/AdminPosts';
import AdminEvents from './pages/admin/AdminEvents';
import AdminJobs from './pages/admin/AdminJobs';
import AdminReports from './pages/admin/AdminReports';
import AccountSettings from './pages/AccountSettings';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0080FF] flex items-center justify-center">
        <div className="text-white font-black font-mono text-4xl animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'superadmin':
      return <SuperAdminDashboard />;
    case 'subadmin':
      return <SubAdminDashboard />;
    case 'alumni':
    case 'student':
    case 'user':
      return <UserDashboard />;
    default:
      return <UserDashboard />;
  }
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div
            className="App"
            style={{
              fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
            }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/*"
                element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/alumni" element={<Alumni />} />
                      <Route path="/alumni/:id" element={<AlumniProfile />} />
                      <Route path="/blogs" element={<Blogs />} />
                      <Route path="/blog/:id" element={<BlogPost />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/:id" element={<EventDetail />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/jobs/:id" element={<JobDetail />} />
                      <Route path="/mentorship" element={<Mentorship />} />
                      <Route path="/mentorship/requests" element={<Mentorship />} />
                      <Route path="/mentorship/:id" element={<MentorshipThread />} />
                      <Route path="/groups" element={<Groups />} />
                      <Route path="/groups/:id" element={<GroupDetail />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <AccountSettings />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/:role"
                        element={
                          <ProtectedRoute>
                            <DashboardRouter />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute allowedRoles={['superadmin', 'subadmin']}>
                            <AdminLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AdminOverview />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="posts" element={<AdminPosts />} />
                        <Route path="events" element={<AdminEvents />} />
                        <Route path="jobs" element={<AdminJobs />} />
                        <Route path="reports" element={<AdminReports />} />
                      </Route>
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
