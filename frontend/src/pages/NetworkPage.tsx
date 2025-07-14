
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Users, MessageCircle } from 'lucide-react';
import SuggestedConnections from '@/components/SuggestedConnections';

const NetworkPage = () => {
  const recentChats = [
    {
      id: 1,
      name: 'Sarah Chen',
      avatar: 'SC',
      lastMessage: 'Thanks for the React tips!',
      timestamp: '2m ago',
      unread: true
    },
    {
      id: 2,
      name: 'Mike Johnson',
      avatar: 'MJ',
      lastMessage: 'Are you available for a quick call?',
      timestamp: '1h ago',
      unread: false
    },
    {
      id: 3,
      name: 'Alex Thompson',
      avatar: 'AT',
      lastMessage: 'Great article on TypeScript!',
      timestamp: '3h ago',
      unread: false
    }
  ];

  const selectedChat = recentChats[0];

  const messages = [
    {
      id: 1,
      sender: 'Sarah Chen',
      content: 'Hi! I saw your recent post about React hooks. Really insightful!',
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      content: 'Thank you! I\'m glad you found it helpful. Are you working with hooks in your current project?',
      timestamp: '10:35 AM',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Sarah Chen',
      content: 'Yes, we\'re migrating our class components to hooks. Your examples really helped clarify some concepts.',
      timestamp: '10:40 AM',
      isOwn: false
    },
    {
      id: 4,
      sender: 'You',
      content: 'That\'s great! Feel free to reach out if you run into any issues during the migration.',
      timestamp: '10:42 AM',
      isOwn: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Network & Messages</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Manage Connections
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages Section */}
        <div className="lg:col-span-8">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Messages
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>

            <div className="flex flex-1 overflow-hidden">
              {/* Chat List */}
              <div className="w-80 border-r">
                <div className="p-4 space-y-2">
                  {recentChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        chat.id === selectedChat.id ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      <Avatar className="relative">
                        <AvatarFallback>{chat.avatar}</AvatarFallback>
                        {chat.unread && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className={`font-medium truncate ${chat.unread ? 'font-semibold' : ''}`}>
                            {chat.name}
                          </p>
                          <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                        </div>
                        <p className={`text-sm truncate ${chat.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Panel */}
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{selectedChat.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedChat.name}</h3>
                      <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button>Send</Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <SuggestedConnections />
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
