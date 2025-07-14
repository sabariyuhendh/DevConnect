
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

const TrendingTopics = () => {
  const topics = [
    { name: 'React 18', posts: '2.3k posts', trend: '+12%' },
    { name: 'TypeScript', posts: '1.8k posts', trend: '+8%' },
    { name: 'Next.js', posts: '1.2k posts', trend: '+15%' },
    { name: 'AI/ML', posts: '980 posts', trend: '+25%' },
    { name: 'WebAssembly', posts: '432 posts', trend: '+18%' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Trending Topics</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {topics.map((topic, index) => (
          <div key={index} className="flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 cursor-pointer transition-colors">
            <div>
              <div className="font-medium text-sm">#{topic.name}</div>
              <div className="text-xs text-muted-foreground">{topic.posts}</div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {topic.trend}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;
