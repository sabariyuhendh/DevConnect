import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/config/api';

interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
}

export function useCaveSocket(roomName: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch available rooms
  useEffect(() => {
    if (!user?.token) return;

    const fetchRooms = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/cave/chat/rooms`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setRooms(data.data || []);
          
          // Find room ID by name
          if (roomName) {
            const room = data.data.find((r: ChatRoom) => r.name === roomName);
            if (room) {
              setCurrentRoomId(room.id);
            }
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch rooms:', error);
      }
    };

    fetchRooms();
  }, [user?.token, roomName]);

  useEffect(() => {
    if (!user?.token || !currentRoomId) return;

    // Get WebSocket URL from API base - backend uses /cave namespace
    const wsUrl = API_BASE + '/cave';
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);

    // Initialize socket connection
    const socket = io(wsUrl, {
      auth: {
        token: user.token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      
      // Join the room - backend expects 'join_room' event
      console.log('🚪 Joining room:', currentRoomId);
      socket.emit('join_room', currentRoomId);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Message events - backend sends 'new_message' event
    socket.on('new_message', (message: Message) => {
      console.log('📨 Received message:', message);
      setMessages(prev => [...prev, message]);
    });

    // User joined/left events
    socket.on('user_joined', (data: any) => {
      console.log('👋 User joined:', data.username);
    });

    socket.on('user_left', (data: any) => {
      console.log('👋 User left:', data.username);
    });

    // Room stats
    socket.on('room_stats', (data: any) => {
      console.log('📊 Room stats:', data);
    });

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting WebSocket');
      socket.emit('leave_room', currentRoomId);
      socket.disconnect();
    };
  }, [user?.token, currentRoomId]);

  // Fetch message history when room changes
  useEffect(() => {
    if (!user?.token || !currentRoomId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/cave/chat/rooms/${currentRoomId}/messages`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📚 Loaded message history:', data.data?.length || 0, 'messages');
          setMessages(data.data || []);
        }
      } catch (error) {
        console.error('❌ Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [user?.token, currentRoomId]);

  const sendMessage = (content: string) => {
    if (!socketRef.current || !currentRoomId || !content.trim()) return;

    console.log('📤 Sending message:', content);
    
    // Backend expects 'send_message' event
    socketRef.current.emit('send_message', {
      roomId: currentRoomId,
      content: content.trim()
    });
  };

  return {
    messages,
    isConnected,
    sendMessage,
    rooms,
    currentRoomId
  };
}
