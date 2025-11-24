import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, BookOpen, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-[var(--card)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--card)/0.65] border-[var(--border)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-xl md:text-2xl font-semibold text-[var(--fg)] tracking-tight hover:text-[var(--primary)] transition-colors"
          >
            Reconnect
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/alumni" 
              className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors flex items-center gap-2"
            >
              <User size={20} />
              Alumni
            </Link>
            <Link 
              to="/blogs" 
              className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors flex items-center gap-2"
            >
              <BookOpen size={20} />
              Blogs
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-subtle hover:shadow-card transition-shadow"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to={`/dashboard/${user.role}`}
                  className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                >
                  {user.name}
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;