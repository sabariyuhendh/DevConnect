
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  Moon, 
  Sun, 
  Code2,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Briefcase,
  UserPlus,
  Calendar,
  Heart,
  MessageCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

interface Notification {
  id: string;
  message: string;
  type: 'post_comment' | 'new_message' | 'job_posted' | 'connection_request' | 'event_reminder' | 'post_like';
  timestamp: Date;
  read: boolean;
  actionPath: string;
}

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Sample notification data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'Sarah Chen commented on your post about React best practices',
      type: 'post_comment',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      read: false,
      actionPath: '/post/123'
    },
    {
      id: '2',
      message: 'You have a new message from Marcus Rodriguez',
      type: 'new_message',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      actionPath: '/messages'
    },
    {
      id: '3',
      message: 'New job posted: Senior React Developer at TechCorp',
      type: 'job_posted',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      read: false,
      actionPath: '/jobs'
    },
    {
      id: '4',
      message: 'Alex Johnson sent you a connection request',
      type: 'connection_request',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      actionPath: '/network'
    },
    {
      id: '5',
      message: 'Tech Conference 2024 starts in 2 days',
      type: 'event_reminder',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: true,
      actionPath: '/events'
    },
    {
      id: '6',
      message: 'Your post about TypeScript got 15 likes',
      type: 'post_like',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      actionPath: '/post/456'
    }
  ]);

  const navigation = [
    { name: 'Feed', href: '/feed' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Events', href: '/events' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Format relative timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Handle future timestamps (edge case)
    if (diffMs < 0) {
      return 'Just now';
    }
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Get icon for notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'post_comment':
        return <MessageCircle className="h-4 w-4" />;
      case 'new_message':
        return <MessageSquare className="h-4 w-4" />;
      case 'job_posted':
        return <Briefcase className="h-4 w-4" />;
      case 'connection_request':
        return <UserPlus className="h-4 w-4" />;
      case 'event_reminder':
        return <Calendar className="h-4 w-4" />;
      case 'post_like':
        return <Heart className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    // Navigate to action path
    navigate(notification.actionPath);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Code2 className="h-6 w-6 text-foreground" />
            <span className="text-lg font-semibold text-foreground">DevConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-all duration-300 hover:text-foreground ${
                  isActive(item.href) 
                    ? 'text-foreground drop-shadow-[0_0_8px_hsl(var(--primary))]' 
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search developers, posts, technologies..."
                className="professional-input pl-10 pr-4 h-10 bg-background border-border"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="relative h-9 w-9 p-0 hover:bg-accent"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-accent">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-foreground text-background rounded-full">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-popover border border-border">
                <div className="px-3 py-2 border-b border-border">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <div className="py-1">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 cursor-pointer hover:bg-accent transition-colors ${
                            !notification.read ? 'bg-muted/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex-shrink-0 ${
                              !notification.read ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${
                                !notification.read ? 'font-medium text-foreground' : 'text-muted-foreground'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/messages')}
              className="relative h-9 w-9 p-0 hover:bg-accent"
            >
              <MessageSquare className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-foreground text-background rounded-full">
                2
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-accent">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-semibold">
                    JD
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border border-border">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-accent">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-accent">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-accent">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-9 w-9 p-0"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'text-foreground bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="professional-input pl-10 pr-4 h-10 bg-background border-border"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
