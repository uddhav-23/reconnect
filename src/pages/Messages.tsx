import React from 'react';
import ChatInterface from '../components/common/ChatInterface';
import PageHero from '../components/layout/PageHero';

/** Full-page messaging (header messages icon opens this route). */
const Messages: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      <PageHero
        eyebrow="Inbox"
        title="Messages"
        titleGradientPart="Messages"
        subtitle="Direct chats with alumni and members — pick a conversation or start one from a profile."
      />
      <section className="app-page-section pt-0 -mt-2 sm:-mt-4 flex-1 flex flex-col min-h-0">
        <div className="container mx-auto max-w-6xl flex flex-col min-h-0 flex-1 w-full">
          <div
            className="app-surface border-violet-500/15 flex flex-col flex-1 min-h-[min(72vh,720px)] max-h-[min(85dvh,880px)] overflow-hidden shadow-xl shadow-violet-500/[0.06] dark:shadow-black/25"
          >
            <ChatInterface layout="page" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Messages;
