import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  User,
  BookOpen,
  Moon,
  Sun,
  MessageCircle,
  Bell,
  Users,
  Settings,
  Menu,
  X,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getPendingConnections, getAllConversations, subscribeToPendingConnections, subscribeToConversations } from '../../services/firebaseFirestore';
import { subscribeNotifications } from '../../services/platformFirestore';
import { isAdmin } from '../../lib/roles';
import Button from '../common/Button';
import SocialPanel from '../common/SocialPanel';
import type { AppNotification } from '../../types';

const navLinks = [
  { to: '/alumni', label: 'Alumni', icon: User },
  { to: '/blogs', label: 'Blogs', icon: BookOpen },
  { to: '/events', label: 'Events' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/mentorship', label: 'Mentorship' },
  { to: '/groups', label: 'Groups' },
] as const;

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);
  const { resolvedTheme, toggleTheme } = useTheme();
  const [showSocialPanel, setShowSocialPanel] = useState(false);
  const [socialPanelTab, setSocialPanelTab] = useState<'messages' | 'notifications' | 'connections'>('messages');
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadAppNotifs, setUnreadAppNotifs] = useState(0);
  const [topNotification, setTopNotification] = useState<AppNotification | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; right: number } | null>(null);
  const connectionsButtonRef = useRef<HTMLButtonElement>(null);
  const messagesButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const hasHydratedNotificationsRef = useRef(false);

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
      setTopNotification(null);
      seenNotificationIdsRef.current.clear();
      hasHydratedNotificationsRef.current = false;
      return;
    }
    const unsub = subscribeNotifications(user.id, (items) => {
      setUnreadAppNotifs(items.filter((n) => !n.read).length);

      const incomingIds = new Set(items.map((n) => n.id));
      if (!hasHydratedNotificationsRef.current) {
        seenNotificationIdsRef.current = incomingIds;
        hasHydratedNotificationsRef.current = true;
        return;
      }

      const latestNew = items.find((n) => !seenNotificationIdsRef.current.has(n.id));
      if (latestNew) {
        setTopNotification(latestNew);
      }

      seenNotificationIdsRef.current = incomingIds;
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!topNotification) return;
    const timeout = window.setTimeout(() => {
      setTopNotification(null);
    }, 10000);
    return () => window.clearTimeout(timeout);
  }, [topNotification]);

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
      {topNotification && (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex justify-center px-3">
          <div className="pointer-events-auto w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)]/95 shadow-xl backdrop-blur">
            <div className="flex items-start gap-3 p-3">
              <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300">
                <Bell size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--fg)]">{topNotification.title || 'New notification'}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">{topNotification.body || 'You received a new notification.'}</p>
              </div>
              <button
                type="button"
                onClick={() => setTopNotification(null)}
                className="rounded-md p-1 text-[var(--muted)] transition-colors hover:bg-neutral-100 hover:text-[var(--fg)] dark:hover:bg-neutral-800"
                aria-label="Dismiss notification popup"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto max-w-full px-3 sm:px-4 py-2.5 sm:py-3 relative">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] shrink-0"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link
              to="/"
              className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--fg)] tracking-tight hover:text-[var(--primary)] transition-colors truncate min-w-0"
            >
              Reconnect
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-4 flex-wrap" aria-label="Main">
            {navLinks.map((item) =>
              'icon' in item && item.icon ? (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors flex items-center gap-2 text-sm"
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-[var(--muted)] hover:text-[var(--fg)] text-sm"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
            {user && (
              <>
                {/* Messages Icon */}
                <button
                  ref={messagesButtonRef}
                  type="button"
                  onClick={() => navigate('/messages')}
                  className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-subtle hover:shadow-card transition-shadow"
                  aria-label="Messages"
                  title="Open messages"
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
              <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                {isAdmin(user) && (
                  <Link
                    to="/admin"
                    className="text-xs text-[var(--primary)] font-medium hidden md:inline shrink-0"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to={`/dashboard/${user.role}`}
                  className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors truncate max-w-[4.5rem] sm:max-w-[10rem] md:max-w-[14rem] text-xs sm:text-sm"
                  title={user.name}
                >
                  {user.name}
                </Link>
                <Link
                  to="/settings"
                  className="inline-flex items-center justify-center h-9 w-9 sm:w-auto sm:px-2 rounded-md border border-transparent text-[var(--muted)] hover:text-[var(--fg)] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  title="Account settings"
                >
                  <Settings size={18} />
                  <span className="hidden lg:inline ml-1 text-sm">Settings</span>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2 sm:px-3"
                  title="Log out"
                >
                  <LogOut size={16} className="sm:mr-0" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile / tablet navigation */}
        {mobileNavOpen && (
          <>
            <button
              type="button"
              className="lg:hidden fixed inset-0 z-[45] bg-black/40"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            />
            <nav
              className="lg:hidden absolute left-0 right-0 top-full z-[48] border-b border-[var(--border)] bg-[var(--card)] shadow-lg px-3 py-3 flex flex-col gap-1 max-h-[min(70vh,calc(100dvh-4rem))] overflow-y-auto"
              aria-label="Mobile main"
            >
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 px-3 py-3 rounded-md text-base text-[var(--fg)] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {'icon' in item && item.icon && <item.icon size={20} className="shrink-0 text-[var(--muted)]" />}
                  {item.label}
                </Link>
              ))}
              {user && (
                <>
                  <div className="border-t border-[var(--border)] my-2 pt-2" />
                  <Link
                    to="/mentorship/hub"
                    className="flex items-center gap-2 px-3 py-3 rounded-md text-base text-[var(--fg)] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <Sparkles size={20} className="shrink-0 text-violet-500" />
                    Mentorship hub
                  </Link>
                  <Link
                    to="/jobs/my-applications"
                    className="flex items-center gap-2 px-3 py-3 rounded-md text-base text-[var(--fg)] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <Briefcase size={20} className="shrink-0 text-violet-500" />
                    My job applications
                  </Link>
                </>
              )}
            </nav>
          </>
        )}
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