import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      // Show more specific error messages
      if (err.message?.includes('user-not-found')) {
        setError('User not found. Please check your email or sign up first.');
      } else if (err.message?.includes('wrong-password')) {
        setError('Incorrect password. Please try again or reset your password.');
      } else if (err.message?.includes('User data not found')) {
        setError('User account exists but profile is missing. Please contact admin.');
      } else if (err.message?.includes('invalid-credential')) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(err.message || 'Invalid credentials. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 home-hero-mesh">
      <div className="w-full max-w-md">
        <Card variant="primary" className="border-violet-500/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <LogIn size={28} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-[var(--fg)]">
              Login to Reconnect
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Welcome back! Please sign in to continue.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md p-4 mb-6 text-red-800 dark:text-red-200 text-sm text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)]" size={20} />
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)]" size={20} />
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-12"
                placeholder="••••••••"
              />
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              className="w-full flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              Login
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--muted)] mb-4">
              Don't have an account?
            </p>
            <Button variant="secondary" className="w-full" to="/signup">
              Sign Up Here
            </Button>
            
            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--fg)] mb-4">
                Demo Credentials:
              </p>
              <div className="space-y-2 text-xs">
                <div className="app-surface rounded-xl p-3">
                  <strong className="text-[var(--fg)]">Super Admin:</strong> <span className="text-[var(--muted)]">superadmin@university.edu</span>
                </div>
                <div className="app-surface rounded-xl p-3">
                  <strong className="text-[var(--fg)]">Sub Admin:</strong> <span className="text-[var(--muted)]">admin@college.edu</span>
                </div>
                <div className="app-surface rounded-xl p-3">
                  <strong className="text-[var(--fg)]">Alumni:</strong> <span className="text-[var(--muted)]">alumni@example.com</span>
                </div>
                <div className="app-surface rounded-xl p-3">
                  <strong className="text-[var(--fg)]">Student:</strong> <span className="text-[var(--muted)]">student@example.com</span>
                </div>
                <div className="app-surface rounded-xl p-3">
                  <strong className="text-[var(--fg)]">User:</strong> <span className="text-[var(--muted)]">user@example.com</span>
                </div>
                <div className="mt-3 text-xs text-[var(--muted)]">
                  Password: any text works
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors inline-flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;