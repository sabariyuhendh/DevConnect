
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share, 
  MoreHorizontal,
  Clock,
  Eye,
  ThumbsUp,
  Award
} from 'lucide-react';

const PostDetailPage = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(42);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const reactions = [
    { emoji: '👍', count: 23, label: 'Like' },
    { emoji: '👏', count: 15, label: 'Clap' },
    { emoji: '💡', count: 8, label: 'Insightful' },
    { emoji: '🎉', count: 5, label: 'Celebrate' },
  ];

  const comments = [
    {
      id: 1,
      author: 'Sarah Chen',
      avatar: 'SC',
      content: 'Great article! This really helped me understand the concept better.',
      timestamp: '2 hours ago',
      likes: 3
    },
    {
      id: 2,
      author: 'Mike Johnson',
      avatar: 'MJ',
      content: 'Thanks for sharing this. Do you have any resources for diving deeper into this topic?',
      timestamp: '4 hours ago',
      likes: 1
    }
  ];

  return (
    <div className="space-y-6">
      {/* Post Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">John Doe</h3>
                <Badge variant="secondary" className="text-xs">
                  Pro
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Senior Frontend Engineer</span>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  5 min read
                </div>
                <span>•</span>
                <span>2 days ago</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-4">
            Building Scalable React Applications: A Complete Guide
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {['React', 'JavaScript', 'Web Development', 'Best Practices'].map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                1.2k views
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {likes} likes
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {comments.length} comments
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Post Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-lg text-muted-foreground mb-6">
              Learn how to build React applications that can scale from prototype to production 
              with thousands of users. This comprehensive guide covers architecture patterns, 
              performance optimization, and best practices.
            </p>

            <h2>Introduction</h2>
            <p>
              Building scalable React applications requires careful planning and adherence to 
              best practices. In this guide, we'll explore the key principles and patterns 
              that will help you create maintainable and performant applications.
            </p>

            <h2>Architecture Patterns</h2>
            <p>
              When building large React applications, choosing the right architecture pattern 
              is crucial. Here are some proven approaches:
            </p>

            <h3>Component Composition</h3>
            <p>
              React's component-based architecture shines when you compose small, 
              reusable components into larger features.
            </p>

            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
              <code>{`
function UserProfile({ user }) {
  return (
    <Card>
      <UserAvatar user={user} />
      <UserInfo user={user} />
      <UserActions user={user} />
    </Card>
  );
}
              `}</code>
            </pre>

            <h3>State Management</h3>
            <p>
              For complex applications, consider using dedicated state management solutions 
              like Redux Toolkit or Zustand to manage global state effectively.
            </p>

            <h2>Performance Optimization</h2>
            <p>
              Performance is critical for user experience. Here are key optimization techniques:
            </p>

            <ul>
              <li>Use React.memo for component memoization</li>
              <li>Implement lazy loading with React.Suspense</li>
              <li>Optimize bundle size with code splitting</li>
              <li>Use virtualization for long lists</li>
            </ul>

            <h2>Conclusion</h2>
            <p>
              Building scalable React applications is an iterative process. Start with 
              solid foundations, measure performance regularly, and refactor as your 
              application grows.
            </p>
          </div>

          {/* Reactions */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                {reactions.map((reaction, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-xs">{reaction.count}</span>
                  </Button>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  Like
                </Button>
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="flex-shrink-0">
                  <AvatarFallback>{comment.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold">{comment.author}</span>
                    <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm mb-2">{comment.content}</p>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex space-x-3">
              <Avatar className="flex-shrink-0">
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full p-3 border rounded-md resize-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm">Post Comment</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetailPage;
