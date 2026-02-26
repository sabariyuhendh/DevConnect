import { useState, useEffect, useRef } from 'react';
import { 
  Timer, Volume2, CheckSquare, MessageSquare, TrendingUp, Smile, Award, FileText,
  X, Minus, Play, Pause, RotateCcw, Plus, Send, Filter, Bookmark,
  ThumbsUp, MessageCircle, Settings, Users, Flame, VolumeX,
  Coffee, CloudRain, Waves, Keyboard, Check, Trash2
} from 'lucide-react';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useCaveTasks } from '@/hooks/useCaveTasks';
import { useAuth } from '@/contexts/AuthContext';

const caveStyles = `
  .cave-glass-panel {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }
  .dark .cave-glass-panel {
    background: rgba(20, 20, 25, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .cave-sidebar {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .dark .cave-sidebar {
    background: rgba(20, 20, 25, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .cave-button:hover {
    background: rgba(255, 87, 34, 0.1);
  }
  .cave-active {
    background: rgba(255, 87, 34, 0.1);
    color: #FF5722;
  }
  .cave-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #FF5722;
    cursor: pointer;
    border-radius: 50%;
  }
  .resize-handle {
    position: absolute;
    background: transparent;
  }
  .resize-handle-se {
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: se-resize;
  }
  .resize-handle-e {
    top: 0;
    right: 0;
    width: 8px;
    height: 100%;
    cursor: e-resize;
  }
  .resize-handle-s {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 8px;
    cursor: s-resize;
  }
  .resize-indicator {
    display: none;
  }
  .no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .dragging * {
    cursor: grabbing !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 3px; }
`;

interface Module {
  id: string;
  title: string;
  icon: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minSize: { width: number; height: number };
  isVisible: boolean;
  zIndex: number;
}

interface DraggingState {
  moduleId: string | null;
  offset: { x: number; y: number };
}

interface ResizingState {
  moduleId: string | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  direction: 'se' | 'e' | 's' | null;
}

