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

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0080FF] flex items-center justify-center">
        <div className="text-white font-black font-mono text-4xl animate-pulse">
          LOADING...
        </div>
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

// Dashboard Router component
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
      return <UserDashboard />; // All regular users get the universal dashboard
    default:
      return <UserDashboard />; // Default to universal dashboard
  }
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <div className="App" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
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
                    <Route
                      path="/dashboard/:role"
                      element={
                        <ProtectedRoute>
                          <DashboardRouter />
                        </ProtectedRoute>
                      }
                    />
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