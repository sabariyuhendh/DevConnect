import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Ban
} from 'lucide-react';

const Messages = () => {
  const { theme } = useTheme();
  const [selectedChat, setSelectedChat] = useState('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState<'profile' | 'groups' | 'explore'>('profile');
  const [activeTab, setActiveTab] = useState('chats');

  /**
   * Conversations data structure
   * 
   * Note: Communities can contain multiple groups within a single community.
   * This is a hierarchical structure where:
   * - Communities (>= 100 members) act as containers that can hold multiple groups
   * - Groups (< 100 members) are smaller chat groups
   * - Direct messages are one-on-one conversations
   */
  const conversations = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'SC',
      lastMessage: 'Thanks for the React tips! Really helpful 🚀',
      timestamp: '2 min ago',
      unread: 2,
      online: true,
      type: 'direct'
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
      members: 24,
      category: 'group' // Groups have < 100 members
    },
    {
      id: '3',
      name: 'Marcus Rodriguez',
      avatar: 'MR',
      lastMessage: 'Great article on microservices!',
      timestamp: '1 hour ago',
      unread: 0,
      online: false,
      type: 'direct'
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
      members: 156,
      category: 'community' // Communities have >= 100 members and can contain multiple groups
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
      content: 'That sounds awesome! TypeScript with React is such a great combo. Are you using any specific UI library?',
      timestamp: '10:36 AM',
      isOwn: true
    },
    {
      id: '5',
      sender: 'Sarah Chen',
      avatar: 'SC',
      content: 'I\'m using Tailwind CSS with Headless UI. The combination is really powerful for building accessible components.',
      timestamp: '10:38 AM',
      isOwn: false
    },
    {
      id: '6',
      sender: 'Sarah Chen',
      avatar: 'SC',
      content: 'Thanks for the React tips! Really helpful 🚀',
      timestamp: '10:40 AM',
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

  // Calculate group count
  const groupCount = conversations.filter(
    (c) => c.type === 'group' && (c.members || 0) < 100
  ).length;

  // Get sidebar title based on activeNav
  const getSidebarTitle = () => {
    if (activeNav === 'profile') return 'Messages';
    if (activeNav === 'groups') return `Groups (${groupCount})`;
    return 'Communities';
  };

  // Update selectedChat if current selection is not in filtered list
  useEffect(() => {
    const isSelectedInFiltered = searchFilteredConversations.some(c => c.id === selectedChat);
    if (!isSelectedInFiltered && searchFilteredConversations.length > 0) {
      setSelectedChat(searchFilteredConversations[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNav, searchQuery]);

  // Ensure selected conversation is valid, fallback to first filtered conversation if not
  const selectedConversation = conversations.find(c => c.id === selectedChat) || 
    (searchFilteredConversations.length > 0 ? searchFilteredConversations[0] : null);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      className="flex-1 min-h-screen py-4 md:py-8"
      style={{
        backgroundColor: theme === 'dark' ? '#000000' : '#ffffff'
      }}
    >
      {/* Main Container with rounded corners */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-2xl bg-card border border-border">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-80 flex flex-col border-r border-border bg-card">
            {/* Top Navigation Icons */}
            <div className="flex items-center justify-center gap-4 p-4 border-b border-border">
              <Button
                variant={activeNav === 'profile' ? 'default' : 'ghost'}
                size="icon"
                className={`h-10 w-10 rounded-full ${
                  activeNav === 'profile' ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setActiveNav('profile')}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant={activeNav === 'groups' ? 'default' : 'ghost'}
                size="icon"
                className={`h-10 w-10 rounded-full ${
                  activeNav === 'groups' ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setActiveNav('groups')}
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button
                variant={activeNav === 'explore' ? 'default' : 'ghost'}
                size="icon"
                className={`h-10 w-10 rounded-full ${
                  activeNav === 'explore' ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setActiveNav('explore')}
              >
                <Globe className="h-5 w-5" />
              </Button>
            </div>

            {/* Sidebar Title */}
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-lg font-semibold">{getSidebarTitle()}</h2>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-lg"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {searchFilteredConversations.length > 0 ? (
                <div className="space-y-0">
                  {searchFilteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedChat(conversation.id)}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedChat === conversation.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {conversation.avatar}
                          </div>
                          {conversation.online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {conversation.name}
                              {conversation.type === 'group' && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({conversation.members})
                                </span>
                              )}
                            </h4>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {conversation.timestamp}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate flex-1">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unread > 0 && (
                              <Badge className="h-5 min-w-5 flex items-center justify-center px-1.5 text-xs ml-2 bg-primary text-primary-foreground">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-muted-foreground">
                    {searchQuery.trim() ? (
                      <>
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No conversations found</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                      </>
                    ) : activeNav === 'profile' ? (
                      <>
                        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No direct messages</p>
                        <p className="text-xs mt-1">Start a conversation to see messages here</p>
                      </>
                    ) : activeNav === 'groups' ? (
                      <>
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No groups found</p>
                        <p className="text-xs mt-1">Join or create a group to see it here</p>
                      </>
                    ) : (
                      <>
                        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No communities yet</p>
                        <p className="text-xs mt-1">Explore and join communities to see them here</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Navigation Bar with Tabs */}
            <div className="border-b border-border bg-card">
              <div className="flex items-center justify-between px-6 py-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-transparent">
                    <TabsTrigger value="chats" className="data-[state=active]:bg-muted">
                      Chats
                    </TabsTrigger>
                    <TabsTrigger value="calls" className="data-[state=active]:bg-muted">
                      Calls
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-muted">
                      Notifications
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {/* 
                  IMPORTANT: Settings Menu Dynamically Changes Based on Conversation Type
                  
                  The settings menu behavior is context-dependent:
                  
                  1. Direct Messages (Person/Individual conversations):
                     - Settings MUST show ONLY: Block, Report (in red text)
                     - No other options should appear
                     - Settings menu dynamically changes to show only these two options
                  
                  2. Groups (smaller group chats < 100 members):
                     - Settings shows: Exit group, Group info, Search, Clear chat, Report (in red)
                     - All group-related options are available
                  
                  3. Communities (large communities >= 100 members):
                     - Settings button MUST NOT appear at all
                     - Settings menu is completely hidden for communities
                     - Communities have no settings menu
                     - The Settings button is conditionally hidden when viewing communities
                */}
                <div className="flex items-center gap-2">
                  {selectedConversation && (
                    selectedConversation.type === 'direct' || 
                    (selectedConversation.type === 'group' && (selectedConversation.members || 0) < 100)
                  ) ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {selectedConversation?.type === 'direct' ? (
                          // Direct message settings: Block and Report only
                          <>
                            <DropdownMenuItem onClick={() => console.log('Block')}>
                              <Ban className="mr-2 h-4 w-4" />
                              Block
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => console.log('Report')}
                              className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950"
                            >
                              <Flag className="mr-2 h-4 w-4" />
                              Report
                            </DropdownMenuItem>
                          </>
                        ) : (
                          // Group settings: All options
                          <>
                            <DropdownMenuItem onClick={() => console.log('Exit group')}>
                              <LogOut className="mr-2 h-4 w-4" />
                              Exit group
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Group info')}>
                              <Info className="mr-2 h-4 w-4" />
                              Group info
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Search')}>
                              <Search className="mr-2 h-4 w-4" />
                              Search
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Clear chat')}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Clear chat
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => console.log('Report')}
                              className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950"
                            >
                              <Flag className="mr-2 h-4 w-4" />
                              Report
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </div>
            </div>

            <Tabs value={activeTab} className="flex-1 flex flex-col">
              <TabsContent value="chats" className="flex-1 flex flex-col m-0">
                {/* Chat Header */}
                {selectedConversation && (
                  <div className="border-b border-border bg-card px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {selectedConversation.avatar}
                          </div>
                          {selectedConversation.online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">{selectedConversation.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedConversation.type === 'group' 
                              ? `${selectedConversation.members} members`
                              : selectedConversation.online 
                                ? 'Online' 
                                : 'Offline'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start gap-2 max-w-[70%] ${message.isOwn ? 'flex-row-reverse' : ''}`}>
                          {!message.isOwn && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {message.avatar}
                            </div>
                          )}
                          
                          <div className={`rounded-2xl px-4 py-2.5 ${
                            message.isOwn 
                              ? 'bg-primary text-primary-foreground rounded-br-sm' 
                              : 'bg-card border border-border rounded-bl-sm'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
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

                {/* Message Input */}
                <div className="border-t border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Plus className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type message here..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-20 rounded-full"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Smile className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSendMessage} 
                      size="icon"
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calls" className="flex-1 flex items-center justify-center m-0">
                <div className="text-center text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Calls will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="flex-1 flex items-center justify-center m-0">
                <div className="text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Notifications will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
