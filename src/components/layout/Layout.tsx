import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] overflow-x-hidden">
      <Header />
      <main className="container mx-auto max-w-full px-3 sm:px-4 py-4 sm:py-6">{children}</main>
    </div>
  );
};

export default Layout;