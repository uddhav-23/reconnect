import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user' as 'user' | 'alumni' | 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await signup(formData.email, formData.password, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone || undefined,
        createdAt: new Date().toISOString(),
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 home-hero-mesh">
      <div className="w-full max-w-md">
        <Card variant="primary" className="border-violet-500/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <UserPlus size={28} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-[var(--fg)]">
              Sign up for Reconnect
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Join our alumni network
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md p-4 mb-6 text-red-800 dark:text-red-200 text-sm text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] z-10" size={20} />
              <Input
                type="text"
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="pl-12"
                placeholder="John Doe"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] z-10" size={20} />
              <Input
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-12"
                placeholder="your@email.com"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] z-10" size={20} />
              <Input
                type="tel"
                name="phone"
                label="Phone Number (Optional)"
                value={formData.phone}
                onChange={handleChange}
                className="pl-12"
                placeholder="+1-555-0123"
              />
            </div>

            <div>
              <label className="block text-[var(--fg)] font-medium mb-2 text-sm">
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="app-input"
                required
              >
                <option value="user">General User</option>
                <option value="alumni">Alumni</option>
                <option value="student">Current Student</option>
              </select>
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] z-10" size={20} />
              <Input
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-12"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)] z-10" size={20} />
              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="pl-12"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              className="w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--muted)] mb-4">
              Already have an account?
            </p>
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                Login Here
              </Button>
            </Link>
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

export default Signup;

