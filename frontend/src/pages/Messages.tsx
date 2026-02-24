import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  ArrowLeft
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

  useEffect(() => {
    if (messageInput === '') {
      setShowCommands(false);
    }
  }, [messageInput]);

  return (
    <div className="h-full w-full flex bg-[#0a0a0a] p-6 gap-6 items-center">
      {/* Left Sidebar - Floating with Rounded Corners */}
      <div className="w-[320px] flex flex-col bg-[#1e1e1e] border border-gray-800 flex-shrink-0 rounded-xl shadow-2xl overflow-hidden h-[85vh]">
        <div className="flex items-center gap-1 p-3 bg-[#2d2d2d] border-b border-gray-800">
          <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs font-medium bg-[#1e1e1e] text-gray-300 hover:text-white rounded-lg">DMs</Button>
          <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs font-medium text-gray-500 hover:text-gray-300 rounded-lg">Groups</Button>
          <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs font-medium text-gray-500 hover:text-gray-300 rounded-lg">Explore</Button>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">MESSAGES</h3>
          <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors font-mono">
            <ArrowLeft className="h-3 w-3" />Back
          </button>
        </div>
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
            <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-xs bg-[#0a0a0a] border-gray-800 text-gray-300 placeholder:text-gray-600 font-mono rounded-lg" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {conversations.map((conv) => (
            <div key={conv.id} onClick={() => setSelectedChat(conv.id)} className={`px-3 py-3 rounded-xl cursor-pointer transition-all border-l-2 ${selectedChat === conv.id ? 'bg-[#2d2d2d] border-l-green-500' : 'border-l-transparent hover:bg-[#1a1a1a]'}`}>
              <div className="flex items-start gap-2.5">
                <div className="flex items-center gap-2">
                  {conv.online && <div className="w-2 h-2 rounded-full bg-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm truncate text-gray-300 font-mono">{conv.name}</h4>
                    <span className="text-[10px] text-gray-600 flex-shrink-0 ml-2 font-mono">{conv.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate leading-tight font-mono">{conv.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Window */}
      <div className="flex-1 h-[85vh]">
        <div className="w-full h-full bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-800">
          {/* Terminal Header */}
          <div className="h-10 bg-[#2d2d2d] border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-xs font-mono">
              <span>Sarah Chen</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Online</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-gray-300 hover:bg-gray-800"><Phone className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-gray-300 hover:bg-gray-800"><Video className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-gray-300 hover:bg-gray-800"><MoreVertical className="h-3.5 w-3.5" /></Button>
            </div>
          </div>

          {/* Terminal Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 font-mono text-sm">
            {messages.map((msg, idx) => {
              const showAvatar = idx === 0 || messages[idx - 1]?.sender !== msg.sender;
              return (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                  {!msg.isOwn && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">{msg.avatar}</div>
                  )}
                  {!msg.isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}
                  <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    {!msg.isOwn && showAvatar && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-400 text-xs font-semibold">{msg.sender}</span>
                        <span className="text-gray-600 text-[10px]">{msg.timestamp}</span>
                      </div>
                    )}
                    <div className={`${msg.isOwn ? 'bg-blue-600/20 text-blue-200 border border-blue-600/30 rounded-xl' : 'bg-gray-800/50 text-gray-200 border border-gray-700/50 rounded-xl'} ${msg.isCode ? 'p-0 overflow-hidden w-full' : 'px-4 py-2'}`}>
                      {msg.isCode ? (
                        <div className="bg-black/50 rounded-xl overflow-hidden w-full border border-gray-700">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900/80 border-b border-gray-700">
                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">typescript</span>
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-500/50" />
                              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                              <div className="w-2 h-2 rounded-full bg-green-500/50" />
                            </div>
                          </div>
                          <pre className="p-3 text-xs overflow-x-auto bg-black/30">
                            <code>
                              <span className="text-purple-400">const</span> <span className="text-yellow-300">Component</span> = <span className="text-gray-400">()</span> <span className="text-purple-400">=&gt;</span> {'{'}
                              {'\n  '}<span className="text-purple-400">return</span> (
                              {'\n    '}<span className="text-gray-500">&lt;</span><span className="text-green-400">div</span> <span className="text-blue-300">className</span><span className="text-gray-500">=</span><span className="text-orange-400">"card"</span><span className="text-gray-500">&gt;</span>
                              {'\n      '}<span className="text-gray-200">Hello World</span>
                              {'\n    '}<span className="text-gray-500">&lt;/</span><span className="text-green-400">div</span><span className="text-gray-500">&gt;</span>
                              {'\n  '});
                              {'\n'}{'}'}
                            </code>
                          </pre>
                        </div>
                      ) : (
                        <p className="leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    {msg.isOwn && <span className="text-gray-600 text-[10px] mt-1 px-2">{msg.timestamp}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terminal Input */}
          <div className="bg-[#2d2d2d] p-3 border-t border-gray-800 relative flex-shrink-0">
            {showCommands && (
              <div ref={commandsRef} className="absolute bottom-full left-4 mb-2 w-72 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-700 flex justify-between items-center bg-[#2d2d2d] rounded-t-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 font-mono">COMMANDS</span>
                  <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded-lg text-gray-400 border border-gray-700 font-mono">ESC</span>
                </div>
                <div className="py-1">
                  {commands.map((cmd, i) => (
                    <button key={cmd.id} onClick={() => handleCommandSelect(cmd)} className={`w-full px-3 py-2 hover:bg-gray-800/50 cursor-pointer flex items-center gap-3 border-l-2 text-left transition-colors rounded-lg ${i === 0 ? 'border-l-green-500 bg-gray-800/30' : 'border-l-transparent'}`}>
                      <div className="text-sm text-green-400">{cmd.icon}</div>
                      <span className="text-xs font-mono text-gray-300">{cmd.label}</span>
                      <span className="text-[10px] text-gray-500 ml-auto font-mono">{cmd.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 bg-[#1e1e1e] border border-gray-700 rounded-xl px-3 py-2">
              <span className="text-green-400 font-mono text-sm">$</span>
              <Input ref={inputRef} placeholder="Type a message..." value={messageInput} onChange={handleInputChange} onKeyDown={handleKeyPress} className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-auto p-0 font-mono text-gray-200 placeholder:text-gray-600 shadow-none outline-none" />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-gray-800 text-gray-500 hover:text-gray-300 rounded-lg"><Smile className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 p-0 hover:bg-gray-800 text-gray-500 hover:text-gray-300 rounded-lg"><Mic className="h-4 w-4" /></Button>
                <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700 text-white rounded-lg"><Send className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <div className="flex gap-3 text-[10px] text-gray-600 font-mono">
                <span className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors"><Code className="h-3 w-3" /> /snippet</span>
                <span className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors"><Link2 className="h-3 w-3" /> /link</span>
                <span className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors"><GitPullRequest className="h-3 w-3" /> /pr</span>
              </div>
              <span className="text-[10px] text-gray-600 font-mono">Press / for commands</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
