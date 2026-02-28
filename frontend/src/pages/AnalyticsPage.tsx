
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Users,
  Activity,
  Target
} from 'lucide-react';
import ContributionHeatmap from '@/components/ContributionHeatmap';

const AnalyticsPage = () => {
  const overviewStats = [
    {
      title: 'Total Views',
      value: '12.4K',
      change: '+12%',
      trend: 'up',
      icon: Eye
    },
    {
      title: 'Engagement Rate',
      value: '8.2%',
      change: '+3.1%',
      trend: 'up',
      icon: Activity
    },
    {
      title: 'Followers',
      value: '1.2K',
      change: '+24',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Posts Published',
      value: '28',
      change: '+4',
      trend: 'up',
      icon: Target
    }
  ];

  const viewsData = [
    { month: 'Jan', views: 1200 },
    { month: 'Feb', views: 1900 },
    { month: 'Mar', views: 1600 },
    { month: 'Apr', views: 2400 },
    { month: 'May', views: 2100 },
    { month: 'Jun', views: 2800 }
  ];

  const engagementData = [
    { date: '2024-01-01', likes: 45, comments: 12, bookmarks: 8 },
    { date: '2024-01-02', likes: 52, comments: 18, bookmarks: 15 },
    { date: '2024-01-03', likes: 38, comments: 9, bookmarks: 6 },
    { date: '2024-01-04', likes: 67, comments: 24, bookmarks: 19 },
    { date: '2024-01-05', likes: 43, comments: 14, bookmarks: 11 },
    { date: '2024-01-06', likes: 59, comments: 21, bookmarks: 16 },
    { date: '2024-01-07', likes: 71, comments: 28, bookmarks: 23 }
  ];

  const topPosts = [
    {
      title: 'Building Scalable React Applications',
      views: 2400,
      likes: 156,
      comments: 32,
      bookmarks: 89,
      publishDate: '2 days ago'
    },
    {
      title: 'TypeScript Best Practices for Large Projects',
      views: 1800,
      likes: 124,
      comments: 28,
      bookmarks: 67,
      publishDate: '1 week ago'
    },
    {
      title: 'Getting Started with GraphQL',
      views: 1600,
      likes: 98,
      comments: 21,
      bookmarks: 45,
      publishDate: '2 weeks ago'
    },
    {
      title: 'Modern CSS Techniques Every Developer Should Know',
      views: 1400,
      likes: 87,
      comments: 19,
      bookmarks: 38,
      publishDate: '3 weeks ago'
    },
    {
      title: 'Docker for Frontend Developers',
      views: 1200,
      likes: 76,
      comments: 15,
      bookmarks: 32,
      publishDate: '1 month ago'
    }
  ];

  const audienceData = [
    { name: 'Frontend Developers', value: 45, color: '#8884d8' },
    { name: 'Full Stack Developers', value: 30, color: '#82ca9d' },
    { name: 'Backend Developers', value: 15, color: '#ffc658' },
    { name: 'DevOps Engineers', value: 10, color: '#ff7c7c' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <Badge variant="outline">Last 30 days</Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-full">
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Bar dataKey="likes" fill="#8884d8" />
                <Bar dataKey="comments" fill="#82ca9d" />
                <Bar dataKey="bookmarks" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Posts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{post.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.views}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments}
                      </div>
                      <div className="flex items-center">
                        <Bookmark className="h-4 w-4 mr-1" />
                        {post.bookmarks}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{post.publishDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audience Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Audience Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={audienceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {audienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {audienceData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span>{entry.name}</span>
                  </div>
                  <span className="font-medium">{entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <ContributionHeatmap />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
