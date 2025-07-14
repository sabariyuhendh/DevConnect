
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col bg-background">
        <Navbar />
        
        {/* Content area with sidebar - completely isolated from footer */}
        <div className="flex flex-1 w-full relative">
          <AppSidebar />
          {/* Main content with left border - border stops at this container */}
          <main className="flex-1 border-l border-border overflow-auto relative">
            <Outlet />
          </main>
        </div>
        
        {/* Footer - completely separate container outside any bordered areas */}
        <div className="w-full footer-wrapper">
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
