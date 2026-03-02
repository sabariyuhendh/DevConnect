import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Home, User, PenTool, MessageSquare, Briefcase, Calendar, BarChart3, Settings, Users, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
const navigationItems = [{
  title: 'Feed',
  url: '/feed',
  icon: Home
}, {
  title: 'Profile',
  url: '/profile',
  icon: User
}, {
  title: 'Write',
  url: '/create',
  icon: PenTool
}, {
  title: 'Messages',
  url: '/messages',
  icon: MessageSquare
}, {
  title: 'Network',
  url: '/network',
  icon: Users
}, {
  title: 'Jobs',
  url: '/jobs',
  icon: Briefcase
}, {
  title: 'Events',
  url: '/events',
  icon: Calendar
}, {
  title: 'Analytics',
  url: '/analytics',
  icon: BarChart3
}, {
  title: 'Settings',
  url: '/settings',
  icon: Settings
}];
export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';
  
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  
  return <Sidebar className={`${isCollapsed ? 'w-14' : 'w-64'} flex-shrink-0`} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={currentPath === '/admin'}>
                    <NavLink to="/admin">
                      <Shield />
                      <span>Admin</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={currentPath === '/superadmin'}>
                    <NavLink to="/superadmin">
                      <ShieldCheck />
                      <span>Super Admin</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}