# Server-Sent Events (SSE) Implementation for Feed

## Why SSE Instead of WebSockets?

Based on research and best practices, **Server-Sent Events (SSE)** is the optimal choice for social media feed updates:

### SSE Advantages
✅ **Simpler**: Much easier to implement than WebSockets  
✅ **HTTP-based**: Works with standard HTTP (better proxy/firewall compatibility)  
✅ **Auto-reconnect**: Built-in automatic reconnection  
✅ **Stateless**: Easier to scale horizontally  
✅ **Lower overhead**: No handshake protocol, just HTTP  
✅ **One-way push**: Perfect for feed updates (server→client only)  

### When to Use Each Technology

| Technology | Best For | Overhead | Complexity |
|------------|----------|----------|------------|
| **SSE** | Feed updates, notifications, live scores | Low | Simple |
| **WebSocket** | Chat, gaming, bidirectional real-time | Medium | Complex |
| **Long Polling** | Legacy browser support | High | Medium |
| **Short Polling** | Non-critical updates | Very High | Simple |

### Research Sources
Content rephrased for compliance with licensing restrictions:
- [SSE vs WebSocket Comparison](https://www.caduh.com/blog/long-polling-vs-websockets-vs-sse)
- [Real-Time Communication Protocols](https://www.freecodecamp.org/news/server-sent-events-vs-websockets/)
- [SSE in Production](https://skyflo.ai/blog/sse-streaming-with-redis-and-proxy-hardening)

## Implementation

### Backend (Node.js + Express)

**SSE Controller** (`backend/src/controllers/feedSSEController.ts`):
```typescript
// Store active connections
const connections = new Map<string, Response>();

// SSE endpoint
export const feedSSE = async (req: Request, res: Response) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);
  
  // Store connection
  connections.set(userId, res);
  
  // Handle disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    connections.delete(userId);
  });
};

// Broadcast to specific users
export const broadcastNewPost = async (post: any, followerIds: string[]) => {
  followerIds.forEach(followerId => {
    const connection = connections.get(followerId);
    if (connection) {
      connection.write(`data: ${JSON.stringify({ type: 'new_post', data: post })}\n\n`);
    }
  });
};
```

**Authentication** (`backend/src/middleware/sseAuth.ts`):
```typescript
// EventSource doesn't support custom headers
// So we accept token via query parameter
export const authenticateSSE = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.query.token as string;
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = decoded;
  next();
};
```

**Routes** (`backend/src/routes/postRoutes.ts`):
```typescript
// SSE endpoint (separate auth for query param)
router.get('/feed/stream', authenticateSSE, feedSSEController.feedSSE);

// Regular endpoints
router.post('/', authenticate, postController.createPost);
router.get('/feed', authenticate, postController.getFeed);
```

### Frontend (React + TypeScript)

**SSE Hook** (`frontend/src/hooks/useFeedSSE.ts`):
```typescript
export function useFeedSSE() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Create EventSource with token in URL
    const url = `${API_BASE}/api/posts/feed/stream?token=${user.token}`;
    const eventSource = new EventSource(url);
    
    // Handle messages
    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'new_post':
          // Handle new post
          break;
        case 'post_updated':
          // Handle update
          break;
        case 'post_deleted':
          // Handle deletion
          break;
      }
    };
    
    // Auto-reconnect on error
    eventSource.onerror = () => {
      setIsConnected(false);
      // EventSource automatically reconnects
    };
    
    return () => eventSource.close();
  }, [user?.token]);
  
  return { isConnected, onNewPost, onPostUpdate, onPostDelete };
}
```

**Usage in Feed Page**:
```typescript
const { isConnected, onNewPost, onPostUpdate, onPostDelete } = useFeedSSE();

useEffect(() => {
  onNewPost((post) => {
    addPost(post);
  });
  
  onPostUpdate((post) => {
    updatePostFromSocket(post);
  });
  
  onPostDelete((postId) => {
    removePost(postId);
  });
}, []);
```

## SSE Message Format

All messages follow this structure:
```
data: {"type": "event_type", "data": {...}}\n\n
```

### Event Types

1. **connected**
```json
{
  "type": "connected",
  "userId": "user123"
}
```

2. **new_post**
```json
{
  "type": "new_post",
  "data": {
    "id": "post123",
    "content": "Hello world",
    "author": {...},
    ...
  }
}
```

3. **post_updated**
```json
{
  "type": "post_updated",
  "data": {
    "id": "post123",
    "content": "Updated content",
    ...
  }
}
```

4. **post_deleted**
```json
{
  "type": "post_deleted",
  "data": {
    "postId": "post123"
  }
}
```

## Performance Characteristics

### Connection Overhead
- **Initial**: ~1KB (HTTP headers)
- **Heartbeat**: ~10 bytes every 30s
- **Message**: ~1-5KB per post update

### Scalability
- **Connections**: 10,000+ per server (Node.js)
- **Memory**: ~10KB per connection
- **CPU**: Minimal (event-driven)

### Comparison with WebSocket
| Metric | SSE | WebSocket |
|--------|-----|-----------|
| Initial handshake | HTTP only | HTTP + WS upgrade |
| Connection overhead | Lower | Higher |
| Proxy compatibility | Excellent | Good |
| Auto-reconnect | Built-in | Manual |
| Bidirectional | No | Yes |
| Browser support | All modern | All modern |

## Production Considerations

### Nginx Configuration
```nginx
location /api/posts/feed/stream {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 24h;
}
```

### Load Balancing
- Use sticky sessions (IP hash) for SSE endpoints
- Or use Redis pub/sub to broadcast across servers
- Consider dedicated SSE servers for high scale

### Monitoring
```typescript
// Get connection stats
export const getConnectionStats = () => {
  return {
    activeConnections: connections.size,
    connectedUsers: Array.from(connections.keys())
  };
};
```

### Error Handling
- Client automatically reconnects on disconnect
- Server cleans up on connection close
- Heartbeat prevents proxy timeouts

## Testing

### Manual Test
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Test SSE endpoint
curl -N -H "Accept: text/event-stream" \
  "http://localhost:3001/api/posts/feed/stream?token=YOUR_TOKEN"
```

### Browser Test
1. Login to DevConnect
2. Open Feed page
3. Check connection indicator (green = connected)
4. Open another tab/browser
5. Create a post
6. See it appear instantly in first tab

## Migration from WebSocket

If you have existing WebSocket code:

1. **Remove WebSocket server setup** from `server.ts`
2. **Replace** `useFeedSocket` with `useFeedSSE`
3. **Update** broadcast functions to use SSE
4. **Test** reconnection behavior

## Advantages in Production

1. **Proxy-friendly**: Works through corporate firewalls
2. **Simpler debugging**: Use curl to test
3. **Lower latency**: No WebSocket handshake
4. **Better scaling**: Stateless, easier to load balance
5. **Automatic recovery**: Built-in reconnection

## When to Consider WebSocket Instead

- Need bidirectional communication (e.g., chat)
- Binary data transfer required
- Sub-100ms latency critical
- Custom protocol needed

For feed updates, SSE is the clear winner! 🎉
