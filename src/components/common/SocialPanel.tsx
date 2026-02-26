import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Bell, Users, Check, X as XIcon, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingConnections, getAllConnections, updateConnection, getUserById, subscribeToPendingConnections } from '../../services/firebaseFirestore';
import { Connection, User as UserType } from '../../types';
import ChatInterface from './ChatInterface';
import Button from './Button';

interface SocialPanelProps {
  initialTab?: 'messages' | 'notifications' | 'connections';
  onClose: () => void;
  position?: { top: number; right: number };
}

const SocialPanel: React.FC<SocialPanelProps> = ({ initialTab = 'messages', onClose, position }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications' | 'connections'>(initialTab);
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [allConnections, setAllConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionUsers, setConnectionUsers] = useState<Map<string, UserType>>(new Map());
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [pending, all] = await Promise.all([
          getPendingConnections(user.id),
          getAllConnections(user.id),
        ]);
        setPendingConnections(pending);
        setAllConnections(all);

        // Load user data for all connections
        const userIds = new Set<string>();
        [...pending, ...all].forEach(conn => {
          if (conn.requesterId !== user.id) userIds.add(conn.requesterId);
          if (conn.receiverId !== user.id) userIds.add(conn.receiverId);
        });

        const usersMap = new Map<string, UserType>();
        for (const userId of userIds) {
          const userData = await getUserById(userId);
          if (userData) usersMap.set(userId, userData);
        }
        setConnectionUsers(usersMap);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToPendingConnections(user.id, (connections) => {
      setPendingConnections(connections);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      await updateConnection(connectionId, 'accepted');
      setPendingConnections(prev => prev.filter(c => c.id !== connectionId));
      // Reload all connections
      const all = await getAllConnections(user!.id);
      setAllConnections(all);
    } catch (error: any) {
      console.error('Error accepting connection:', error);
      alert(`Failed to accept connection: ${error.message}`);
    }
  };

  const handleRejectConnection = async (connectionId: string) => {
    try {
      await updateConnection(connectionId, 'rejected');
      setPendingConnections(prev => prev.filter(c => c.id !== connectionId));
    } catch (error: any) {
      console.error('Error rejecting connection:', error);
      alert(`Failed to reject connection: ${error.message}`);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={onClose} />
      
      {/* Panel positioned below button */}
      <div 
        ref={panelRef} 
        className="fixed z-50 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-card w-full max-w-md max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden"
        style={{
          top: position ? `${position.top}px` : '64px',
          right: position ? `${position.right}px` : '16px',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'messages'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <MessageCircle size={16} />
              Messages
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 relative ${
                activeTab === 'notifications'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Bell size={16} />
              Notifications
              {pendingConnections.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {pendingConnections.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'connections'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Users size={16} />
              Connections
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-[var(--fg)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'messages' && (
            <div className="h-full">
              <ChatInterface onClose={onClose} />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="h-full overflow-y-auto p-4 bg-[var(--bg)]">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-[var(--muted)]">Loading notifications...</p>
                </div>
              ) : pendingConnections.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={64} className="mx-auto text-[var(--muted)] mb-4" />
                  <p className="text-lg text-[var(--fg)] mb-2">No pending requests</p>
                  <p className="text-sm text-[var(--muted)]">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingConnections.map((connection) => {
                    const requester = connectionUsers.get(connection.requesterId);
                    return (
                      <div
                        key={connection.id}
                        className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                              <User size={24} className="text-[var(--fg)]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--fg)]">
                                {requester?.name || `User ${connection.requesterId.slice(0, 8)}`}
                              </p>
                              <p className="text-xs text-[var(--muted)]">
                                {requester?.email || 'No email'}
                              </p>
                              <p className="text-xs text-[var(--muted)] mt-1">
                                Requested {formatTime(connection.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleAcceptConnection(connection.id)}
                              className="flex items-center gap-2"
                            >
                              <Check size={16} />
                              Accept
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectConnection(connection.id)}
                              className="flex items-center gap-2"
                            >
                              <XIcon size={16} />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="h-full overflow-y-auto p-4 bg-[var(--bg)]">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-[var(--muted)]">Loading connections...</p>
                </div>
              ) : allConnections.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={64} className="mx-auto text-[var(--muted)] mb-4" />
                  <p className="text-lg text-[var(--fg)] mb-2">No connections yet</p>
                  <p className="text-sm text-[var(--muted)]">Start connecting with alumni!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allConnections.map((connection) => {
                    const otherUser = connectionUsers.get(
                      connection.requesterId === user.id ? connection.receiverId : connection.requesterId
                    );
                    const isRequester = connection.requesterId === user.id;
                    return (
                      <div
                        key={connection.id}
                        className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                              <User size={24} className="text-[var(--fg)]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--fg)]">
                                {otherUser?.name || `User ${(connection.requesterId === user.id ? connection.receiverId : connection.requesterId).slice(0, 8)}`}
                              </p>
                              <p className="text-xs text-[var(--muted)]">
                                {otherUser?.email || 'No email'}
                              </p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  connection.status === 'accepted' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                  connection.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                }`}>
                                  {connection.status}
                                </span>
                                <span className="text-xs text-[var(--muted)]">
                                  {isRequester ? 'You requested' : 'Requested from you'} • {formatTime(connection.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SocialPanel;

