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
    <div className="min-h-screen bg-[#0080FF] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-[#FF0080] border-4 border-black transform rotate-45"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-[#00FF80] border-4 border-black transform -rotate-12"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-white border-4 border-black"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card variant="primary" className="transform -rotate-1">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#FF0080] border-4 border-black mx-auto mb-4 flex items-center justify-center transform rotate-12">
              <LogIn size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black font-mono uppercase text-black">
              LOGIN TO
              <br />
              <span className="text-[#FF0080]">RECONNECT</span>
            </h1>
          </div>
          
          {error && (
            <div className="bg-red-500 border-4 border-black p-4 mb-6 text-white font-bold font-mono uppercase text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <Input
                type="email"
                label="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <Input
                type="password"
                label="PASSWORD"
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
              className="w-full flex items-center justify-center gap-3"
            >
              <LogIn size={20} />
              LOGIN
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t-4 border-black text-center">
            <p className="font-mono font-bold text-black mb-4">
              Don't have an account?
            </p>
            <Link 
              to="/signup" 
              className="inline-block bg-[#FF0080] text-white border-4 border-black px-6 py-3 font-bold font-mono uppercase hover:bg-[#CC0066] transition-colors transform hover:scale-105 mb-6"
            >
              SIGN UP HERE
            </Link>
            <p className="font-mono font-bold text-black uppercase mb-4 mt-6">
              Demo Credentials:
            </p>
            <div className="space-y-2 text-sm font-mono">
              <div className="bg-[#00FF80] border-2 border-black p-2">
                <strong>Super Admin:</strong> superadmin@university.edu
              </div>
              <div className="bg-[#FF0080] text-white border-2 border-black p-2">
                <strong>Sub Admin:</strong> admin@college.edu
              </div>
              <div className="bg-[#0080FF] text-white border-2 border-black p-2">
                <strong>Alumni:</strong> alumni@example.com
              </div>
              <div className="bg-[#FF4444] text-white border-2 border-black p-2">
                <strong>Student:</strong> student@example.com
              </div>
              <div className="bg-gray-600 text-white border-2 border-black p-2">
                <strong>User:</strong> user@example.com
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Password: any text works
              </div>
            </div>
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

export default Login;