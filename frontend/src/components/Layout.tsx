
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Layout = () => {
  const location = useLocation();
  const isMessagesPage = location.pathname === '/messages';
  const isCavePage = location.pathname === '/cave';
  const isFullScreenPage = isMessagesPage || isCavePage;

  return (
    <div className={`w-full flex flex-col bg-background ${isFullScreenPage ? 'h-screen' : 'min-h-screen'}`}>
      <Navbar />
      
      {/* Main content area */}
      <div className={`flex flex-1 w-full relative ${isFullScreenPage ? 'h-[calc(100vh-4rem)] overflow-hidden' : ''}`}>
        <main className={`flex-1 w-full ${isFullScreenPage ? 'h-full overflow-hidden p-0' : 'overflow-y-auto overflow-x-hidden px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-20 sm:pb-24'}`}>
          <div className={isFullScreenPage ? '' : 'max-w-7xl mx-auto'}>
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Footer - Hidden on Messages and Cave pages */}
      {!isFullScreenPage && (
        <div className="w-full footer-wrapper">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Layout;
