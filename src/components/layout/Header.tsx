import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, BookOpen, Moon, Sun, MessageCircle, Bell, Users, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getPendingConnections, getAllConversations, subscribeToPendingConnections, subscribeToConversations } from '../../services/firebaseFirestore';
import { subscribeNotifications } from '../../services/platformFirestore';
import { isAdmin } from '../../lib/roles';
import Button from '../common/Button';
import SocialPanel from '../common/SocialPanel';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [showSocialPanel, setShowSocialPanel] = useState(false);
  const [socialPanelTab, setSocialPanelTab] = useState<'messages' | 'notifications' | 'connections'>('messages');
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadAppNotifs, setUnreadAppNotifs] = useState(0);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; right: number } | null>(null);
  const connectionsButtonRef = useRef<HTMLButtonElement>(null);
  const messagesButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!user) {
      setPendingCount(0);
      setUnreadMessagesCount(0);
      return;
    }

    // Load initial counts
    const loadCounts = async () => {
      try {
        const [pending, conversations] = await Promise.all([
          getPendingConnections(user.id),
          getAllConversations(user.id),
        ]);
        setPendingCount(pending.length);
        const unread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
        setUnreadMessagesCount(unread);
      } catch (error) {
        console.error('Error loading counts:', error);
      }
    };

    loadCounts();

    // Subscribe to real-time updates for connections
    const unsubscribeConnections = subscribeToPendingConnections(user.id, (connections) => {
      setPendingCount(connections.length);
    });

    // Subscribe to real-time updates for conversations
    const unsubscribeConversations = subscribeToConversations(user.id, (conversations) => {
      const unread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadMessagesCount(unread);
    });

    return () => {
      unsubscribeConnections();
      unsubscribeConversations();
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadAppNotifs(0);
      return;
    }
    const unsub = subscribeNotifications(user.id, (items) => {
      setUnreadAppNotifs(items.filter((n) => !n.read).length);
    });
    return () => unsub();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenSocialPanel = (tab: 'messages' | 'notifications' | 'connections') => {
    setSocialPanelTab(tab);
    
    // Get the button position based on which tab was clicked
    let buttonRef: React.RefObject<HTMLButtonElement> | null = null;
    if (tab === 'connections') buttonRef = connectionsButtonRef;
    else if (tab === 'messages') buttonRef = messagesButtonRef;
    else if (tab === 'notifications') buttonRef = notificationsButtonRef;
    
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + 8, // 8px gap below button
        right: window.innerWidth - rect.right,
      });
    } else {
      // Fallback: position at top-right
      setButtonPosition({ top: 64, right: 16 });
    }
    
    setShowSocialPanel(true);
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

          <nav className="hidden lg:flex items-center gap-4 flex-wrap">
            <Link 
              to="/alumni" 
              className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors flex items-center gap-2 text-sm"
            >
              <User size={18} />
              Alumni
            </Link>
            <Link 
              to="/blogs" 
              className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors flex items-center gap-2 text-sm"
            >
              <BookOpen size={18} />
              Blogs
            </Link>
            <Link to="/events" className="text-[var(--muted)] hover:text-[var(--fg)] text-sm">Events</Link>
            <Link to="/jobs" className="text-[var(--muted)] hover:text-[var(--fg)] text-sm">Jobs</Link>
            <Link to="/mentorship" className="text-[var(--muted)] hover:text-[var(--fg)] text-sm">Mentorship</Link>
            <Link to="/groups" className="text-[var(--muted)] hover:text-[var(--fg)] text-sm">Groups</Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {user && (
              <>
                {/* Messages Icon */}
                <button
                  ref={messagesButtonRef}
                  onClick={() => handleOpenSocialPanel('messages')}
                  className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-subtle hover:shadow-card transition-shadow"
                  aria-label="Messages"
                >
                  <MessageCircle size={18} />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FF0080] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </button>

                {/* Notifications Icon */}
                <button
                  ref={notificationsButtonRef}
                  onClick={() => handleOpenSocialPanel('notifications')}
                  className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-subtle hover:shadow-card transition-shadow"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {(pendingCount + unreadAppNotifs) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#00FF80] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white">
                      {(pendingCount + unreadAppNotifs) > 9 ? '9+' : pendingCount + unreadAppNotifs}
                    </span>
                  )}
                </button>

                {/* Connections Icon */}
                <button
                  ref={connectionsButtonRef}
                  onClick={() => handleOpenSocialPanel('connections')}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-subtle hover:shadow-card transition-shadow"
                  aria-label="Connections"
                >
                  <Users size={18} />
                </button>
              </>
            )}
            <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-subtle hover:shadow-card transition-shadow"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin(user) && (
                  <Link to="/admin" className="text-xs text-[var(--primary)] font-medium hidden sm:inline">
                    Admin
                  </Link>
                )}
                <Link
                  to={`/dashboard/${user.role}`}
                  className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                >
                  {user.name}
                </Link>
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--fg)]"
                  title="Account settings"
                >
                  <Settings size={16} />
                  <span className="hidden sm:inline">Settings</span>
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
      {showSocialPanel && user && buttonPosition && (
        <SocialPanel
          initialTab={socialPanelTab}
          onClose={() => {
            setShowSocialPanel(false);
            setButtonPosition(null);
          }}
          position={buttonPosition}
        />
      )}
    </header>
  );
};

export default Header;