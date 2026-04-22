import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 home-hero-mesh opacity-[0.4] dark:opacity-[0.22] -z-10"
        aria-hidden
      />
      <Header />
      <main className="relative container mx-auto max-w-full px-3 sm:px-4 py-4 sm:py-6">{children}</main>
    </div>
  );
};

export default Layout;