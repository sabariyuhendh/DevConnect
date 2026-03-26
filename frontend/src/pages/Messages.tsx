import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useMessaging } from '@/hooks/useMessaging';
import MessageInput from '@/components/MessageInput';
import MessageContent from '@/components/MessageContent';
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Loader2,
  MessageSquare
} from 'lucide-react';

const Messages = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    connected,
    typingUsers,
    fetchConversations,
    selectConversation,
    sendMessage,
    sendTypingIndicator,
    markAsRead
  } = useMessaging();

  // Theme-aware colors
  const colors = {
    bg: theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50',
    sidebar: theme === 'dark' ? 'bg-[#141414]' : 'bg-white',
    terminal: theme === 'dark' ? 'bg-[#141414]' : 'bg-white',
    header: theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100',
    border: theme === 'dark' ? 'border-gray-800' : 'border-gray-200',
    text: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
    textMuted: theme === 'dark' ? 'text-gray-500' : 'text-gray-500',
    hover: theme === 'dark' ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50',
    selected: theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100',
    input: theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50',
    messageBg: theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100',
    ownMessageBg: theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100',
    ownMessageText: theme === 'dark' ? 'text-blue-200' : 'text-blue-900',
    ownMessageBorder: theme === 'dark' ? 'border-blue-600/30' : 'border-blue-200',
    messageText: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
    messageBorder: theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200',
  };

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation changes
  useEffect(() => {
    if (currentConversation) {
      markAsRead(currentConversation.id);
    }
  }, [currentConversation, markAsRead]);

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.members[0];
    const name = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.username;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get current user from localStorage
  const getCurrentUserId = () => {
    const userData = localStorage.getItem('dc_user');
    if (userData) {
      return JSON.parse(userData).id;
    }
    return null;
  };

  const currentUserId = getCurrentUserId();

  // Handle send message
  const handleSendMessage = (content: string) => {
    if (currentConversation && content.trim()) {
      sendMessage(currentConversation.id, content);
    }
  };

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (currentConversation) {
      sendTypingIndicator(currentConversation.id, isTyping);
    }
  };

  // Format timestamp
  const formatTimestamp = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr`;
    return messageDate.toLocaleDateString();
  };

  // Format message time
  const formatMessageTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get other user from conversation
  const getOtherUser = (conv: typeof conversations[0]) => {
    return conv.members[0];
  };

  // Get typing users display
  const getTypingDisplay = () => {
    if (typingUsers.size === 0) return null;
    const typingUsersList = Array.from(typingUsers);
    if (typingUsersList.length === 1) return 'typing...';
    return `${typingUsersList.length} people typing...';
  };

  return (
    <div className={`h-full w-full flex ${colors.bg} p-6 gap-6 items-center`}>
      {/* Left Sidebar - Conversations List */}
      <div className={`w-[320px] flex flex-col ${colors.sidebar} border ${colors.border} flex-shrink-0 rounded-xl shadow-2xl overflow-hidden h-[85vh]`}>
        <div className={`flex items-center gap-1 p-3 ${colors.header} border-b ${colors.border}`}>
          <Button variant="ghost" size="sm" className={`flex-1 h-9 text-xs font-medium ${colors.selected} ${colors.text} hover:text-foreground rounded-lg`}>
            DMs
          </Button>
          <Button variant="ghost" size="sm" className={`flex-1 h-9 text-xs font-medium ${colors.textMuted} hover:text-foreground rounded-lg`}>
            Groups
          </Button>
        </div>
        
        <div className={`flex items-center justify-between px-4 py-3 border-b ${colors.border}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${colors.textMuted} font-mono`}>
            MESSAGES {conversations.length > 0 && `(${conversations.length})`}
          </h3>
          <div className={`flex items-center gap-1 text-xs ${colors.textMuted} font-mono`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{connected ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        
        <div className={`p-4 border-b ${colors.border}`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 ${colors.textMuted}`} />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 h-9 text-xs ${colors.input} border ${colors.border} ${colors.text} placeholder:${colors.textMuted} font-mono rounded-lg`}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className={`h-6 w-6 animate-spin ${colors.textMuted}`} />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageSquare className={`h-12 w-12 ${colors.textMuted} mb-2`} />
              <p className={`text-sm ${colors.textMuted} font-mono`}>
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              const displayName = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.username;
              const isSelected = currentConversation?.id === conv.id;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`px-3 py-3 rounded-xl cursor-pointer transition-all border-l-2 ${
                    isSelected
                      ? `${colors.selected} border-l-green-500`
                      : `border-l-transparent ${colors.hover}`
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex items-center gap-2">
                      {otherUser.isOnline && (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold text-sm truncate ${colors.text} font-mono`}>
                          {displayName}
                        </h4>
                        {conv.lastMessage && (
                          <span className={`text-[10px] ${colors.textMuted} flex-shrink-0 ml-2 font-mono`}>
                            {formatTimestamp(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className={`text-xs ${colors.textMuted} truncate leading-tight font-mono`}>
                          {conv.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Terminal Window - Messages */}
      <div className="flex-1 h-[85vh]">
        {!currentConversation ? (
          <div className={`w-full h-full ${colors.terminal} rounded-xl shadow-2xl overflow-hidden flex flex-col border ${colors.border} items-center justify-center`}>
            <MessageSquare className={`h-16 w-16 ${colors.textMuted} mb-4`} />
            <p className={`text-lg ${colors.text} font-mono`}>Select a conversation to start messaging</p>
            <p className={`text-sm ${colors.textMuted} font-mono mt-2`}>Choose from your existing conversations or start a new one</p>
          </div>
        ) : (
          <div className={`w-full h-full ${colors.terminal} rounded-xl shadow-2xl overflow-hidden flex flex-col border ${colors.border}`}>
            {/* Terminal Header */}
            <div className={`h-10 ${colors.header} border-b ${colors.border} flex items-center justify-between px-4 flex-shrink-0`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className={`flex items-center gap-3 ${colors.text} text-xs font-mono`}>
                <span>
                  {(() => {
                    const otherUser = getOtherUser(currentConversation);
                    return `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.username;
                  })()}
                </span>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${getOtherUser(currentConversation).isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span>{getOtherUser(currentConversation).isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 ${colors.textMuted}`}>
                <Button variant="ghost" size="icon" className={`h-6 w-6 hover:text-foreground ${colors.hover}`}>
                  <Phone className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className={`h-6 w-6 hover:text-foreground ${colors.hover}`}>
                  <Video className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className={`h-6 w-6 hover:text-foreground ${colors.hover}`}>
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Terminal Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 font-mono text-sm">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className={`h-8 w-8 animate-spin ${colors.textMuted}`} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className={`text-sm ${colors.textMuted}`}>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.senderId === currentUserId;
                  const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;
                  const sender = msg.sender;
                  const displayName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || sender.username;
                  
                  return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {!isOwn && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                          {sender.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      {!isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}
                      
                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        {!isOwn && showAvatar && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                              {displayName}
                            </span>
                            <span className={`text-[10px] ${colors.textMuted}`}>
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`${
                          isOwn
                            ? `${colors.ownMessageBg} ${colors.ownMessageText} border ${colors.ownMessageBorder}`
                            : `${colors.messageBg} ${colors.messageText} border ${colors.messageBorder}`
                        } rounded-xl px-4 py-2`}>
                          <MessageContent content={msg.content} />
                        </div>
                        
                        {isOwn && (
                          <span className={`text-[10px] mt-1 px-2 ${colors.textMuted}`}>
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Typing indicator */}
              {getTypingDisplay() && (
                <div className="flex items-center gap-2">
                  <div className={`text-xs ${colors.textMuted} italic font-mono`}>
                    {getTypingDisplay()}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput
              onSend={handleSendMessage}
              onTyping={handleTyping}
              placeholder="Type a message... (Markdown supported)"
              disabled={!connected}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
