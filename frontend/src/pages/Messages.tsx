import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Plus,
  Smile,
  Paperclip,
  Image,
  Mic,
  User,
  Users,
  Globe,
  Settings,
  Bell,
  LogOut,
  Trash2,
  Flag,
  Ban,
  Code,
  FileCode,
  Link2,
  Calendar,
  Clock,
  Zap,
  GitBranch,
  Terminal,
  FileText,
  Video as VideoIcon,
  File,
  X,
  Briefcase,
  MapPin,
  DollarSign,
  Building,
  CheckCircle2,
  Circle,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Messages = () => {
  const { theme } = useTheme();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState<'profile' | 'groups' | 'explore'>('profile');
  const [showNotifications, setShowNotifications] = useState(true); // Show notifications first
  const [notificationTab, setNotificationTab] = useState<'messages' | 'jobs' | 'events'>('messages');
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px (w-80)
  
  // Track seen notifications
  const [seenNotifications, setSeenNotifications] = useState<Set<string>>(new Set());

  // Job Notifications
  const jobNotifications = [
    {
      id: 'j1',
      type: 'job_match',
      title: 'Senior Frontend Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      match: 95,
      timestamp: '5 min ago',
      unread: !seenNotifications.has('j1'),
      logo: 'TC'
    },
    {
      id: 'j2',
      type: 'application_update',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      status: 'under_review',
      timestamp: '1 hour ago',
      unread: !seenNotifications.has('j2'),
      logo: 'SX'
    },
    {
      id: 'j3',
      type: 'job_match',
      title: 'DevOps Engineer',
      company: 'CloudTech Solutions',
      location: 'Remote',
      salary: '$70/hour',
      match: 88,
      timestamp: '3 hours ago',
      unread: !seenNotifications.has('j3'),
      logo: 'CS'
    },
    {
      id: 'j4',
      type: 'application_update',
      title: 'Mobile App Developer',
      company: 'InnovateMobile',
      status: 'interview_scheduled',
      timestamp: '1 day ago',
      unread: !seenNotifications.has('j4'),
      logo: 'IM'
    }
  ];

  // Event Notifications
  const eventNotifications = [
    {
      id: 'e1',
      type: 'event_reminder',
      title: 'React Conf 2024',
      date: 'Tomorrow, 10:00 AM',
      location: 'San Francisco',
      timestamp: '30 min ago',
      unread: !seenNotifications.has('e1'),
      icon: 'RC'
    },
    {
      id: 'e2',
      type: 'event_invite',
      title: 'TypeScript Meetup',
      date: 'Dec 15, 6:00 PM',
      location: 'Online',
      timestamp: '2 hours ago',
      unread: !seenNotifications.has('e2'),
      icon: 'TS'
    },
    {
      id: 'e3',
      type: 'event_reminder',
      title: 'Node.js Workshop',
      date: 'Dec 20, 2:00 PM',
      location: 'New York',
      timestamp: '5 hours ago',
      unread: !seenNotifications.has('e3'),
      icon: 'NJ'
    },
    {
      id: 'e4',
      type: 'event_update',
      title: 'DevOps Conference',
      date: 'Dec 25, 9:00 AM',
      changes: 'Venue updated',
      timestamp: '1 day ago',
      unread: !seenNotifications.has('e4'),
      icon: 'DC'
    }
  ];

  // Message Notifications (for chat activity)
  const messageNotifications = [
    {
      id: 'm1',
      type: 'message',
      from: 'Sarah Chen',
      avatar: 'SC',
      message: 'Thanks for the React tips! Really helpful 🚀',
      timestamp: '2 min ago',
      unread: !seenNotifications.has('m1'),
      unreadCount: 2,
      online: true
    },
    {
      id: 'm2',
      type: 'group',
      from: 'Frontend Developers',
      avatar: 'FD',
      message: 'Alex: Anyone tried the new React 18 features?',
      timestamp: '15 min ago',
      unread: !seenNotifications.has('m2'),
      unreadCount: 5,
      members: 24
    },
    {
      id: 'm3',
      type: 'mention',
      from: 'Marcus Rodriguez',
      avatar: 'MR',
      message: 'Mentioned you in a discussion about microservices',
      timestamp: '1 hour ago',
      unread: !seenNotifications.has('m3'),
      unreadCount: 1,
      online: false
    },
    {
      id: 'm4',
      type: 'code_review',
      from: 'Node.js Enthusiasts',
      avatar: 'NE',
      message: 'Lisa: Check out this performance optimization trick',
      timestamp: '2 hours ago',
      unread: !seenNotifications.has('m4'),
      unreadCount: 3,
      members: 156
    },
    {
      id: 'm5',
      type: 'message',
      from: 'David Miller',
      avatar: 'DM',
      message: 'Can you review my PR?',
      timestamp: '3 hours ago',
      unread: !seenNotifications.has('m5'),
      unreadCount: 0,
      online: true
    }
  ];

  const conversations = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'SC',
      lastMessage: 'Thanks for the React tips! Really helpful 🚀',
      timestamp: '2 min ago',
      unread: 2,
      online: true,
      type: 'direct',
      members: undefined
    },
    {
      id: '2',
      name: 'Frontend Developers',
      avatar: 'FD',
      lastMessage: 'Alex: Anyone tried the new React 18 features?',
      timestamp: '15 min ago',
      unread: 5,
      online: false,
      type: 'group',
      members: 24
    },
    {
      id: '3',
      name: 'Marcus Rodriguez',
      avatar: 'MR',
      lastMessage: 'Great article on microservices!',
      timestamp: '1 hour ago',
      unread: 0,
      online: false,
      type: 'direct',
      members: undefined
    },
    {
      id: '4',
      name: 'Node.js Enthusiasts',
      avatar: 'NE',
      lastMessage: 'Lisa: Check out this performance optimization trick',
      timestamp: '2 hours ago',
      unread: 12,
      online: false,
      type: 'group',
      members: 156
    },
    {
      id: '5',
      name: 'David Miller',
      avatar: 'DM',
      lastMessage: 'Can you review my PR?',
      timestamp: '3 hours ago',
      unread: 0,
      online: true,
      type: 'direct',
      members: undefined
    },
    {
      id: '6',
      name: 'React Developers',
      avatar: 'RD',
      lastMessage: 'New hooks discussion starting now!',
      timestamp: '5 hours ago',
      unread: 3,
      online: false,
      type: 'group',
      members: 45
    }
  ];

  const messages = [
    {
      id: '1',
      sender: 'Sarah Chen',
      avatar: 'SC',
      content: 'Hey! I saw your post about React best practices. Really insightful!',
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: '2',
      sender: 'You',
      avatar: 'JD',
      content: 'Thanks! I\'m glad you found it helpful. Are you working on any React projects right now?',
      timestamp: '10:32 AM',
      isOwn: true
    },
    {
      id: '3',
      sender: 'Sarah Chen',
      avatar: 'SC',
      content: 'Yes! I\'m building a dashboard with React and TypeScript. Your tips on component composition came at the perfect time.',
      timestamp: '10:35 AM',
      isOwn: false
    },
    {
      id: '4',
      sender: 'You',
      avatar: 'JD',
      content: '```typescript\nconst Component = () => {\n  return <div>Hello</div>;\n};\n```',
      timestamp: '10:36 AM',
      isOwn: true,
      isCode: true
    },
    {
      id: '5',
      sender: 'Sarah Chen',
      avatar: 'SC',
      content: 'I\'m using Tailwind CSS with Headless UI. The combination is really powerful for building accessible components.',
      timestamp: '10:38 AM',
      isOwn: false
    }
  ];

  // Filter conversations based on activeNav
  const filteredConversations = conversations.filter((conversation) => {
    if (activeNav === 'profile') {
      return conversation.type === 'direct';
    } else if (activeNav === 'groups') {
      return conversation.type === 'group' && (conversation.members || 0) < 100;
    } else if (activeNav === 'explore') {
      return conversation.type === 'group' && (conversation.members || 0) >= 100;
    }
    return true;
  });

  // Filter by search query
  const searchFilteredConversations = searchQuery.trim()
    ? filteredConversations.filter((conversation) =>
        conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredConversations;

  // Get current notifications based on tab
  const getCurrentNotifications = () => {
    switch (notificationTab) {
      case 'jobs':
        return jobNotifications;
      case 'events':
        return eventNotifications;
      default:
        return messageNotifications;
    }
  };

  // Filter notifications by search
  const currentNotifications = getCurrentNotifications();
  const filteredNotifications = searchQuery.trim()
    ? currentNotifications.filter((notif) => {
        if (notificationTab === 'jobs') {
          return (notif as any).title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 (notif as any).company?.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (notificationTab === 'events') {
          return (notif as any).title?.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
          return (notif as any).from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 (notif as any).message?.toLowerCase().includes(searchQuery.toLowerCase());
        }
      })
    : currentNotifications;

  // Calculate counts for navigation buttons
  const directCount = conversations.filter(c => c.type === 'direct').reduce((sum, c) => sum + c.unread, 0);
  const groupCount = conversations.filter(c => c.type === 'group' && (c.members || 0) < 100).reduce((sum, c) => sum + c.unread, 0);
  const exploreCount = conversations.filter(c => c.type === 'group' && (c.members || 0) >= 100).reduce((sum, c) => sum + c.unread, 0);

  const getSidebarTitle = () => {
    if (activeNav === 'profile') return 'Direct Messages';
    if (activeNav === 'groups') return 'Groups';
    return 'Communities';
  };

  // Handle notification click - navigate to chat or relevant page and mark as seen
  const handleNotificationClick = (notificationId: string) => {
    // Mark notification as seen
    setSeenNotifications(prev => new Set(prev).add(notificationId));
    
    if (notificationTab === 'messages') {
      // Find corresponding conversation
      const notif = messageNotifications.find(n => n.id === notificationId);
      if (notif) {
        const conv = conversations.find(c => c.name === notif.from);
        if (conv) {
          setSelectedChat(conv.id);
          setShowNotifications(false);
        }
      }
    } else if (notificationTab === 'jobs') {
      // Navigate to jobs page (you can implement navigation here)
      console.log('Navigate to job:', notificationId);
    } else if (notificationTab === 'events') {
      // Navigate to events page
      console.log('Navigate to event:', notificationId);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    const currentNotifications = getCurrentNotifications();
    const allIds = currentNotifications.map(n => n.id);
    setSeenNotifications(prev => {
      const newSet = new Set(prev);
      allIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  // Handle conversation click
  const handleConversationClick = (conversationId: string) => {
    setSelectedChat(conversationId);
    setShowNotifications(false);
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedChat(null);
    setShowNotifications(true);
  };

  const selectedConversation = selectedChat 
    ? conversations.find(c => c.id === selectedChat) 
    : null;

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Keyboard navigation (Escape to go back)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedChat) {
        setSelectedChat(null);
        setShowNotifications(true);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedChat]);

  return (
    <div className="h-full w-full flex bg-background overflow-hidden">
      {/* Mobile Sidebar - Shows when no chat selected */}
      {!selectedChat && (
        <div className="flex flex-col border-r border-border bg-card h-full w-full md:hidden">
        {/* Top Navigation Icons */}
        <div className="flex items-center justify-center gap-2 p-3 border-b border-border">
          <Button
            variant={activeNav === 'profile' ? 'default' : 'ghost'}
            size="sm"
            className={`h-9 flex-1 ${activeNav === 'profile' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => {
              setActiveNav('profile');
              setShowNotifications(false);
            }}
          >
            <User className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">DMs</span>
            {directCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                {directCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeNav === 'groups' ? 'default' : 'ghost'}
            size="sm"
            className={`h-9 flex-1 ${activeNav === 'groups' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => {
              setActiveNav('groups');
              setShowNotifications(false);
            }}
          >
            <Users className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Groups</span>
            {groupCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                {groupCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeNav === 'explore' ? 'default' : 'ghost'}
            size="sm"
            className={`h-9 flex-1 ${activeNav === 'explore' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => {
              setActiveNav('explore');
              setShowNotifications(false);
            }}
          >
            <Globe className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Explore</span>
            {exploreCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                {exploreCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Sidebar Title */}
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">{getSidebarTitle()}</h2>
          <div className="flex items-center gap-2">
            {!showNotifications && !selectedChat && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowNotifications(true)}
                title="View notifications"
              >
                <Bell className="h-3 w-3 mr-1" />
                Notifications
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Conversations/Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {showNotifications ? (
            // Notifications View (shown first)
            <div className="h-full flex flex-col">
              {/* Notification Tabs */}
              <div className="border-b border-border p-2">
                <div className="flex gap-1">
                  <Button
                    variant={notificationTab === 'messages' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-7 text-xs flex-1 ${notificationTab === 'messages' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setNotificationTab('messages')}
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    Messages
                    {messageNotifications.filter(n => n.unread).length > 0 && (
                      <Badge className="ml-1 bg-primary text-primary-foreground rounded-full text-[10px] px-1.5 py-0.5">
                        {messageNotifications.filter(n => n.unread).length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={notificationTab === 'jobs' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-7 text-xs flex-1 ${notificationTab === 'jobs' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setNotificationTab('jobs')}
                  >
                    <Briefcase className="h-3 w-3 mr-1" />
                    Jobs
                    {jobNotifications.filter(n => n.unread).length > 0 && (
                      <Badge className="ml-1 bg-primary text-primary-foreground rounded-full text-[10px] px-1.5 py-0.5">
                        {jobNotifications.filter(n => n.unread).length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={notificationTab === 'events' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-7 text-xs flex-1 ${notificationTab === 'events' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setNotificationTab('events')}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Events
                    {eventNotifications.filter(n => n.unread).length > 0 && (
                      <Badge className="ml-1 bg-primary text-primary-foreground rounded-full text-[10px] px-1.5 py-0.5">
                        {eventNotifications.filter(n => n.unread).length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-2">
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {notificationTab === 'jobs' ? 'Job Updates' : notificationTab === 'events' ? 'Event Updates' : 'Recent Activity'}
                  </h3>
                  {filteredNotifications.filter(n => n.unread).length > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
                      {filteredNotifications.filter(n => n.unread).length} new
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        notification.unread 
                          ? 'bg-card border-primary hover:bg-muted shadow-md ring-2 ring-primary' 
                          : 'border-border hover:bg-muted hover:border-border'
                      }`}
                    >
                      {notificationTab === 'messages' && (
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                              {(notification as any).avatar}
                            </div>
                            {(notification as any).online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                            {notification.unread && (notification as any).unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg animate-pulse">
                                <span className="text-[10px] font-bold text-primary-foreground">
                                  {(notification as any).unreadCount > 9 ? '9+' : (notification as any).unreadCount}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm truncate">{(notification as any).from}</h4>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {(notification as any).timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {(notification as any).message}
                            </p>
                            {(notification as any).type !== 'message' && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {(notification as any).type === 'mention' && '@Mention'}
                                {(notification as any).type === 'code_review' && 'Code Review'}
                                {(notification as any).type === 'group' && 'Group'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {notificationTab === 'jobs' && (
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                              {(notification as any).logo}
                            </div>
                            {notification.unread && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg animate-pulse">
                                <AlertCircle className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm truncate">{(notification as any).title}</h4>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {(notification as any).timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {(notification as any).company}
                              {(notification as any).location && ` • ${(notification as any).location}`}
                            </p>
                            {(notification as any).match && (
                              <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-xs mt-1">
                                {(notification as any).match}% match
                              </Badge>
                            )}
                            {(notification as any).status === 'under_review' && (
                              <Badge variant="outline" className="text-xs mt-1 border-primary">
                                <Clock className="w-3 h-3 mr-1" />
                                Under Review
                              </Badge>
                            )}
                            {(notification as any).status === 'interview_scheduled' && (
                              <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-xs mt-1">
                                <Calendar className="w-3 h-3 mr-1" />
                                Interview Scheduled
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {notificationTab === 'events' && (
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-semibold">
                              {(notification as any).icon}
                            </div>
                            {notification.unread && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg animate-pulse">
                                <Bell className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm truncate">{(notification as any).title}</h4>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {(notification as any).timestamp}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Calendar className="w-3 w-3" />
                              <span>{(notification as any).date}</span>
                            </div>
                            {(notification as any).location && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <MapPin className="w-3 h-3" />
                                <span>{(notification as any).location}</span>
                              </div>
                            )}
                            {(notification as any).type === 'event_reminder' && (
                              <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 text-xs mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                Reminder
                              </Badge>
                            )}
                            {(notification as any).type === 'event_invite' && (
                              <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-xs mt-1">
                                <Plus className="w-3 h-3 mr-1" />
                                Invite
                              </Badge>
                            )}
                            {(notification as any).changes && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {(notification as any).changes}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Conversations List
            searchFilteredConversations.length > 0 ? (
              <div className="space-y-0">
                {searchFilteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedChat === conversation.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                          {conversation.avatar}
                        </div>
                        {conversation.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                        {conversation.unread > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg animate-pulse">
                            <span className="text-[10px] font-bold text-primary-foreground">
                              {conversation.unread > 9 ? '9+' : conversation.unread}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm truncate">
                              {conversation.name}
                              {conversation.type === 'group' && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({conversation.members})
                                </span>
                              )}
                            </h4>
                            {conversation.unread > 0 && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {conversation.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate flex-1 ${
                            conversation.unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                          }`}>
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                </div>
              </div>
            )
          )}
        </div>
        </div>
      )}

      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Sidebar - Desktop Only */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={60} className="hidden md:block">
          <div className="flex flex-col border-r border-border bg-card h-full w-full">
        {/* Top Navigation Icons */}
        <div className="flex items-center justify-center gap-2 p-3 border-b border-border">
          <Button
            variant={activeNav === 'profile' ? 'default' : 'ghost'}
            size="sm"
            className={`h-9 flex-1 ${activeNav === 'profile' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => {
              setActiveNav('profile');
              setShowNotifications(false);
            }}
          >
            <User className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">DMs</span>
            {directCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                {directCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeNav === 'groups' ? 'default' : 'ghost'}
            size="sm"
            className={`h-9 flex-1 ${activeNav === 'groups' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => {
              setActiveNav('groups');
              setShowNotifications(false);
            }}
          >
            <Users className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Groups</span>
            {groupCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                {groupCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeNav === 'explore' ? 'default' : 'ghost'}
            size="sm"
            className={`h-9 flex-1 ${activeNav === 'explore' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => {
              setActiveNav('explore');
              setShowNotifications(false);
            }}
          >
            <Globe className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Explore</span>
            {exploreCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                {exploreCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Sidebar Title */}
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">{getSidebarTitle()}</h2>
          <div className="flex items-center gap-2">
            {!showNotifications && !selectedChat && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowNotifications(true)}
                title="View notifications"
              >
                <Bell className="h-3 w-3 mr-1" />
                Notifications
              </Button>
            )}
            {selectedChat && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleBack}
                title="Back to list"
              >
                <X className="h-3 w-3 mr-1" />
                Back
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Conversations/Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {showNotifications && !selectedChat ? (
            // Notifications View (shown first)
            <div className="h-full flex flex-col">
              {/* Notification Tabs */}
              <div className="border-b border-border p-2">
                <div className="flex gap-1">
                  <Button
                    variant={notificationTab === 'messages' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-7 text-xs flex-1 ${notificationTab === 'messages' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setNotificationTab('messages')}
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    Messages
                    {messageNotifications.filter(n => n.unread).length > 0 && (
                      <Badge className="ml-1 bg-primary text-primary-foreground rounded-full text-[10px] px-1.5 py-0.5">
                        {messageNotifications.filter(n => n.unread).length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={notificationTab === 'jobs' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-7 text-xs flex-1 ${notificationTab === 'jobs' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setNotificationTab('jobs')}
                  >
                    <Briefcase className="h-3 w-3 mr-1" />
                    Jobs
                    {jobNotifications.filter(n => n.unread).length > 0 && (
                      <Badge className="ml-1 bg-primary text-primary-foreground rounded-full text-[10px] px-1.5 py-0.5">
                        {jobNotifications.filter(n => n.unread).length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={notificationTab === 'events' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-7 text-xs flex-1 ${notificationTab === 'events' ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setNotificationTab('events')}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Events
                    {eventNotifications.filter(n => n.unread).length > 0 && (
                      <Badge className="ml-1 bg-primary text-primary-foreground rounded-full text-[10px] px-1.5 py-0.5">
                        {eventNotifications.filter(n => n.unread).length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-2">
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {notificationTab === 'jobs' ? 'Job Updates' : notificationTab === 'events' ? 'Event Updates' : 'Recent Activity'}
                  </h3>
                  {filteredNotifications.filter(n => n.unread).length > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
                      {filteredNotifications.filter(n => n.unread).length} new
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        notification.unread 
                          ? 'bg-card border-primary hover:bg-muted shadow-md ring-2 ring-primary' 
                          : 'border-border hover:bg-muted hover:border-border'
                      }`}
                    >
                      {notificationTab === 'messages' && (
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                              {(notification as any).avatar}
                            </div>
                            {(notification as any).online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                            {/* Developer-oriented unread bubble */}
                            {notification.unread && (notification as any).unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg animate-pulse">
                                <span className="text-[10px] font-bold text-primary-foreground">
                                  {(notification as any).unreadCount > 9 ? '9+' : (notification as any).unreadCount}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm truncate">{(notification as any).from}</h4>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {(notification as any).timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {(notification as any).message}
                            </p>
                            {(notification as any).type !== 'message' && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {(notification as any).type === 'mention' && '@Mention'}
                                {(notification as any).type === 'code_review' && 'Code Review'}
                                {(notification as any).type === 'group' && 'Group'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {notificationTab === 'jobs' && (
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                              {(notification as any).logo}
                            </div>
                            {notification.unread && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg animate-pulse">
                                <AlertCircle className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm truncate">{(notification as any).title}</h4>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {(notification as any).timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {(notification as any).company}
                              {(notification as any).location && ` • ${(notification as any).location}`}
                            </p>
                            {(notification as any).match && (
                              <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-xs mt-1">
                                {(notification as any).match}% match
                              </Badge>
                            )}
                            {(notification as any).status === 'under_review' && (
                              <Badge variant="outline" className="text-xs mt-1 border-primary">
                                <Clock className="w-3 h-3 mr-1" />
                                Under Review
                              </Badge>
                            )}
                            {(notification as any).status === 'interview_scheduled' && (
                              <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-xs mt-1">
                                <Calendar className="w-3 h-3 mr-1" />
                                Interview Scheduled
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {notificationTab === 'events' && (
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-semibold">
                              {(notification as any).icon}
                            </div>
                            {notification.unread && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg animate-pulse">
                                <Bell className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm truncate">{(notification as any).title}</h4>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {(notification as any).timestamp}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Calendar className="w-3 h-3" />
                              <span>{(notification as any).date}</span>
                            </div>
                            {(notification as any).location && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <MapPin className="w-3 h-3" />
                                <span>{(notification as any).location}</span>
                              </div>
                            )}
                            {(notification as any).type === 'event_reminder' && (
                              <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 text-xs mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                Reminder
                              </Badge>
                            )}
                            {(notification as any).type === 'event_invite' && (
                              <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-xs mt-1">
                                <Plus className="w-3 h-3 mr-1" />
                                Invite
                              </Badge>
                            )}
                            {(notification as any).changes && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {(notification as any).changes}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Conversations List
            searchFilteredConversations.length > 0 ? (
              <div className="space-y-0">
                {searchFilteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedChat === conversation.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                          {conversation.avatar}
                        </div>
                        {conversation.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                        {/* Developer-oriented unread bubble badge */}
                        {conversation.unread > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg animate-pulse">
                            <span className="text-[10px] font-bold text-primary-foreground">
                              {conversation.unread > 9 ? '9+' : conversation.unread}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm truncate">
                              {conversation.name}
                              {conversation.type === 'group' && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({conversation.members})
                                </span>
                              )}
                            </h4>
                            {conversation.unread > 0 && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {conversation.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate flex-1 ${
                            conversation.unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                          }`}>
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                </div>
              </div>
            )
          )}
        </div>
          </div>
        </ResizablePanel>

        {/* Resize Handle - Desktop Only */}
        <ResizableHandle withHandle className="w-1 bg-border hover:bg-primary transition-colors hidden md:flex">
          <div className="flex h-full items-center justify-center">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </ResizableHandle>

        {/* Main Chat Area */}
        <ResizablePanel defaultSize={75} minSize={40} className={selectedChat ? "block" : "hidden md:block"}>
          <div className="flex-1 flex flex-col min-w-0 h-full">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-border bg-card px-4 py-3 flex-shrink-0 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={handleBack}
                    title="Back to notifications"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                      {selectedConversation.avatar}
                    </div>
                    {selectedConversation.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{selectedConversation.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.type === 'group' 
                        ? `${selectedConversation.members} members`
                        : selectedConversation.online 
                          ? 'Online' 
                          : 'Offline'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Video className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {selectedConversation?.type === 'direct' ? (
                        <>
                          <DropdownMenuItem>
                            <Ban className="mr-2 h-4 w-4" />
                            Block
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem>
                            <LogOut className="mr-2 h-4 w-4" />
                            Exit group
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Info className="mr-2 h-4 w-4" />
                            Group info
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-muted/10 min-h-0">
              <div className="space-y-3 w-full max-w-full">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[75%] ${message.isOwn ? 'flex-row-reverse' : ''}`}>
                      {!message.isOwn && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {message.avatar}
                        </div>
                      )}
                      
                      <div className={`rounded-lg px-3 py-2 ${
                        message.isOwn 
                          ? 'bg-primary text-primary-foreground rounded-br-sm' 
                          : 'bg-card border border-border rounded-bl-sm'
                      }`}>
                        {message.isCode ? (
                          <div className="bg-background/50 rounded p-2 font-mono text-xs">
                            <pre className="whitespace-pre-wrap">{message.content.replace(/```typescript\n|\n```/g, '')}</pre>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                        <p className={`text-xs mt-1 ${
                          message.isOwn 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Message Input Area */}
            <div className="border-t border-border bg-card p-3 flex-shrink-0 w-full overflow-visible">
              {/* Quick Actions Bar */}
              <div className="flex items-center gap-1 mb-2 pb-2 border-b border-border/50 w-full overflow-x-auto">
                <Button variant="ghost" size="sm" className="h-7 text-xs flex-shrink-0">
                  <Code className="h-3 w-3 mr-1" />
                  Code
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs flex-shrink-0">
                  <FileCode className="h-3 w-3 mr-1" />
                  Snippet
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs flex-shrink-0">
                  <Link2 className="h-3 w-3 mr-1" />
                  Link
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs flex-shrink-0">
                  <GitBranch className="h-3 w-3 mr-1" />
                  PR
                </Button>
                <div className="flex-1 min-w-0" />
                <Button variant="ghost" size="sm" className="h-7 text-xs flex-shrink-0">
                  <Calendar className="h-3 w-3 mr-1" />
                  Schedule
                </Button>
              </div>

              {/* Input Row */}
              <div className="flex items-end gap-2 w-full">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 relative min-w-0">
                  <Textarea
                    placeholder="Type a message... (Shift+Enter for new line)"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="pr-20 min-h-[40px] max-h-32 resize-none w-full"
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Terminal className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    size="icon"
                    className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  <span>Press / for commands</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Last seen 2 min ago</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Empty State - Show when no chat selected
          <div className="flex-1 flex items-center justify-center bg-muted/5 w-full h-full">
            <div className="text-center max-w-md px-4 w-full">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-4">
                <Bell className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {showNotifications ? 'Recent Activity' : 'Select a conversation'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {showNotifications 
                  ? 'Click on any notification to open the conversation'
                  : 'Choose a conversation from the sidebar or click on a notification to start chatting'
                }
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Code className="h-4 w-4" />
                <span>Developer-focused messaging</span>
              </div>
            </div>
          </div>
        )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Messages;