const DevelopersCave = () => {
  const [modules, setModules] = useState<Module[]>([
    { id: 'focus', title: 'Focus Mode', icon: Timer, position: { x: 100, y: 100 }, size: { width: 320, height: 280 }, minSize: { width: 280, height: 240 }, isVisible: true, zIndex: 1 },
    { id: 'tasks', title: 'Micro Tasks', icon: CheckSquare, position: { x: 440, y: 100 }, size: { width: 320, height: 400 }, minSize: { width: 280, height: 300 }, isVisible: true, zIndex: 2 },
    { id: 'chat', title: 'Topic Chat', icon: MessageSquare, position: { x: 780, y: 100 }, size: { width: 380, height: 500 }, minSize: { width: 320, height: 400 }, isVisible: true, zIndex: 3 },
    { id: 'notes', title: 'Notes', icon: FileText, position: { x: 1180, y: 100 }, size: { width: 320, height: 400 }, minSize: { width: 280, height: 300 }, isVisible: false, zIndex: 4 },
    { id: 'trends', title: 'Tech Trends', icon: TrendingUp, position: { x: 100, y: 400 }, size: { width: 360, height: 480 }, minSize: { width: 300, height: 350 }, isVisible: false, zIndex: 5 },
    { id: 'memes', title: 'Dev Memes', icon: Smile, position: { x: 480, y: 520 }, size: { width: 340, height: 420 }, minSize: { width: 300, height: 350 }, isVisible: false, zIndex: 6 },
    { id: 'reputation', title: 'Reputation', icon: Award, position: { x: 840, y: 620 }, size: { width: 300, height: 360 }, minSize: { width: 280, height: 320 }, isVisible: false, zIndex: 7 },
    { id: 'soundboard', title: 'Soundboard', icon: Volume2, position: { x: 1180, y: 100 }, size: { width: 280, height: 500 }, minSize: { width: 260, height: 400 }, isVisible: false, zIndex: 8 },
  ]);

  const [dragging, setDragging] = useState<DraggingState>({ moduleId: null, offset: { x: 0, y: 0 } });
  const [resizing, setResizing] = useState<ResizingState>({ moduleId: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0, direction: null });
  const [maxZIndex, setMaxZIndex] = useState(7);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK'>('POMODORO');
  const [newMessage, setNewMessage] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Use custom hooks
  const { messages, isConnected, sendMessage } = useChatSocket('general');
  const { tasks, isLoading: tasksLoading, addTask, toggleTask, deleteTask } = useCaveTasks();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleModule = (moduleId: string) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, isVisible: !m.isVisible, zIndex: maxZIndex + 1 } : m
    ));
    setMaxZIndex(prev => prev + 1);
  };

  const closeModule = (moduleId: string) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, isVisible: false } : m
    ));
  };

  const bringToFront = (moduleId: string) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, zIndex: maxZIndex + 1 } : m
    ));
    setMaxZIndex(prev => prev + 1);
  };

  const handleMouseDown = (e: React.MouseEvent, moduleId: string) => {
    e.preventDefault(); // Prevent text selection
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    bringToFront(moduleId);
    setDragging({
      moduleId,
      offset: { x: e.clientX - module.position.x, y: e.clientY - module.position.y }
    });
  };

  const handleResizeStart = (e: React.MouseEvent, moduleId: string, direction: 'se' | 'e' | 's') => {
    e.stopPropagation();
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    bringToFront(moduleId);
    setResizing({
      moduleId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: module.size.width,
      startHeight: module.size.height,
      direction
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging.moduleId) {
      setModules(prev => prev.map(m => 
        m.id === dragging.moduleId 
          ? { ...m, position: { x: e.clientX - dragging.offset.x, y: e.clientY - dragging.offset.y } }
          : m
      ));
    } else if (resizing.moduleId && resizing.direction) {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;
      
      setModules(prev => prev.map(m => {
        if (m.id === resizing.moduleId) {
          let newWidth = m.size.width;
          let newHeight = m.size.height;
          
          if (resizing.direction === 'se' || resizing.direction === 'e') {
            newWidth = Math.max(m.minSize.width, resizing.startWidth + deltaX);
          }
          if (resizing.direction === 'se' || resizing.direction === 's') {
            newHeight = Math.max(m.minSize.height, resizing.startHeight + deltaY);
          }
          
          return { ...m, size: { width: newWidth, height: newHeight } };
        }
        return m;
      }));
    }
  };

  const handleMouseUp = () => {
    setDragging({ moduleId: null, offset: { x: 0, y: 0 } });
    setResizing({ moduleId: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0, direction: null });
  };

  useEffect(() => {
    if (dragging.moduleId || resizing.moduleId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, resizing]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && focusTime > 0) {
      interval = setInterval(() => setFocusTime(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, focusTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    const roomName = newRoomName.trim().startsWith('#') ? newRoomName.trim() : `#${newRoomName.trim()}`;
    
    try {
      // Call API to create room (will be implemented)
      // For now, just switch to the new room name
      setSelectedRoom(roomName);
      setNewRoomName('');
      setShowCreateRoom(false);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleTimerModeChange = (mode: 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    
    // Set timer duration based on mode
    switch (mode) {
      case 'POMODORO':
        setFocusTime(25 * 60); // 25 minutes
        break;
      case 'SHORT_BREAK':
        setFocusTime(5 * 60); // 5 minutes
        break;
      case 'LONG_BREAK':
        setFocusTime(15 * 60); // 15 minutes
        break;
    }
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    switch (timerMode) {
      case 'POMODORO':
        setFocusTime(25 * 60);
        break;
      case 'SHORT_BREAK':
        setFocusTime(5 * 60);
        break;
      case 'LONG_BREAK':
        setFocusTime(15 * 60);
        break;
    }
  };

  return (
    <>
      <style>{caveStyles}</style>
      <div className={`relative w-full h-screen overflow-hidden bg-black dark:bg-black ${dragging.moduleId || resizing.moduleId ? 'no-select' : ''}`}>
        {/* Developer-focused background pattern */}
        <div className="absolute inset-0 z-0">
          {/* Light theme: White/light gradient with dark orbs */}
          <div className="absolute inset-0 dark:hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200"></div>
          <div className="absolute inset-0 dark:hidden" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
          <div className="absolute top-0 left-0 w-full h-full dark:hidden">
            <div className="absolute top-20 left-20 w-64 h-64 bg-gray-800 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gray-900 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>

          {/* Dark theme: Black gradient with bright orbs */}
          <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-black via-gray-950 to-black"></div>
          <div className="absolute inset-0 hidden dark:block" style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
          <div className="absolute top-0 left-0 w-full h-full hidden dark:block">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-gray-100 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gray-200 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
        </div>
        
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 cave-glass-panel px-6 py-2 rounded-full flex items-center gap-6 text-xs font-medium shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="dark:text-gray-200 text-gray-800">428 Developers Online</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#FF5722]" />
            <span className="dark:text-gray-200 text-gray-800">1,204 Tasks Crushed Today</span>
          </div>
        </div>

        <div className="absolute left-4 top-20 z-40 flex flex-col gap-2 p-3 cave-sidebar rounded-2xl shadow-xl">
          {modules.map(module => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`relative h-12 w-12 rounded-xl flex items-center justify-center transition-all cave-button ${
                  module.isVisible ? 'cave-active' : 'text-gray-500 dark:text-gray-400 hover:text-[#FF5722]'
                }`}
                title={module.title}
              >
                <Icon className="h-5 w-5" />
                {module.isVisible && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF5722] rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>

        {modules.filter(m => m.isVisible).map(module => (
          <div
            key={module.id}
            className={`absolute ${dragging.moduleId === module.id ? 'dragging' : ''}`}
            style={{
              left: module.position.x,
              top: module.position.y,
              width: module.size.width,
              height: module.size.height,
              zIndex: module.zIndex,
              cursor: dragging.moduleId === module.id ? 'grabbing' : 'default'
            }}
          >
            <div className="h-full flex flex-col cave-glass-panel rounded-2xl shadow-2xl overflow-hidden relative">
              <div 
                className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-move flex items-center justify-between"
                onMouseDown={(e) => handleMouseDown(e, module.id)}
              >
                <div className="flex items-center gap-2">
                  <module.icon className="h-4 w-4 text-[#FF5722]" />
                  <h3 className="font-semibold text-sm dark:text-white text-gray-800">{module.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => closeModule(module.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button 
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => closeModule(module.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {module.id === 'focus' && <FocusModule time={focusTime} isRunning={isTimerRunning} mode={timerMode} onToggle={() => setIsTimerRunning(!isTimerRunning)} onReset={handleTimerReset} onModeChange={handleTimerModeChange} formatTime={formatTime} />}
                {module.id === 'tasks' && <TasksModule tasks={tasks} isLoading={tasksLoading} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} />}
                {module.id === 'chat' && <ChatModule messages={messages} isConnected={isConnected} sendMessage={sendMessage} newMessage={newMessage} setNewMessage={setNewMessage} messagesEndRef={messagesEndRef} />}
                {module.id === 'notes' && <NotesModule />}
                {module.id === 'trends' && <TrendsModule />}
                {module.id === 'memes' && <MemesModule />}
                {module.id === 'reputation' && <ReputationModule />}
                {module.id === 'soundboard' && <SoundboardModule />}
              </div>
              {/* Resize handles */}
              <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleResizeStart(e, module.id, 'se')} />
              <div className="resize-handle resize-handle-e" onMouseDown={(e) => handleResizeStart(e, module.id, 'e')} />
              <div className="resize-handle resize-handle-s" onMouseDown={(e) => handleResizeStart(e, module.id, 's')} />
              <div className="resize-indicator" />
            </div>
          </div>
        ))}

        <button className="absolute bottom-6 right-6 z-40 h-12 w-12 rounded-xl cave-glass-panel flex items-center justify-center shadow-xl text-gray-600 dark:text-gray-300 hover:text-[#FF5722] transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </>
  );
};

const FocusModule = ({ time, isRunning, mode, onToggle, onReset, onModeChange, formatTime }: any) => (
  <div className="space-y-4">
    <div className="text-center">
      <div className="text-5xl font-bold font-mono mb-4 dark:text-white text-gray-800">{formatTime(time)}</div>
      <div className="flex items-center justify-center gap-2">
        <button onClick={onToggle} className="px-4 py-2 text-sm font-medium bg-[#FF5722] text-white rounded-lg hover:bg-[#FF5722]/90 transition-colors flex items-center gap-2">
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={onReset} className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors dark:text-gray-200 text-gray-700">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
    <div className="flex justify-between text-xs border-t border-gray-200 dark:border-gray-700 pt-3">
      <button 
        onClick={() => onModeChange('POMODORO')}
        className={`px-3 py-1 font-medium transition-colors ${
          mode === 'POMODORO' 
            ? 'text-[#FF5722] border-b-2 border-[#FF5722]' 
            : 'dark:text-gray-400 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
        }`}
      >
        Pomodoro
      </button>
      <button 
        onClick={() => onModeChange('SHORT_BREAK')}
        className={`px-3 py-1 font-medium transition-colors ${
          mode === 'SHORT_BREAK' 
            ? 'text-[#FF5722] border-b-2 border-[#FF5722]' 
            : 'dark:text-gray-400 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
        }`}
      >
        Short Break
      </button>
      <button 
        onClick={() => onModeChange('LONG_BREAK')}
        className={`px-3 py-1 font-medium transition-colors ${
          mode === 'LONG_BREAK' 
            ? 'text-[#FF5722] border-b-2 border-[#FF5722]' 
            : 'dark:text-gray-400 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
        }`}
      >
        Long Break
      </button>
    </div>
  </div>
);

const TasksModule = ({ tasks, isLoading, onAddTask, onToggleTask, onDeleteTask }: {
  tasks: any[];
  isLoading: boolean;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 text-xs font-medium bg-[#FF5722]/10 text-[#FF5722] rounded-lg border border-[#FF5722]/30 flex items-center gap-1">
          <Filter className="h-3 w-3" /> All
        </button>
        <button 
          onClick={() => setShowAddTask(!showAddTask)}
          className="px-3 py-1 text-xs font-medium dark:text-gray-400 text-gray-600 hover:text-[#FF5722] transition-colors ml-auto flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add task
        </button>
      </div>
      
      {showAddTask && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Task title..."
            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5722]/50"
            autoFocus
          />
          <button
            onClick={handleAddTask}
            className="h-10 w-10 flex items-center justify-center bg-[#FF5722] text-white rounded-lg hover:bg-[#FF5722]/90 transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm dark:text-gray-400 text-gray-500">Loading tasks...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckSquare className="h-12 w-12 mb-2 dark:text-gray-600 text-gray-400" />
          <p className="text-sm dark:text-gray-400 text-gray-500">No tasks yet</p>
          <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">Add your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="p-3 bg-white dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 hover:border-[#FF5722]/30 transition-colors group">
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  className="mt-1 accent-[#FF5722] cursor-pointer" 
                  checked={task.status === 'COMPLETED'} 
                  onChange={() => onToggleTask(task.id)} 
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium dark:text-gray-200 text-gray-800 ${task.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-[#FF5722]/10 text-[#FF5722] rounded border border-[#FF5722]/30">
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs dark:text-gray-400 text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatModule = ({ messages, isConnected, sendMessage, newMessage, setNewMessage, messagesEndRef }: any) => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <h4 className="text-sm font-semibold dark:text-gray-200 text-gray-800">General Chat</h4>
          <p className="text-xs dark:text-gray-400 text-gray-500">Real-time messaging</p>
        </div>
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>
      
      <div className="flex-1 overflow-auto mb-3">
        {!isConnected ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm dark:text-gray-400 text-gray-500">Connecting to chat...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 dark:text-gray-600 text-gray-400" />
              <p className="text-sm dark:text-gray-400 text-gray-500">No messages yet</p>
              <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">Be the first to say hello!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg: any) => {
              const isOwnMessage = msg.userId === user?.id;
              return (
                <div key={msg.id} className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {msg.username?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold dark:text-gray-200 text-gray-800">
                        {isOwnMessage ? 'You' : msg.username}
                      </span>
                      <span className="text-xs dark:text-gray-400 text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm p-2 rounded-lg inline-block ${
                      isOwnMessage 
                        ? 'bg-[#FF5722] text-white' 
                        : 'bg-gray-100 dark:bg-black/30 dark:text-gray-300 text-gray-700'
                    }`}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <input 
          placeholder="Type a message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newMessage.trim() && isConnected) {
              sendMessage(newMessage);
              setNewMessage('');
            }
          }}
          className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5722]/50" 
        />
        <button 
          onClick={() => {
            if (newMessage.trim()) {
              sendMessage(newMessage);
              setNewMessage('');
            }
          }}
          disabled={!newMessage.trim() || !isConnected}
          className="h-10 w-10 flex items-center justify-center bg-[#FF5722] text-white rounded-lg hover:bg-[#FF5722]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={isConnected ? 'Send message' : 'Connecting...'}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const TrendsModule = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('trending');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setFilter('trending')}
          className={`px-3 py-1 text-xs font-medium rounded-lg border flex items-center gap-1 ${
            filter === 'trending' 
              ? 'bg-[#FF5722]/10 text-[#FF5722] border-[#FF5722]/30' 
              : 'dark:text-gray-400 text-gray-600 border-gray-300 dark:border-gray-600 hover:text-[#FF5722]'
          }`}
        >
          <TrendingUp className="h-3 w-3" /> Trending
        </button>
        <button 
          onClick={() => setFilter('latest')}
          className={`px-3 py-1 text-xs font-medium rounded-lg border flex items-center gap-1 ${
            filter === 'latest' 
              ? 'bg-[#FF5722]/10 text-[#FF5722] border-[#FF5722]/30' 
              : 'dark:text-gray-400 text-gray-600 border-gray-300 dark:border-gray-600 hover:text-[#FF5722]'
          }`}
        >
          Latest
        </button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm dark:text-gray-400 text-gray-500">Loading articles...</div>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <TrendingUp className="h-12 w-12 mb-2 dark:text-gray-600 text-gray-400" />
          <p className="text-sm dark:text-gray-400 text-gray-500">No articles yet</p>
          <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">Check back later for tech trends</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(article => (
            <div key={article.id} className="p-3 bg-white dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 hover:border-[#FF5722]/30 transition-colors cursor-pointer">
              {article.tags && article.tags.length > 0 && (
                <span className="text-xs px-2 py-0.5 bg-[#FF5722]/10 text-[#FF5722] rounded border border-[#FF5722]/30 inline-block mb-2">
                  {article.tags[0]}
                </span>
              )}
              <h4 className="text-sm font-semibold mb-2 dark:text-gray-200 text-gray-800">{article.title}</h4>
              <div className="flex items-center justify-between text-xs dark:text-gray-400 text-gray-500">
                <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recently'}</span>
                <div className="flex items-center gap-3">
                  <span>{article.readCount || 0} reads</span>
                  <button className="h-6 w-6 flex items-center justify-center hover:text-[#FF5722] transition-colors">
                    <Bookmark className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MemesModule = () => {
  const [memes, setMemes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold dark:text-gray-200 text-gray-800">Dev Memes</h4>
        <button className="px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors dark:text-gray-200 text-gray-700 flex items-center gap-1">
          <Plus className="h-3 w-3" /> Upload
        </button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm dark:text-gray-400 text-gray-500">Loading memes...</div>
        </div>
      ) : memes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Smile className="h-12 w-12 mb-2 dark:text-gray-600 text-gray-400" />
          <p className="text-sm dark:text-gray-400 text-gray-500">No memes yet</p>
          <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">Be the first to upload!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {memes.map(meme => (
            <div key={meme.id} className="p-3 bg-white dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                <Smile className="h-12 w-12 dark:text-gray-500 text-gray-400" />
              </div>
              <p className="text-sm mb-2 dark:text-gray-200 text-gray-800">{meme.caption}</p>
              <div className="flex items-center gap-3 text-xs">
                <button className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors dark:text-gray-400 text-gray-600 flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> {meme.votes || 0}
                </button>
                <button className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors dark:text-gray-400 text-gray-600 flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> {meme.comments || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReputationModule = () => {
  const [reputation, setReputation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm dark:text-gray-400 text-gray-500">Loading...</div>
        </div>
      ) : !reputation ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Award className="h-12 w-12 mb-2 dark:text-gray-600 text-gray-400" />
          <p className="text-sm dark:text-gray-400 text-gray-500">No reputation data</p>
          <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">Start completing tasks to earn points!</p>
        </div>
      ) : (
        <>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#FF5722] mb-2">{reputation.points || 0}</div>
            <p className="text-sm dark:text-gray-400 text-gray-600">Reputation Points</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm dark:text-gray-300 text-gray-700">
              <span>Level</span>
              <span className="px-2 py-0.5 bg-[#FF5722]/10 text-[#FF5722] rounded border border-[#FF5722]/30 text-xs font-medium">
                {reputation.level || 'Explorer'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm dark:text-gray-300 text-gray-700">
              <span>Focus Streak</span>
              <span className="font-semibold flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" /> {reputation.focusStreak || 0} days
              </span>
            </div>
          </div>
          {reputation.badges && reputation.badges.length > 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold mb-2 dark:text-gray-200 text-gray-800">Badges</h4>
              <div className="flex flex-wrap gap-2">
                {reputation.badges.map((badge: string, index: number) => (
                  <span key={index} className="text-xs px-2 py-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded dark:text-gray-300 text-gray-700">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SoundboardModule = () => {
  const [masterVolume, setMasterVolume] = useState(40);
  const ambiences = [
    { name: 'Delta Waves', icon: Waves, volume: 60, color: 'text-blue-400' },
    { name: 'Rain', icon: CloudRain, volume: 20, color: 'text-gray-400' },
    { name: 'Cafe', icon: Coffee, volume: 0, color: 'text-amber-700' },
    { name: 'Keyboard', icon: Keyboard, volume: 0, color: 'text-gray-500' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold dark:text-gray-400 text-gray-600 uppercase mb-2 block">Master Volume</label>
        <div className="flex items-center gap-3">
          <VolumeX className="h-4 w-4 dark:text-gray-400 text-gray-500" />
          <input type="range" min="0" max="100" value={masterVolume} onChange={(e) => setMasterVolume(Number(e.target.value))} className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer cave-slider" />
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-xs font-semibold dark:text-gray-400 text-gray-600 uppercase">Ambiance</label>
        {ambiences.map(amb => (
          <div key={amb.name} className="space-y-1">
            <div className="flex items-center gap-2">
              <amb.icon className={`h-4 w-4 ${amb.color}`} />
              <span className="text-sm font-medium dark:text-gray-200 text-gray-800">{amb.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <VolumeX className="h-4 w-4 dark:text-gray-400 text-gray-500" />
              <input type="range" min="0" max="100" defaultValue={amb.volume} className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer cave-slider" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotesModule = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [currentNote, setCurrentNote] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {!isEditing ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold dark:text-gray-200 text-gray-800">My Notes</h4>
            <button 
              onClick={() => { setCurrentNote({ title: '', content: '' }); setIsEditing(true); }}
              className="px-3 py-1 text-xs font-medium bg-[#FF5722] text-white rounded-lg hover:bg-[#FF5722]/90 transition-colors flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> New Note
            </button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="text-sm dark:text-gray-400 text-gray-500">Loading notes...</div>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <FileText className="h-12 w-12 mb-2 dark:text-gray-600 text-gray-400" />
              <p className="text-sm dark:text-gray-400 text-gray-500">No notes yet</p>
              <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">Create your first note</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-auto">
              {notes.map(note => (
                <div 
                  key={note.id} 
                  onClick={() => { setCurrentNote(note); setIsEditing(true); }}
                  className="p-3 bg-white dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 hover:border-[#FF5722]/30 transition-colors cursor-pointer"
                >
                  <h5 className="text-sm font-semibold dark:text-gray-200 text-gray-800 mb-1">{note.title || 'Untitled'}</h5>
                  <p className="text-xs dark:text-gray-400 text-gray-600 line-clamp-2">{note.content}</p>
                  <span className="text-xs dark:text-gray-500 text-gray-500 mt-1 block">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <input 
              type="text" 
              placeholder="Note title..." 
              value={currentNote?.title || ''}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              className="flex-1 px-3 py-1.5 text-sm font-semibold bg-transparent border-b border-gray-200 dark:border-gray-700 dark:text-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5722]/50"
            />
            <div className="flex items-center gap-2 ml-2">
              <button 
                onClick={() => { setIsEditing(false); setCurrentNote(null); }}
                className="px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors dark:text-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => { 
                  // Save note logic here
                  setIsEditing(false); 
                  setCurrentNote(null); 
                }}
                className="px-3 py-1 text-xs font-medium bg-[#FF5722] text-white rounded-lg hover:bg-[#FF5722]/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
          <textarea 
            placeholder="Start typing your note..."
            value={currentNote?.content || ''}
            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            className="flex-1 px-3 py-2 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg dark:text-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5722]/50 resize-none"
          />
        </div>
      )}
    </div>
  );
};

export default DevelopersCave;
