import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Home, User, PenTool, MessageSquare, Briefcase, Calendar, BarChart3, Settings, Users } from 'lucide-react';
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
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';
  return <Sidebar className={`${isCollapsed ? 'w-14' : 'w-64'} flex-shrink-0`} collapsible="icon">
      
    </Sidebar>;
}