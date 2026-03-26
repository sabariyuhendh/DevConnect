import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Send,
  Code,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Heading,
  Table,
  FileCode,
  Smile
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessageContent from './MessageContent';

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  placeholder = 'Type a message...',
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Trigger typing indicator
    if (onTyping) {
      onTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      setShowPreview(false);
      if (onTyping) onTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end) || placeholder;
    const newText = message.substring(0, start) + before + selectedText + after + message.substring(end);
    
    setMessage(newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatButtons = [
    {
      icon: <Bold className="h-4 w-4" />,
      label: 'Bold',
      action: () => insertMarkdown('**', '**', 'bold text')
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: 'Italic',
      action: () => insertMarkdown('*', '*', 'italic text')
    },
    {
      icon: <Code className="h-4 w-4" />,
      label: 'Inline Code',
      action: () => insertMarkdown('`', '`', 'code')
    },
    {
      icon: <FileCode className="h-4 w-4" />,
      label: 'Code Block',
      action: () => insertMarkdown('```javascript\n', '\n```', 'your code here')
    },
    {
      icon: <Heading className="h-4 w-4" />,
      label: 'Heading',
      action: () => insertMarkdown('## ', '', 'Heading')
    },
    {
      icon: <Quote className="h-4 w-4" />,
      label: 'Quote',
      action: () => insertMarkdown('> ', '', 'quote')
    },
    {
      icon: <List className="h-4 w-4" />,
      label: 'Bullet List',
      action: () => insertMarkdown('- ', '', 'list item')
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: 'Numbered List',
      action: () => insertMarkdown('1. ', '', 'list item')
    },
    {
      icon: <LinkIcon className="h-4 w-4" />,
      label: 'Link',
      action: () => insertMarkdown('[', '](url)', 'link text')
    },
    {
      icon: <Table className="h-4 w-4" />,
      label: 'Table',
      action: () => insertMarkdown('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', '')
    }
  ];

  const codeSnippets = [
    { label: 'JavaScript', value: '```javascript\n\n```' },
    { label: 'Python', value: '```python\n\n```' },
    { label: 'TypeScript', value: '```typescript\n\n```' },
    { label: 'HTML', value: '```html\n\n```' },
    { label: 'CSS', value: '```css\n\n```' },
    { label: 'SQL', value: '```sql\n\n```' },
    { label: 'Bash', value: '```bash\n\n```' },
    { label: 'JSON', value: '```json\n\n```' }
  ];

  return (
    <div className="border-t bg-background p-4">
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        {formatButtons.map((btn, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="sm"
            onClick={btn.action}
            disabled={disabled}
            title={btn.label}
            className="h-8 w-8 p-0"
          >
            {btn.icon}
          </Button>
        ))}
        
        {/* Code Snippet Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              title="Insert Code Snippet"
              className="h-8 px-2"
            >
              <FileCode className="h-4 w-4 mr-1" />
              <span className="text-xs">Code</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid gap-1">
              {codeSnippets.map((snippet) => (
                <Button
                  key={snippet.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs"
                  onClick={() => {
                    insertMarkdown(snippet.value.replace('\n\n```', '\n'), '```', '');
                  }}
                >
                  {snippet.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        {/* Preview Toggle */}
        <Button
          variant={showPreview ? "default" : "ghost"}
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          disabled={disabled || !message.trim()}
          className="h-8 px-3 text-xs"
        >
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* Input Area with Tabs */}
      <Tabs value={showPreview ? 'preview' : 'write'} className="w-full">
        <TabsContent value="write" className="mt-0">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[100px] max-h-[300px] resize-none focus-visible:ring-1"
            rows={4}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div className="min-h-[100px] max-h-[300px] overflow-y-auto border rounded-md p-3 bg-muted/30">
            {message.trim() ? (
              <MessageContent content={message} />
            ) : (
              <p className="text-muted-foreground text-sm">Nothing to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Send Button and Help */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-muted-foreground">
          <span className="hidden sm:inline">Supports Markdown • </span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> to send, 
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ml-1">Shift+Enter</kbd> for new line
        </div>
        
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="sm"
          className="ml-2"
        >
          <Send className="h-4 w-4 mr-1" />
          Send
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
