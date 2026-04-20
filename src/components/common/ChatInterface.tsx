import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Users, Trash2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllConversations, getMessages, createMessage, subscribeToMessages, getUserById, markConversationAsRead, deleteMessage, subscribeToConversations } from '../../services/firebaseFirestore';
import { Message, User as UserType } from '../../types';
import Button from './Button';

interface ChatInterfaceProps {
  onClose?: () => void;
  /** `page` = tall layout for /messages; `panel` = fixed height in popover */
  layout?: 'panel' | 'page';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, layout = 'panel' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<{ userId: string; lastMessage: Message; unreadCount: number }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [peerLabels, setPeerLabels] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const shellClass =
    layout === 'page'
      ? 'flex flex-col md:flex-row min-h-[min(520px,calc(100dvh-9rem))] md:min-h-[min(880px,calc(100vh-10rem))] h-[min(85dvh,calc(100vh-8rem))] md:h-[min(880px,calc(100vh-10rem))]'
      : 'flex flex-col md:flex-row h-[min(85dvh,720px)] md:h-[600px]';

  useEffect(() => {
    if (!user) return;
    
    const loadConversations = async () => {
      try {
        const convos = await getAllConversations(user.id);
        setConversations(convos);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Subscribe to real-time conversation updates
    const unsubscribe = subscribeToConversations(user.id, (conversations) => {
      setConversations(conversations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!conversations.length) return;
    let cancelled = false;
    void (async () => {
      const need = conversations.map((c) => c.userId);
      const next: Record<string, string> = {};
      for (const id of need) {
        const u = await getUserById(id);
        if (u?.name) next[id] = u.name;
      }
      if (!cancelled && Object.keys(next).length > 0) {
        setPeerLabels((prev) => ({ ...prev, ...next }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversations]);

  useEffect(() => {
    if (!user || !selectedUserId) return;

    const loadUser = async () => {
      const userData = await getUserById(selectedUserId);
      setOtherUser(userData);
    };

    const loadMessages = async () => {
      try {
        const msgs = await getMessages(user.id, selectedUserId);
        setMessages(msgs);
        // Mark conversation as read when viewing
        await markConversationAsRead(user.id, selectedUserId);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadUser();
    loadMessages();

    // Subscribe to real-time messages
    const unsubscribe = subscribeToMessages(user.id, selectedUserId, async (newMessages) => {
      setMessages(newMessages);
      // Mark conversation as read when new messages arrive (if user is viewing)
      await markConversationAsRead(user.id, selectedUserId);
    });

    return () => unsubscribe();
  }, [user, selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUserId || !messageContent.trim()) return;

    try {
      await createMessage({
        senderId: user.id,
        receiverId: selectedUserId,
        content: messageContent.trim(),
      });
      setMessageContent('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message}`);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await deleteMessage(messageId, user.id);
      // Message will be filtered out automatically by getMessages
    } catch (error: any) {
      console.error('Error deleting message:', error);
      alert(`Failed to delete message: ${error.message}`);
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
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[var(--muted)]">Please log in to use messaging</p>
      </div>
    );
  }

  return (
    <div className={`${shellClass} bg-[var(--bg)] border-0 sm:border border-[var(--border)] rounded-lg overflow-hidden`}>
      {/* Conversations List */}
      <div
        className={`w-full md:w-[min(100%,320px)] md:max-w-[320px] md:flex-shrink-0 border-[var(--border)] overflow-y-auto bg-[var(--card)] flex flex-col min-h-0 max-h-[45dvh] md:max-h-none md:h-auto border-b md:border-b-0 md:border-r ${
          selectedUserId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-[var(--border)] bg-[var(--card)]">
          <h3 className="font-semibold text-[var(--fg)] text-lg flex items-center gap-2">
            <MessageCircle size={20} />
            Messages
          </h3>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[var(--muted)]">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center h-full flex flex-col items-center justify-center">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 mb-6">
              <MessageCircle size={64} className="mx-auto text-[var(--muted)] mb-4" />
              <p className="font-semibold text-lg text-[var(--fg)] mb-2">No conversations yet</p>
              <p className="text-sm text-[var(--muted)] mb-6">Start connecting with alumni to begin messaging!</p>
              <Button
                variant="primary"
                onClick={() => {
                  if (onClose) onClose();
                  navigate('/alumni');
                }}
                className="flex items-center gap-2 mx-auto"
              >
                <Users size={20} />
                Connect with More
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--card)]">
            {conversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => setSelectedUserId(conv.userId)}
                className={`w-full p-4 border-b border-[var(--border)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left ${
                  selectedUserId === conv.userId ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-[var(--card)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center ${
                    selectedUserId === conv.userId ? 'ring-2 ring-[var(--primary)]' : ''
                  }`}>
                    <User size={24} className="text-[var(--fg)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm truncate ${
                        selectedUserId === conv.userId ? 'text-[var(--fg)]' : 'text-[var(--fg)]'
                      }`}
                      title={peerLabels[conv.userId] || conv.userId}
                    >
                      {peerLabels[conv.userId] || `Member ${conv.userId.slice(0, 8)}…`}
                    </p>
                    <p className={`text-xs truncate ${
                      selectedUserId === conv.userId ? 'text-[var(--muted)]' : 'text-[var(--muted)]'
                    }`}>
                      {conv.lastMessage.content}
                    </p>
                    <p className={`text-xs ${
                      selectedUserId === conv.userId ? 'text-[var(--muted)]' : 'text-[var(--muted)]'
                    }`}>
                      {formatTime(conv.lastMessage.createdAt)}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div
        className={`flex-1 flex flex-col bg-[var(--bg)] min-h-0 min-w-0 ${
          !selectedUserId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedUserId ? (
          <>
            <button
              type="button"
              className="md:hidden flex items-center gap-1 px-4 pt-3 pb-1 text-sm font-medium text-[var(--primary)]"
              onClick={() => setSelectedUserId(null)}
            >
              <ChevronLeft size={18} aria-hidden />
              All chats
            </button>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <User size={24} className="text-[var(--fg)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--fg)] truncate">
                      {otherUser?.name || peerLabels[selectedUserId] || 'Loading…'}
                    </p>
                    <p className="text-xs text-[var(--muted)] truncate">{otherUser?.email || ''}</p>
                  </div>
                </div>
                {onClose && (
                  <Button variant="secondary" size="sm" onClick={onClose} className="shrink-0 hidden sm:inline-flex">
                    Close
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[var(--bg)] space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle size={48} className="mx-auto text-[var(--muted)] mb-4" />
                  <p className="text-[var(--muted)]">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSent = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[min(85%,20rem)] sm:max-w-[70%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg group relative ${
                          isSent
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--card)] text-[var(--fg)] border border-[var(--border)]'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <p className={`text-xs ${isSent ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                            {formatTime(msg.createdAt)}
                            {msg.read && isSent && (
                              <span className="ml-2">✓</span>
                            )}
                          </p>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                            aria-label="Delete message"
                            title="Delete message"
                          >
                            <Trash2 size={14} className={isSent ? 'text-white/70' : 'text-[var(--muted)]'} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--card)]">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)] placeholder:text-[var(--muted)]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
                >
                  <Send size={18} />
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[var(--bg)]">
            <div className="text-center bg-[var(--card)] border border-[var(--border)] rounded-lg p-8">
              <MessageCircle size={64} className="mx-auto text-[var(--muted)] mb-4" />
              <p className="font-semibold text-lg text-[var(--fg)] mb-2">Select a conversation</p>
              <p className="text-sm text-[var(--muted)] mb-6">Choose a user from the list to start messaging</p>
              {conversations.length === 0 && (
                <Button
                  variant="primary"
                  onClick={() => {
                    if (onClose) onClose();
                    navigate('/alumni');
                  }}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Users size={20} />
                  Connect with More
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

