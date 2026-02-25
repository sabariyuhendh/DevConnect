import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Heart, MessageCircle, UserPlus, Briefcase, Calendar, Share2, CheckCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

type NotificationType = 'like' | 'comment' | 'follow' | 'job' | 'event' | 'share' | 'mention';

interface Notification {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const NotificationDropdown = () => {
  const navigate = useNavigate();
  
  // Mock notifications - replace with actual API call
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'like',
      user: { name: 'Sarah Chen', username: 'sarahchen', avatar: '' },
      content: 'liked your post about React Server Components',
      timestamp: '2 min ago',
      read: false,
      link: '/post/123'
    },
    {
      id: '2',
      type: 'comment',
      user: { name: 'Alex Kumar', username: 'alexk', avatar: '' },
      content: 'commented on your post: "Great insights on TypeScript!"',
      timestamp: '15 min ago',
      read: false,
      link: '/post/124'
    },
    {
      id: '3',
      type: 'follow',
      user: { name: 'Maria Garcia', username: 'mariag', avatar: '' },
      content: 'started following you',
      timestamp: '1 hour ago',
      read: false,
      link: '/u/mariag'
    },
    {
      id: '4',
      type: 'job',
      user: { name: 'TechCorp', username: 'techcorp', avatar: '' },
      content: 'Your application for Senior Frontend Developer has been viewed',
      timestamp: '2 hours ago',
      read: true,
      link: '/jobs/456'
    },
    {
      id: '5',
      type: 'event',
      user: { name: 'DevMeetup', username: 'devmeetup', avatar: '' },
      content: 'Reminder: React Conference starts tomorrow at 9 AM',
      timestamp: '3 hours ago',
      read: true,
      link: '/events/789'
    },
    {
      id: '6',
      type: 'share',
      user: { name: 'John Doe', username: 'johnd', avatar: '' },
      content: 'shared your post about Next.js 14',
      timestamp: '5 hours ago',
      read: true,
      link: '/post/125'
    },
    {
      id: '7',
      type: 'mention',
      user: { name: 'Emma Wilson', username: 'emmaw', avatar: '' },
      content: 'mentioned you in a comment',
      timestamp: '1 day ago',
      read: true,
      link: '/post/126'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'like':
        return <Heart className={`${iconClass} text-red-500`} fill="currentColor" />;
      case 'comment':
        return <MessageCircle className={`${iconClass} text-blue-500`} />;
      case 'follow':
        return <UserPlus className={`${iconClass} text-green-500`} />;
      case 'job':
        return <Briefcase className={`${iconClass} text-purple-500`} />;
      case 'event':
        return <Calendar className={`${iconClass} text-orange-500`} />;
      case 'share':
        return <Share2 className={`${iconClass} text-cyan-500`} />;
      case 'mention':
        return <MessageCircle className={`${iconClass} text-pink-500`} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Navigate to link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-accent">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white rounded-full border-2 border-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-7 px-2"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground text-center">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground/70 text-center mt-1">
                We'll notify you when something happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-accent/50 ${
                    !notification.read ? 'bg-accent/30' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Avatar with icon overlay */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.user.avatar} />
                        <AvatarFallback className="text-xs font-semibold">
                          {getInitials(notification.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.user.name}</span>
                          {' '}
                          <span className="text-muted-foreground">{notification.content}</span>
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/notifications')}
            >
              View All Notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
