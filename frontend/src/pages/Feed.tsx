
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  BookmarkPlus,
  TrendingUp,
  Code,
  Users,
  Calendar,
  Filter,
  Plus
} from 'lucide-react';
import PostCard from '@/components/PostCard';
import TrendingTopics from '@/components/TrendingTopics';
import SuggestedConnections from '@/components/SuggestedConnections';

const Feed = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Posts', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'following', label: 'Following', icon: <Users className="h-4 w-4" /> },
    { id: 'code', label: 'Code & Tech', icon: <Code className="h-4 w-4" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="h-4 w-4" /> },
  ];

  const posts = [
    {
      id: '1',
      author: {
        name: 'Sarah Chen',
        username: '@sarah_codes',
        avatar: 'SC',
        title: 'Senior Frontend Developer at Meta'
      },
      content: 'Just shipped a new feature using React Server Components! The performance improvements are incredible. Here\'s what I learned during the implementation...',
      timestamp: '2 hours ago',
      likes: 124,
      comments: 18,
      shares: 7,
      tags: ['React', 'Performance', 'WebDev'],
      readTime: '3 min read',
      isLiked: false,
      isBookmarked: false
    },
    {
      id: '2',
      author: {
        name: 'Marcus Rodriguez',
        username: '@marcus_dev',
        avatar: 'MR',
        title: 'Full Stack Engineer at Stripe'
      },
      content: 'Built a real-time collaborative code editor using WebSockets and Monaco Editor. The architecture challenges were fascinating! Open sourcing it next week 🚀',
      timestamp: '4 hours ago',
      likes: 89,
      comments: 12,
      shares: 15,
      tags: ['WebSockets', 'Real-time', 'Open Source'],
      readTime: '5 min read',
      isLiked: true,
      isBookmarked: false,
      codeSnippet: `// WebSocket connection setup
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateEditor(data);
};`
    }
  ];

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Create Post Button */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <Button asChild className="w-full" size="lg">
                  <Link to="/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Share your thoughts...
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className="flex items-center gap-2"
                >
                  {filter.icon}
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Load More Posts
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
            <TrendingTopics />
            <SuggestedConnections />
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Your Activity</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Posts this week</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profile views</span>
                  <span className="font-medium">127</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New connections</span>
                  <span className="font-medium">8</span>
                </div>
                <Separator />
                <Button variant="outline" size="sm" className="w-full">
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
