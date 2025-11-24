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
    <div className="min-h-screen bg-[#FF0080] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-[#00FF80] border-4 border-black transform -rotate-45"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-[#0080FF] border-4 border-black transform rotate-12"></div>
      <div className="absolute top-1/2 right-10 w-16 h-16 bg-white border-4 border-black"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card variant="primary" className="transform rotate-1">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#00FF80] border-4 border-black mx-auto mb-4 flex items-center justify-center transform -rotate-12">
              <UserPlus size={32} className="text-black" />
            </div>
            <h1 className="text-3xl font-black font-mono uppercase text-black">
              SIGN UP FOR
              <br />
              <span className="text-[#FF0080]">RECONNECT</span>
            </h1>
            <p className="font-mono text-sm text-gray-600 mt-2">
              Join our alumni network
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500 border-4 border-black p-4 mb-6 text-white font-bold font-mono uppercase text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" size={20} />
              <Input
                type="text"
                name="name"
                label="FULL NAME"
                value={formData.name}
                onChange={handleChange}
                required
                className="pl-12"
                placeholder="John Doe"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" size={20} />
              <Input
                type="email"
                name="email"
                label="EMAIL ADDRESS"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-12"
                placeholder="your@email.com"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" size={20} />
              <Input
                type="tel"
                name="phone"
                label="PHONE NUMBER (OPTIONAL)"
                value={formData.phone}
                onChange={handleChange}
                className="pl-12"
                placeholder="+1-555-0123"
              />
            </div>

            <div>
              <label className="block text-black font-bold mb-2 font-mono uppercase tracking-wide">
                ACCOUNT TYPE
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border-4 border-black shadow-[4px_4px_0px_#000000] focus:outline-none focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-200 font-mono bg-white"
                required
              >
                <option value="user">General User</option>
                <option value="alumni">Alumni</option>
                <option value="student">Current Student</option>
              </select>
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" size={20} />
              <Input
                type="password"
                name="password"
                label="PASSWORD"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-12"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" size={20} />
              <Input
                type="password"
                name="confirmPassword"
                label="CONFIRM PASSWORD"
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
              className="w-full flex items-center justify-center gap-3"
              disabled={loading}
            >
              <UserPlus size={20} />
              {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t-4 border-black text-center">
            <p className="font-mono font-bold text-black mb-4">
              Already have an account?
            </p>
            <Link 
              to="/login" 
              className="inline-block bg-[#0080FF] text-white border-4 border-black px-6 py-3 font-bold font-mono uppercase hover:bg-[#0066CC] transition-colors transform hover:scale-105"
            >
              LOGIN HERE
            </Link>
          </div>
        </Card>
        
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-white font-bold font-mono uppercase hover:text-[#00FF80] transition-colors"
          >
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

