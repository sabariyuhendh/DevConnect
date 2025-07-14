
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus } from 'lucide-react';

const SuggestedConnections = () => {
  const suggestions = [
    {
      name: 'Alex Thompson',
      title: 'Senior React Developer',
      avatar: 'AT',
      mutualConnections: 12,
      skills: ['React', 'TypeScript', 'Node.js']
    },
    {
      name: 'Maria Santos',
      title: 'DevOps Engineer',
      avatar: 'MS',
      mutualConnections: 8,
      skills: ['AWS', 'Docker', 'Kubernetes']
    },
    {
      name: 'David Kim',
      title: 'ML Engineer',
      avatar: 'DK',
      mutualConnections: 5,
      skills: ['Python', 'TensorFlow', 'PyTorch']
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Suggested Connections</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((person, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {person.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{person.name}</div>
                <div className="text-xs text-muted-foreground">{person.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {person.mutualConnections} mutual connections
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {person.skills.slice(0, 2).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs px-1.5 py-0.5">
                      {skill}
                    </Badge>
                  ))}
                  {person.skills.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      +{person.skills.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button size="sm" className="w-full">
              <UserPlus className="h-3 w-3 mr-2" />
              Connect
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SuggestedConnections;
