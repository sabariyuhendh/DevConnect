
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  BookmarkPlus,
  MoreHorizontal,
  Clock,
  Bookmark
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    title: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  readTime: string;
  isLiked: boolean;
  isBookmarked: boolean;
  codeSnippet?: string;
  image?: string;
}

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Link to="/profile" className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                {post.author.avatar}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <Link to="/profile" className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                  {post.author.name}
                </Link>
                <span className="text-muted-foreground text-sm hidden sm:inline">
                  {post.author.username}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{post.author.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground flex-shrink-0">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">{post.timestamp}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Save post</DropdownMenuItem>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">{post.content}</p>
          </div>

          {/* Code Snippet */}
          {post.codeSnippet && (
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground whitespace-pre-wrap break-words">{post.codeSnippet}</pre>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Read Time */}
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {post.readTime}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`space-x-1 sm:space-x-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs sm:text-sm">{likes}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="space-x-1 sm:space-x-2 text-muted-foreground hover:text-primary">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{post.comments}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="space-x-1 sm:space-x-2 text-muted-foreground hover:text-primary">
                <Share2 className="h-4 w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">{post.shares}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={isBookmarked ? 'text-primary' : 'text-muted-foreground'}
            >
              {isBookmarked ? (
                <Bookmark className="h-4 w-4 fill-current" />
              ) : (
                <BookmarkPlus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
