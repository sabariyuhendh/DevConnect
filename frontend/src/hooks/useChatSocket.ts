import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/config/api';

interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: string;
  roomId?: string;
}

interface ChatSocketHook {
  messages: Message[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  connectionError: string | null;
}

export function useChatSocket(roomName: string = 'general'): ChatSocketHook {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch or create room
  useEffect(() => {
    if (!user?.token) return;

    const fetchRoom = async () => {
      try {
        // Get all rooms
        const response = await fetch(`${API_BASE}/api/cave/chat/rooms`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const rooms = data.data || [];
          
          // Find room by name (with or without #)
          const searchName = roomName.startsWith('#') ? roomName : `#${roomName}`;
          let room = rooms.find((r: any) => r.name === searchName || r.name === roomName);
          
          // If room doesn't exist, create it
          if (!room) {
            console.log('🏗️ Creating room:', roomName);
            try {
              const createResponse = await fetch(`${API_BASE}/api/cave/chat/rooms`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${user.token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  name: roomName,
                  description: 'General chat room'
                })
              });
              
              if (createResponse.ok) {
                const createData = await createResponse.json();
                room = createData.data;
                console.log('✅ Room created:', room.name);
              } else {
                console.warn('⚠️ Room creation failed, will retry fetch');
                // Room might have been created by another user, fetch again
                const retryResponse = await fetch(`${API_BASE}/api/cave/chat/rooms`, {
                  headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (retryResponse.ok) {
                  const retryData = await retryResponse.json();
                  room = (retryData.data || []).find((r: any) => r.name === searchName || r.name === roomName);
                }
              }
            } catch (createError) {
              console.error('❌ Error creating room:', createError);
            }
          }
          
          if (room) {
            console.log('🚪 Room ready:', room.name, '→', room.id);
            setRoomId(room.id);
          } else {
            console.error('❌ Could not find or create room');
            setConnectionError('Could not find or create chat room');
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch/create room:', error);
        setConnectionError('Failed to connect to chat');
      }
    };

    fetchRoom();
  }, [user?.token, roomName]);

  useEffect(() => {
    if (!user?.token || !roomId) {
      console.log('⏭️ No user token or room ID - skipping socket connection');
      return;
    }

    // Connect to Socket.IO server
    const socket = io(API_BASE, {
      auth: {
        token: user.token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Chat connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // Join room
      socket.emit('join_room', roomId);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Chat disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Message events
    socket.on('message', (message: Message) => {
      console.log('📨 New message received:', message);
      setMessages(prev => {
        console.log('📝 Adding message to state. Current count:', prev.length);
        return [...prev, message];
      });
    });

    socket.on('message_history', (history: Message[]) => {
      console.log('📚 Message history loaded:', history.length);
      setMessages(history);
    });

    // User events
    socket.on('user_joined', (data: { userId: string; username: string }) => {
      console.log('👋 User joined:', data.username);
    });

    socket.on('user_left', (data: { userId: string; username: string }) => {
      console.log('👋 User left:', data.username);
    });

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting chat socket');
      socket.emit('leave_room', roomId);
      socket.disconnect();
    };
  }, [user?.token, roomId]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !content.trim()) {
      console.warn('⚠️ Cannot send message - no socket or empty content');
      return;
    }

    console.log('📤 Sending message:', content);
    socketRef.current.emit('send_message', {
      roomId,
      content: content.trim()
    });
  }, [roomId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isConnected,
    sendMessage,
    clearMessages,
    connectionError
  };
}
