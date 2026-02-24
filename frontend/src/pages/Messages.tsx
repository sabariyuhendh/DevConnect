import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Mic,
  Code,
  Link2,
  GitPullRequest,
  ArrowLeft,
  Plus
} from 'lucide-react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandsRef = useRef<HTMLDivElement>(null);

  const conversations = [
    { id: '1', name: 'Sarah Chen', avatar: 'SC', lastMessage: 'Thanks for the React tips! Really helpful 🚀', timestamp: '2 min', online: true },
    { id: '2', name: 'Marcus Rodriguez', avatar: 'MR', lastMessage: 'Great article on microservices!', timestamp: '1 hr', online: false },
    { id: '3', name: 'Ada Lovelace', avatar: 'AL', lastMessage: 'Check out the new algorithm.', timestamp: '3 hr', online: false }
  ];

  const messages = [
    { id: '1', sender: 'Sarah Chen', avatar: 'SC', content: 'Hey! I saw your post about React best practices. Really insightful!', timestamp: '10:30 AM', isOwn: false },
    { id: '2', sender: 'You', avatar: 'JD', content: 'Thanks! I\'m glad you found it helpful. Are you working on any React projects right now?', timestamp: '10:32 AM', isOwn: true },
    { id: '3', sender: 'Sarah Chen', avatar: 'SC', content: 'Yes! I\'m building a dashboard with React and TypeScript. Your tips on component composition came at the perfect time.', timestamp: '10:35 AM', isOwn: false },
    { id: '4', sender: 'Sarah Chen', avatar: 'SC', content: 'I\'m trying to abstract a card component like this:', timestamp: '10:35 AM', isOwn: false },
    { id: '5', sender: 'Sarah Chen', avatar: 'SC', content: 'code', timestamp: '10:36 AM', isOwn: false, isCode: true },
    { id: '6', sender: 'Sarah Chen', avatar: 'SC', content: 'I\'m using Tailwind CSS with Headless UI. The combination is really powerful for building accessible', timestamp: '10:38 AM', isOwn: false }
  ];

  const commands = [
    { id: 'snippet', icon: <Code className="h-4 w-4" />, label: '/snippet', description: 'Insert code block' },
    { id: 'link', icon: <Link2 className="h-4 w-4" />, label: '/link', description: 'Add hyperlink' },
    { id: 'pr', icon: <GitPullRequest className="h-4 w-4" />, label: '/pr', description: 'Link Pull Request' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);
    
    // Only show commands when input is exactly '/' or starts with '/' and has no space
    if (value === '/' || (value.startsWith('/') && !value.includes(' ') && value.length > 0)) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && !showCommands) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
      setShowCommands(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowCommands(false);
      setMessageInput('');
    } else if (e.key === 'Enter' && !showCommands) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCommandSelect = (command: typeof commands[0]) => {
    setMessageInput('');
    setShowCommands(false);
    console.log('Selected command:', command.id);
    inputRef.current?.focus();
  };

  // Click outside to close commands
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandsRef.current && !commandsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowCommands(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close commands when input is cleared
  useEffect(() => {
    if (messageInput === '') {
      setShowCommands(false);
    }
  }, [messageInput]);

  return (
    <div className="h-full w-full flex bg-muted/20">
      {/* Left Sidebar - Fixed visibility */}
      <div className="w-[320px] flex flex-col bg-card border-r border-border flex-shrink-0">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-3 bg-muted/50 border-b border-border">
          <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs font-medium bg-background shadow-sm">
            DMs
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs font-medium text-muted-foreground hover:text-foreground">
            Groups
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs font-medium text-muted-foreground hover:text-foreground">
            Explore
          </Button>
        </div>

        {/* Messages Header with Back Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            MESSAGES
          </h3>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-9 h-9 text-xs bg-transparent border-border"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {conversations.map((conv) => (
            <div 
              key={conv.id} 
              onClick={() => setSelectedChat(conv.id)} 
              className={`px-3 py-3 rounded-md cursor-pointer transition-all border-l-2 ${
                selectedChat === conv.id 
                  ? 'bg-muted/50 border-l-primary' 
                  : 'border-l-transparent hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="flex items-center gap-2">
                  {conv.online && <div className="w-2 h-2 rounded-full bg-green-500" />}
                  {!conv.online && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                        {conv.avatar}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm truncate">{conv.name}</h4>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{conv.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-tight">{conv.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area with Monitor Setup */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-7xl flex flex-col items-center justify-center h-full">
          {/* Monitor Frame - 16:9 Aspect Ratio - Larger */}
          <div className="w-full bg-background rounded-2xl shadow-2xl border-4 border-border overflow-hidden flex flex-col" style={{ aspectRatio: '16/9', maxHeight: '80vh' }}>
            {/* Chat Header */}
            <div className="h-12 bg-muted/30 border-b border-border px-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                    SC
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">Sarah Chen</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area - Fixed padding */}
            <div className="flex-1 overflow-y-auto p-6 bg-muted/10 space-y-6 min-h-0">
              {messages.map((msg, idx) => {
                const showAvatar = idx === 0 || messages[idx - 1]?.sender !== msg.sender;
                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                    {!msg.isOwn && showAvatar && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-indigo-500 text-white text-xs font-bold">
                          {msg.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!msg.isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}
                    <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className={`rounded-2xl ${
                        msg.isOwn 
                          ? 'bg-black dark:bg-white text-white dark:text-black rounded-tr-none shadow-md border border-gray-800 dark:border-gray-200' 
                          : 'bg-background text-foreground rounded-tl-none border border-border'
                      } ${msg.isCode ? 'p-0 overflow-hidden w-full' : 'px-4 py-3'}`}>
                        {msg.isCode ? (
                          <div className="bg-black rounded-2xl overflow-hidden w-full">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700 relative group">
                              <span className="text-xs text-gray-400 font-mono">typescript</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                              </div>
                            </div>
                            <pre className="p-4 text-xs font-mono overflow-x-auto">
                              <code className="text-green-400">
                                const <span className="text-yellow-300">Component</span> = <span className="text-purple-400">()</span> =&gt; {'{'}
                                {'\n  '}<span className="text-white">return (</span>
                                {'\n    '}<span className="text-blue-300">&lt;div <span className="text-purple-300">className</span>="card"&gt;</span>
                                {'\n      '}<span className="text-white">Hello World</span>
                                {'\n    '}<span className="text-blue-300">&lt;/div&gt;</span>
                                {'\n  '}<span className="text-white">);</span>
                                {'\n'}{'}'}
                              </code>
                            </pre>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-2">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Area */}
            <div className="bg-background p-4 border-t border-border relative flex-shrink-0">
              {/* Command Menu */}
              {showCommands && (
                <div ref={commandsRef} className="absolute bottom-full left-4 mb-2 w-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-border flex justify-between items-center bg-muted/50">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-mono">COMMANDS</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">ESC</span>
                  </div>
                  <div className="py-1">
                    {commands.map((cmd, i) => (
                      <button 
                        key={cmd.id} 
                        onClick={() => handleCommandSelect(cmd)}
                        className={`w-full px-3 py-2 hover:bg-muted/50 cursor-pointer flex items-center gap-2 border-l-2 text-left transition-colors ${
                          i === 0 ? 'border-l-primary bg-muted/30' : 'border-l-transparent'
                        }`}
                      >
                        <div className="text-sm text-primary">{cmd.icon}</div>
                        <span className="text-xs font-mono text-foreground">{cmd.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{cmd.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center bg-muted/50 border border-border rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-primary transition-shadow shadow-sm">
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-muted">
                  <Plus className="h-5 w-5" />
                </Button>
                <div className="h-4 w-px bg-border mx-2" />
                <Input 
                  ref={inputRef} 
                  placeholder="Type a message..."
                  value={messageInput} 
                  onChange={(e) => setMessageInput(e.target.value)} 
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-auto p-0 font-mono shadow-none outline-none"
                />
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-muted">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-muted">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button size="icon" className="h-8 w-8 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 ml-1">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 px-1">
                <div className="flex gap-3 text-[10px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
                    <Code className="h-3 w-3" /> Code
                  </span>
                  <span className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Snippet
                  </span>
                  <span className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
                    <Link2 className="h-3 w-3" /> Link
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">Press / for commands</span>
              </div>
            </div>
          </div>

          {/* Monitor Stand */}
          <div className="flex flex-col items-center mt-4">
            {/* Stand neck */}
            <div className="w-32 h-4 bg-gradient-to-b from-muted-foreground/40 to-muted-foreground/30 rounded-t-xl shadow-md" />
            {/* Stand base */}
            <div className="w-56 h-3 bg-muted-foreground/30 rounded-full shadow-inner mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
