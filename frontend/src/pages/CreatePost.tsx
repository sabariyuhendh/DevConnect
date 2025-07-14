
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bold, 
  Italic, 
  Code, 
  Link as LinkIcon, 
  Image, 
  Eye, 
  Save,
  Send,
  Hash,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim().toLowerCase())) {
      setTags([...tags, currentTag.trim().toLowerCase()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);
    
    const newContent = beforeText + before + selectedText + after + afterText;
    setContent(newContent);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleSave = (publish = false) => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing content",
        description: "Please add a title and content to your post.",
        variant: "destructive"
      });
      return;
    }

    setIsDraft(!publish);
    
    setTimeout(() => {
      toast({
        title: publish ? "Post published!" : "Draft saved!",
        description: publish 
          ? "Your post has been published and is now live." 
          : "Your draft has been saved and can be edited later.",
      });
      
      if (publish) {
        navigate('/feed');
      }
    }, 500);
  };

  const toolbarButtons = [
    { icon: <Bold className="h-4 w-4" />, action: () => insertText('**', '**'), title: 'Bold' },
    { icon: <Italic className="h-4 w-4" />, action: () => insertText('*', '*'), title: 'Italic' },
    { icon: <Code className="h-4 w-4" />, action: () => insertText('`', '`'), title: 'Inline Code' },
    { icon: <LinkIcon className="h-4 w-4" />, action: () => insertText('[', '](url)'), title: 'Link' },
  ];

  const codeBlockLanguages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'rust', 'go'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter your post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Content</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isPreview ? "outline" : "default"}
                    size="sm"
                    onClick={() => setIsPreview(false)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={isPreview ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPreview(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>

              {!isPreview && (
                <>
                  {/* Toolbar */}
                  <div className="flex items-center space-x-1 p-2 border rounded-t-md bg-muted/30">
                    {toolbarButtons.map((button, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={button.action}
                        title={button.title}
                      >
                        {button.icon}
                      </Button>
                    ))}
                    <div className="h-4 border-l mx-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertText('\n```javascript\n', '\n```\n')}
                      title="Code Block"
                    >
                      <Code className="h-4 w-4" />
                      Code Block
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertText('![alt text](', ')')}
                      title="Image"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>

                  <Textarea
                    id="content"
                    placeholder="Write your post content here... You can use Markdown formatting."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] font-mono rounded-t-none border-t-0"
                  />
                </>
              )}

              {isPreview && (
                <div className="min-h-[400px] p-4 border rounded-md bg-background">
                  <div className="prose prose-sm max-w-none">
                    {content ? (
                      <div className="whitespace-pre-wrap">{content}</div>
                    ) : (
                      <p className="text-muted-foreground italic">Nothing to preview yet. Write some content to see the preview.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tags"
                    placeholder="Add tags (press Enter or comma to add)"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10"
                  />
                </div>
                <Button onClick={addTag} size="sm">Add</Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {content.length} characters • ~{Math.ceil(content.split(' ').length / 200)} min read
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => handleSave(false)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={() => handleSave(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default CreatePost;
