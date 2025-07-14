
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Star, 
  Users, 
  PenTool, 
  Heart, 
  MessageCircle,
  Award,
  Crown
} from 'lucide-react';
import ContributionHeatmap from '@/components/ContributionHeatmap';

const badges = [
  { id: 1, title: 'First Post', description: 'Published your first blog post', icon: PenTool, earned: true },
  { id: 2, title: '100 Followers', description: 'Reached 100 followers', icon: Users, earned: true },
  { id: 3, title: 'Top Contributor', description: 'One of the most active contributors this month', icon: Star, earned: true },
  { id: 4, title: '1K Likes', description: 'Received 1000 likes on your posts', icon: Heart, earned: false },
  { id: 5, title: 'Community Leader', description: 'Helped 50+ developers with your content', icon: Crown, earned: false },
  { id: 6, title: 'Conversation Starter', description: 'Started 25 meaningful discussions', icon: MessageCircle, earned: true },
];

const leaderboards = {
  bloggers: [
    { rank: 1, name: 'Sarah Chen', username: '@sarahdev', posts: 47, avatar: 'SC' },
    { rank: 2, name: 'Alex Rodriguez', username: '@alexcodes', posts: 42, avatar: 'AR' },
    { rank: 3, name: 'John Doe', username: '@johndoe', posts: 38, avatar: 'JD' },
    { rank: 4, name: 'Emma Wilson', username: '@emmaw', posts: 35, avatar: 'EW' },
    { rank: 5, name: 'Michael Brown', username: '@mikeb', posts: 31, avatar: 'MB' },
  ],
  active: [
    { rank: 1, name: 'David Kim', username: '@davidk', activity: 2847, avatar: 'DK' },
    { rank: 2, name: 'Lisa Zhang', username: '@lisaz', activity: 2654, avatar: 'LZ' },
    { rank: 3, name: 'Tom Wilson', username: '@tomw', activity: 2401, avatar: 'TW' },
    { rank: 4, name: 'Anna Garcia', username: '@annag', activity: 2298, avatar: 'AG' },
    { rank: 5, name: 'Ryan Lee', username: '@ryanl', activity: 2156, avatar: 'RL' },
  ],
  endorsed: [
    { rank: 1, name: 'Jennifer Davis', username: '@jendavis', endorsements: 143, avatar: 'JD' },
    { rank: 2, name: 'Mark Thompson', username: '@markt', endorsements: 127, avatar: 'MT' },
    { rank: 3, name: 'Sofia Martinez', username: '@sofiam', endorsements: 118, avatar: 'SM' },
    { rank: 4, name: 'Chris Johnson', username: '@chrisj', endorsements: 95, avatar: 'CJ' },
    { rank: 5, name: 'Rachel Green', username: '@rachelg', endorsements: 87, avatar: 'RG' },
  ],
};

const GamificationDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('bloggers');

  const LeaderboardItem = ({ user, metric }: { user: any; metric: string }) => (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-semibold">
          {user.rank}
        </div>
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
          {user.avatar}
        </div>
        <div>
          <div className="font-medium text-sm">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.username}</div>
        </div>
      </div>
      <div className="text-sm font-semibold">
        {user[metric]}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge) => {
              const IconComponent = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`group relative p-4 rounded-lg border text-center transition-all cursor-pointer ${
                    badge.earned 
                      ? 'bg-background border-border hover:shadow-md' 
                      : 'bg-muted/30 border-muted opacity-60'
                  }`}
                >
                  <IconComponent className={`h-6 w-6 mx-auto mb-2 ${
                    badge.earned ? 'text-foreground' : 'text-muted-foreground'
                  }`} />
                  <h4 className={`text-xs font-semibold mb-1 ${
                    badge.earned ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {badge.title}
                  </h4>
                  {badge.earned && (
                    <Badge variant="secondary" className="text-xs">
                      Earned
                    </Badge>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {badge.description}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contribution Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ContributionHeatmap />
        </CardContent>
      </Card>

      {/* Leaderboards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Community Leaderboards</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bloggers">Top Bloggers</TabsTrigger>
              <TabsTrigger value="active">Most Active</TabsTrigger>
              <TabsTrigger value="endorsed">Most Endorsed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bloggers" className="mt-4">
              <div className="space-y-1">
                {leaderboards.bloggers.map((user) => (
                  <LeaderboardItem key={user.rank} user={user} metric="posts" />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="mt-4">
              <div className="space-y-1">
                {leaderboards.active.map((user) => (
                  <LeaderboardItem key={user.rank} user={user} metric="activity" />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="endorsed" className="mt-4">
              <div className="space-y-1">
                {leaderboards.endorsed.map((user) => (
                  <LeaderboardItem key={user.rank} user={user} metric="endorsements" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationDashboard;
