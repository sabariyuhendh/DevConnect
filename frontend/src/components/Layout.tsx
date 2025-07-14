
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <Navbar />
      
      {/* Main content area */}
      <div className="flex flex-1 w-full relative">
        <main className="flex-1 overflow-auto relative">
          <Outlet />
        </main>
      </div>
      
      {/* Footer */}
      <div className="w-full footer-wrapper">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
