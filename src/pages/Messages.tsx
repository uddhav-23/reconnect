import React from 'react';
import ChatInterface from '../components/common/ChatInterface';

/** Full-page messaging (header messages icon opens this route). */
const Messages: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col min-h-0">
        <h1 className="text-2xl font-semibold text-[var(--fg)] mb-4">Messages</h1>
        <div className="flex-1 min-h-0 rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--card)] shadow-subtle">
          <ChatInterface layout="page" />
        </div>
      </div>
    </div>
  );
};

export default Messages;
