
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, 
  Reply, 
  ChevronDown, 
  ChevronUp,
  Heart,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Comment {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(new Set());

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: {
        name: 'Sarah Chen',
        username: '@sarahdev',
        avatar: 'SC'
      },
      content: 'Great article! I especially liked the section about state management. This approach has saved me countless hours of debugging.',
      timestamp: '2 hours ago',
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: '1-1',
          author: {
            name: 'Alex Rodriguez',
            username: '@alexcodes',
            avatar: 'AR'
          },
          content: 'Totally agree! The Redux Toolkit approach mentioned here is game-changing.',
          timestamp: '1 hour ago',
          likes: 5,
          isLiked: true,
          replies: []
        }
      ]
    },
    {
      id: '2',
      author: {
        name: 'Michael Brown',
        username: '@mikeb',
        avatar: 'MB'
      },
      content: 'Would love to see a follow-up post about testing strategies for this pattern.',
      timestamp: '3 hours ago',
      likes: 8,
      isLiked: false,
      replies: []
    }
  ]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'John Doe',
        username: '@johndoe',
        avatar: 'JD'
      },
      content: newComment,
      timestamp: 'just now',
      likes: 0,
      isLiked: false,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: {
        name: 'John Doe',
        username: '@johndoe',
        avatar: 'JD'
      },
      content: replyContent,
      timestamp: 'just now',
      likes: 0,
      isLiked: false,
      replies: []
    };

    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...comment.replies, reply] };
      }
      return comment;
    }));

    setReplyContent('');
    setReplyingTo(null);
  };

  const toggleThread = (commentId: string) => {
    const newCollapsed = new Set(collapsedThreads);
    if (newCollapsed.has(commentId)) {
      newCollapsed.delete(commentId);
    } else {
      newCollapsed.add(commentId);
    }
    setCollapsedThreads(newCollapsed);
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isCollapsed = collapsedThreads.has(comment.id);
    
    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {comment.author.avatar}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm">{comment.author.name}</span>
                  <span className="text-muted-foreground text-sm">{comment.author.username}</span>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground text-sm">{comment.timestamp}</span>
                </div>
                
                <p className="text-sm leading-relaxed mb-3">{comment.content}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`space-x-1 h-auto p-1 ${comment.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                    <span>{comment.likes}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="space-x-1 h-auto p-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="h-3 w-3" />
                    <span>Reply</span>
                  </Button>
                  
                  {comment.replies.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="space-x-1 h-auto p-1 text-muted-foreground hover:text-foreground"
                      onClick={() => toggleThread(comment.id)}
                    >
                      {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                      <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Report</DropdownMenuItem>
                      <DropdownMenuItem>Copy link</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reply Input */}
        {replyingTo === comment.id && (
          <div className="mb-4 ml-8">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-2"
              rows={3}
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                Submit Reply
              </Button>
              <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies.length > 0 && !isCollapsed && (
          <div className="space-y-0">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* New Comment Input */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-0">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
