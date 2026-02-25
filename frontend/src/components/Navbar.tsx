
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationDropdown from '@/components/NotificationDropdown';
import { 
  Search, 
  MessageSquare, 
  Moon, 
  Sun, 
  Code2,
  Settings,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  // Get user initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.username) {
      return user.username;
    }
    return 'User';
  };

  const navigation = [
    { name: 'Feed', href: '/feed' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Events', href: '/events' },
  ];

  const isActive = (path: string) => location.pathname === path;

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

            {user && isAuthenticated ? (
              <>
                <NotificationDropdown />

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/messages')}
                      className="relative h-9 w-9 p-0 hover:bg-accent"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground rounded-full shadow-lg animate-pulse">
                        2
                      </Badge>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-0" align="end">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Unread Messages</h3>
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          2 new
                        </Badge>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-2 space-y-2">
                        {/* Sample unread messages preview */}
                        <div className="p-3 rounded-lg cursor-pointer hover:bg-muted border border-primary/30 bg-card ring-1 ring-primary/20 transition-all">
                          <div className="flex items-start gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-semibold">
                                SC
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg">
                                <span className="text-[10px] font-bold text-primary-foreground">2</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm">Sarah Chen</h4>
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                </div>
                                <span className="text-xs text-muted-foreground">2 min ago</span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                Thanks for the React tips! Really helpful 🚀
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg cursor-pointer hover:bg-muted border border-primary/30 bg-card ring-1 ring-primary/20 transition-all">
                          <div className="flex items-start gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-semibold">
                                FD
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg">
                                <span className="text-[10px] font-bold text-primary-foreground">5</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm">Frontend Developers</h4>
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                </div>
                                <span className="text-xs text-muted-foreground">15 min ago</span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                Alex: Anyone tried the new React 18 features?
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/messages')}
                      >
                        View All Messages
                      </Button>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-accent">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user?.profilePicture} alt={getUserDisplayName()} />
                        <AvatarFallback className="text-xs font-semibold">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover border border-border">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {getUserDisplayName()}
                    </div>
                    <div className="px-2 pb-2 text-xs text-muted-foreground">
                      @{user?.username}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      if (user?.username) {
                        navigate(`/u/${user.username}`);
                      } else {
                        navigate('/profile');
                      }
                    }} className="hover:bg-accent">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-accent">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-accent text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="h-9 px-4"
                >
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="h-9 px-4"
                >
                  Sign Up
                </Button>
              </>
            )}
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
