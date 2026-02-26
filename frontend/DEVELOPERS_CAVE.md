# Developer's Cave 🏔️

A focused productivity and community environment inside DevConnect featuring an immersive developer-themed background with animated gradients and grid patterns, combining structured deep work tools, topic-based chat, tech intelligence, and developer engagement.

## Access

Navigate to `/cave` or click "Developer's Cave" in the main navigation.

## Theme & Design

Developer's Cave uses a unique immersive theme:
- **Background**: Deep blue gradient (#0a0e27 → #16213e → #0f3460) with animated color orbs
- **Grid pattern**: Subtle orange grid overlay for a code editor feel
- **Glass-morphism panels**: Frosted glass effect with backdrop blur
- **Primary color**: Vibrant orange (#FF5722) for focus and energy
- **Dark/Light mode**: Fully supports both themes
- **Resizable modules**: All components can be resized from corners and edges
- **Draggable modules**: All components can be repositioned freely

## New Features

### Resizable Modules
- Drag from the bottom-right corner to resize diagonally
- Drag from the right edge to resize horizontally
- Drag from the bottom edge to resize vertically
- Minimum size constraints prevent modules from becoming too small
- Resize indicator in bottom-right corner

### Create Custom Chat Rooms
- Click the # (hash) icon in the chat module header
- Enter a room name (# prefix is added automatically)
- Press Enter or click the checkmark to create
- New room is immediately available in the dropdown
- Switch between rooms seamlessly

## Features

### 1. Focus System ⏱️
- Pomodoro timer (25/5/15 minute intervals)
- Deep work session tracking
- Pause/Resume/Reset controls
- Visual timer display

### 2. Micro Task Dock ✅
- Daily priority tasks (limit 3)
- Task completion tracking
- Progress visualization
- Filter and priority management

### 3. Topic-Based Chat Rooms 💬
- Multiple topic rooms (#frontend-devs, #backend, #ai-ml, #system-design)
- **Create custom rooms**: Click # icon to add new rooms
- Real-time messaging
- Room switching
- Online member indicators
- Dynamic room management

### 4. Tech Trends & Intelligence Feed 📈
- Trending articles
- Tag-based filtering
- Bookmark functionality
- Read tracking
- AI-generated summaries

### 5. Developer Meme Wall 😄
- Meme of the Day
- Upload capability
- Upvote/Comment system
- Trending/Latest sorting

### 6. Reputation & Contribution System 🏆
- Points tracking
- Level progression (Explorer → Builder → Architect → System Master)
- Badges and achievements
- Focus streak tracking
- Leaderboard ranking

### 7. Soundboard 🎵
- Master volume control
- Ambient sounds (Delta Waves, Rain, Cafe, Keyboard)
- Individual volume controls
- Focus-enhancing audio

### 8. Live Activity Indicators 📊
- Developers online count
- Tasks completed today
- Real-time platform activity

## Module System

All modules are:
- **Draggable**: Click and drag the header to reposition
- **Resizable**: Drag corners or edges to resize (with minimum size constraints)
- **Closable**: Click the X button to hide
- **Toggleable**: Use the sidebar menu to show/hide modules
- **Independent**: Each module operates independently
- **Responsive**: Content adapts to module size changes

## Design Philosophy

Developer's Cave is:
- NOT a chat app
- NOT a task app
- NOT a news feed
- NOT a meme page

It's a **unified developer workspace hub** where work, learning, and discussion happen in one controlled environment.

## Technical Implementation

- Built with React + TypeScript
- Uses shadcn/ui components
- Follows DevConnect theme system
- Fully responsive drag-and-drop
- State management with React hooks
- Protected route (requires authentication)

## Usage Tips

1. **Start a Focus Session**: Open the Focus module and start a Pomodoro timer
2. **Add Daily Tasks**: Use the Micro Tasks module to track your top 3 priorities
3. **Join or Create Discussions**: Switch between topic rooms or create your own with the # button
4. **Resize for Comfort**: Drag module edges to adjust size for your workflow
5. **Stay Updated**: Browse trending articles in the Tech Trends module
6. **Take Breaks**: Check out memes or adjust your soundboard
7. **Track Progress**: Monitor your reputation and streaks
8. **Customize Layout**: Arrange and resize modules to create your perfect workspace

## Future Enhancements

- WebSocket integration for real-time chat
- Backend API integration for persistence
- Save module positions and sizes to localStorage
- More ambient sounds
- Notification system
- Custom module layouts (save/load presets)
- Mobile optimization
- Keyboard shortcuts
- Room management (delete, rename)
- User presence indicators
- Message history
- File sharing in chat
