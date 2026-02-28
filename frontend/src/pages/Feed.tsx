
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Plus,
  Send,
  Save,
  Bookmark,
  UserPlus,
  Loader2
} from 'lucide-react';
import TrendingTopics from '@/components/TrendingTopics';
import { useFeed } from '@/hooks/useFeed';
import { useFeedSSE } from '@/hooks/useFeedSSE';
import { useAuth } from '@/contexts/AuthContext';

const Feed = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const {
    posts,
    recommendations,
    loading,
    error,
    fetchFeed,
    fetchRecommendations,
    createPost,
    toggleLike,
    toggleBookmark,
    addPost,
    updatePostFromSocket,
    removePost
  } = useFeed();

  const { isConnected, onNewPost, onPostUpdate, onPostDelete } = useFeedSSE();

  // Load feed on mount and filter change
  useEffect(() => {
    fetchFeed(activeFilter);
  }, [activeFilter, fetchFeed]);

  // Load recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Setup real-time listeners
  useEffect(() => {
    onNewPost((post) => {
      console.log('🆕 New post from socket:', post.id);
      addPost(post);
    });

    onPostUpdate((post) => {
      console.log('📝 Post updated from socket:', post.id);
      updatePostFromSocket(post);
    });

    onPostDelete((postId) => {
      console.log('🗑️ Post deleted from socket:', postId);
      removePost(postId);
    });
  }, [onNewPost, onPostUpdate, onPostDelete, addPost, updatePostFromSocket, removePost]);

  const filters = [
    { id: 'all', label: 'All Posts', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'following', label: 'Following', icon: <Users className="h-4 w-4" /> },
  ];

  const handleCreatePost = async (isDraft: boolean = false) => {
    if (!newPostContent.trim()) return;

    setIsCreating(true);
    try {
      await createPost(newPostContent, [], [], isDraft);
      setNewPostContent('');
      setShowCreatePost(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Create Post */}
            {showCreatePost ? (
              <Card className="mb-6">
                <CardContent className="p-4 space-y-4">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreatePost(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreatePost(true)}
                      disabled={isCreating || !newPostContent.trim()}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleCreatePost(false)}
                      disabled={isCreating || !newPostContent.trim()}
                    >
                      {isCreating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Publish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setShowCreatePost(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Share your thoughts...
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Real-time indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isConnected ? 'Live updates (SSE)' : 'Connecting...'}
              </div>
              <div className="text-xs text-muted-foreground">
                {posts.length} posts
              </div>
            </div>

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
              {error ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-red-500 mb-4">⚠️</div>
                    <h3 className="font-semibold mb-2">Error loading feed</h3>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => fetchFeed(activeFilter)}>
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : loading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading posts...</p>
                  </CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No posts yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Be the first to share something with the community!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      {/* Author */}
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar>
                          <AvatarImage src={post.author.profilePicture} />
                          <AvatarFallback>
                            {post.author.firstName?.[0]}{post.author.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold">
                            {post.author.firstName} {post.author.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{post.author.username} · {formatDate(post.publishedAt)}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(post.id)}
                          className={post.isLiked ? 'text-red-500' : ''}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likeCount}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.commentCount}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          {post.shareCount}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(post.id)}
                          className={post.isBookmarked ? 'text-blue-500' : ''}
                        >
                          <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
            {/* Connection Recommendations */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Suggested Connections</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recommendations yet
                  </p>
                ) : (
                  recommendations.map((rec) => (
                    <div key={rec.id} className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={rec.profilePicture} />
                        <AvatarFallback>
                          {rec.firstName?.[0]}{rec.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">
                          {rec.firstName} {rec.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {rec.title || '@' + rec.username}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {rec.mutualConnections} mutual · {rec.sharedInterests} shared interests
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <TrendingTopics />
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Your Activity</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Posts this week</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profile views</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New connections</span>
                  <span className="font-medium">{recommendations.length}</span>
                </div>
                <Separator />
                <Button variant="outline" size="sm" className="w-full">
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
  );
};

export default Feed;
