# Developer's Cave Backend Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Backend environment variables configured

## Installation Steps

### 1. Install Dependencies
```bash
cd backend
npm install socket.io @types/socket.io
```

### 2. Run Database Migration
```bash
npx prisma migrate dev --name add_developers_cave
npx prisma generate
```

### 3. Seed Default Chat Rooms (Optional)
The migration automatically creates 4 default rooms:
- #frontend-devs
- #backend
- #ai-ml
- #system-design

### 4. Environment Variables
Ensure your `.env` file has:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/devconnect"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 5. Start the Server
```bash
npm run dev
```

The server will start on:
- HTTP: `http://localhost:3001`
- WebSocket: `ws://localhost:3001`

## API Endpoints

### Focus Sessions
- `POST /api/cave/focus/start` - Start a focus session
- `PUT /api/cave/focus/:sessionId/complete` - Complete a session
- `GET /api/cave/focus/sessions` - Get user's focus history

### Tasks
- `POST /api/cave/tasks` - Create a task
- `GET /api/cave/tasks` - Get all tasks (query: ?status=TODO)
- `PUT /api/cave/tasks/:taskId` - Update a task
- `DELETE /api/cave/tasks/:taskId` - Delete a task

### Notes
- `POST /api/cave/notes` - Create a note
- `GET /api/cave/notes` - Get all notes
- `PUT /api/cave/notes/:noteId` - Update a note
- `DELETE /api/cave/notes/:noteId` - Delete a note

### Chat Rooms
- `GET /api/cave/chat/rooms` - Get all rooms
- `POST /api/cave/chat/rooms` - Create a new room
- `POST /api/cave/chat/rooms/:roomId/join` - Join a room
- `GET /api/cave/chat/rooms/:roomId/messages` - Get messages (query: ?limit=50&before=timestamp)

### Trends
- `GET /api/cave/trends/articles` - Get articles (query: ?tag=AI&sort=trending&limit=20)
- `POST /api/cave/trends/articles/:articleId/bookmark` - Toggle bookmark
- `POST /api/cave/trends/articles/:articleId/read` - Increment read count

### Reputation
- `GET /api/cave/reputation` - Get user's reputation

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3001/cave', {
  auth: { token: 'your-jwt-token' }
});
```

### Chat Events

**Client → Server:**
- `join_room` - Join a chat room
  ```javascript
  socket.emit('join_room', roomId);
  ```

- `leave_room` - Leave a chat room
  ```javascript
  socket.emit('leave_room', roomId);
  ```

- `send_message` - Send a message
  ```javascript
  socket.emit('send_message', { roomId, content });
  ```

- `typing_start` - Start typing indicator
  ```javascript
  socket.emit('typing_start', roomId);
  ```

- `typing_stop` - Stop typing indicator
  ```javascript
  socket.emit('typing_stop', roomId);
  ```

- `mark_read` - Mark messages as read
  ```javascript
  socket.emit('mark_read', { roomId });
  ```

**Server → Client:**
- `new_message` - New message received
  ```javascript
  socket.on('new_message', (message) => {
    // message includes user data
  });
  ```

- `user_joined` - User joined room
  ```javascript
  socket.on('user_joined', ({ userId, username, timestamp }) => {});
  ```

- `user_left` - User left room
  ```javascript
  socket.on('user_left', ({ userId, username, timestamp }) => {});
  ```

- `room_stats` - Room statistics update
  ```javascript
  socket.on('room_stats', ({ onlineCount }) => {});
  ```

- `user_typing` - User is typing
  ```javascript
  socket.on('user_typing', ({ userId, username }) => {});
  ```

- `user_stopped_typing` - User stopped typing
  ```javascript
  socket.on('user_stopped_typing', ({ userId }) => {});
  ```

### Focus Events

**Client → Server:**
- `focus_started` - Notify focus session started
  ```javascript
  socket.emit('focus_started', { sessionId, duration });
  ```

- `focus_completed` - Notify focus session completed
  ```javascript
  socket.emit('focus_completed', { sessionId });
  ```

**Server → Client:**
- `user_focusing` - Another user started focusing
  ```javascript
  socket.on('user_focusing', ({ userId, username, duration }) => {});
  ```

- `user_completed_focus` - Another user completed focus
  ```javascript
  socket.on('user_completed_focus', ({ userId, username }) => {});
  ```

## Database Schema

### CaveFocusSession
- Tracks user focus sessions
- Calculates streaks
- Awards reputation points

### CaveTask
- User's daily tasks
- Priority levels: LOW, MEDIUM, HIGH
- Status: TODO, IN_PROGRESS, COMPLETED

### CaveNote
- User's notes
- Simple title + content

### CaveChatRoom
- Chat rooms (default + custom)
- Tracks members and messages

### CaveRoomMember
- Room membership
- Last read timestamp

### CaveChatMessage
- Chat messages
- Includes user info

### CaveTrendArticle
- Tech articles
- Read and bookmark counts
- Tags for filtering

### CaveArticleBookmark
- User bookmarks
- Many-to-many relationship

### CaveReputation
- User reputation points
- Level (Explorer → Builder → Architect → System Master)
- Focus streak tracking
- Badges array

## Reputation System

### Points Earned:
- Complete focus session: 10 points
- Complete task: 5 points
- Send chat message: 1 point
- Bookmark article: 2 points

### Levels:
- Explorer: 0-500 points
- Builder: 501-1000 points
- Architect: 1001-2000 points
- System Master: 2001+ points

### Badges:
- Early Adopter: Reach 100 points
- Focused: 7-day focus streak
- Speed Demon: (Future)
- Streak Master: (Future)

## Testing

### Test Focus Session
```bash
curl -X POST http://localhost:3001/api/cave/focus/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "POMODORO", "duration": 1500}'
```

### Test Task Creation
```bash
curl -X POST http://localhost:3001/api/cave/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "priority": "HIGH"}'
```

### Test Room Creation
```bash
curl -X POST http://localhost:3001/api/cave/chat/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "react-hooks", "description": "React Hooks discussion"}'
```

## Troubleshooting

### Migration Fails
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or manually run migration
npx prisma db push
```

### WebSocket Connection Issues
- Check CORS settings in server.ts
- Verify JWT token is valid
- Check firewall/network settings

### Database Connection Issues
- Verify DATABASE_URL in .env
- Ensure PostgreSQL is running
- Check database credentials

## Production Considerations

1. **Environment Variables**: Use secure secrets
2. **Database**: Use connection pooling
3. **WebSocket**: Consider Redis adapter for scaling
4. **Rate Limiting**: Add rate limits to API endpoints
5. **Monitoring**: Add logging and error tracking
6. **Backup**: Regular database backups

## Next Steps

1. Install dependencies
2. Run migrations
3. Start server
4. Test API endpoints
5. Test WebSocket connection
6. Integrate with frontend
