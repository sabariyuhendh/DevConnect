
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  BookmarkPlus,
  MoreHorizontal,
  Clock,
  Eye,
  ArrowLeft,
  Send,
  ThumbsUp,
  Reply
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PostDetail = () => {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(124);
  const [comment, setComment] = useState('');

  const post = {
    id: '1',
    title: 'Building Scalable React Applications: A Deep Dive into Architecture Patterns',
    author: {
      name: 'Sarah Chen',
      username: '@sarah_codes',
      avatar: 'SC',
      title: 'Senior Frontend Developer at Meta',
      followers: 1250
    },
    content: `
# Building Scalable React Applications: A Deep Dive into Architecture Patterns

React has become the go-to library for building user interfaces, but as applications grow in complexity, maintaining clean and scalable architecture becomes crucial. In this post, I'll share some patterns and best practices I've learned from building large-scale React applications at Meta.

## Component Composition Over Inheritance

One of the most powerful patterns in React is composition. Instead of relying on inheritance, we can build complex UIs by composing smaller, focused components.

\`\`\`jsx
// Instead of a monolithic component
function UserProfile({ user, showBadge, showStats }) {
  return (
    <div>
      {/* Complex conditional rendering */}
    </div>
  );
}

// Use composition
function UserProfile({ user, children }) {
  return (
    <div className="user-profile">
      <UserAvatar user={user} />
      <UserName user={user} />
      {children}
    </div>
  );
}

// Usage
<UserProfile user={user}>
  <UserBadge badge={user.badge} />
  <UserStats stats={user.stats} />
</UserProfile>
\`\`\`

## State Management at Scale

For large applications, consider these state management patterns:

### 1. Local State First
Start with React's built-in state management (useState, useReducer) and only introduce external libraries when needed.

### 2. Context for Global State
Use React Context for truly global state that many components need access to.

### 3. Server State vs Client State
Distinguish between server state (data from APIs) and client state (UI state). Tools like React Query excel at managing server state.

## Performance Optimization Strategies

### Code Splitting
Implement route-based and component-based code splitting to reduce initial bundle size:

\`\`\`jsx
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
\`\`\`

### Memoization
Use React.memo, useMemo, and useCallback judiciously:

\`\`\`jsx
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => 
    expensiveCalculation(data), [data]
  );
  
  return <div>{processedData}</div>;
});
\`\`\`

## Testing Strategy

A solid testing strategy is crucial for scalable applications:

1. **Unit Tests**: Test individual components and utilities
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test critical user flows

## Conclusion

Building scalable React applications requires thoughtful architecture decisions. Focus on composition, proper state management, performance optimization, and comprehensive testing. These patterns have served us well at Meta, and I hope they help you in your projects too!

What patterns have you found most effective in your React applications? I'd love to hear your thoughts in the comments below.
    `,
    publishedAt: '2 hours ago',
    readTime: '8 min read',
    views: 2340,
    likes: 124,
    comments: 18,
    shares: 7,
    tags: ['React', 'Architecture', 'Performance', 'Best Practices'],
    isLiked: false,
    isBookmarked: false
  };

  const comments = [
    {
      id: '1',
      author: {
        name: 'Alex Thompson',
        avatar: 'AT',
        title: 'Senior React Developer'
      },
      content: 'Excellent breakdown! The composition pattern has been a game-changer in our team. One thing I\'d add is the importance of custom hooks for sharing stateful logic between components.',
      timestamp: '1 hour ago',
      likes: 12,
      replies: [
        {
          id: '1-1',
          author: {
            name: 'Sarah Chen',
            avatar: 'SC',
            title: 'Senior Frontend Developer at Meta'
          },
          content: 'Absolutely! Custom hooks are fantastic for encapsulating and reusing complex logic. I should have mentioned that - great addition!',
          timestamp: '45 min ago',
          likes: 5
        }
      ]
    },
    {
      id: '2',
      author: {
        name: 'Maria Rodriguez',
        avatar: 'MR',
        title: 'Full Stack Engineer'
      },
      content: 'The server state vs client state distinction is so important. React Query has definitely simplified our data fetching patterns. Do you have any thoughts on Zustand vs Context for client state?',
      timestamp: '30 min ago',
      likes: 8,
      replies: []
    }
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleComment = () => {
    if (comment.trim()) {
      console.log('Posting comment:', comment);
      setComment('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/feed">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Link>
        </Button>

        {/* Article Header */}
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {post.author.avatar}
                  </div>
                </Link>
                <div>
                  <div className="flex items-center space-x-2">
                    <Link to="/profile" className="font-semibold text-lg hover:text-primary transition-colors">
                      {post.author.name}
                    </Link>
                    <Badge variant="secondary">
                      {post.author.followers} followers
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{post.author.title}</p>
                </div>
              </div>
              
              <Button variant="outline">Follow</Button>
            </div>

            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {post.publishedAt}
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.views} views
              </div>
              <span>{post.readTime}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap">{post.content}</div>
            </div>
          </CardContent>
        </Card>

        {/* Article Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={handleLike}
                  className={`space-x-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likes}</span>
                </Button>
                
                <Button variant="ghost" className="space-x-2 text-muted-foreground hover:text-primary">
                  <MessageCircle className="h-5 w-5" />
                  <span>{post.comments}</span>
                </Button>
                
                <Button variant="ghost" className="space-x-2 text-muted-foreground hover:text-primary">
                  <Share2 className="h-5 w-5" />
                  <span>{post.shares}</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={handleBookmark}
                className={isBookmarked ? 'text-primary' : 'text-muted-foreground'}
              >
                <BookmarkPlus className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment */}
            <div className="space-y-4">
              <Textarea
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={handleComment} disabled={!comment.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>

            <Separator />

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {comment.author.avatar}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold">{comment.author.name}</span>
                        <span className="text-sm text-muted-foreground">{comment.author.title}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      
                      <p className="text-sm mb-3 leading-relaxed">{comment.content}</p>
                      
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2">
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="ml-10 flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {reply.author.avatar}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm">{reply.author.name}</span>
                          <span className="text-xs text-muted-foreground">{reply.author.title}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                        </div>
                        
                        <p className="text-sm mb-2 leading-relaxed">{reply.content}</p>
                        
                        <div className="flex items-center space-x-4">
                          <Button variant="ghost" size="sm" className="text-muted-foreground h-6 px-2 text-xs">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {reply.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground h-6 px-2 text-xs">
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default PostDetail;
