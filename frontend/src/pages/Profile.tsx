import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Github, 
  Linkedin, 
  Globe, 
  Trophy,
  Users,
  BookOpen,
  Settings,
  MessageSquare,
  UserPlus,
  Star,
  Eye,
  TrendingUp,
  Heart
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import ContributionHeatmap from '@/components/ContributionHeatmap';

const Profile = () => {
  const [isFollowing, setIsFollowing] = useState(false);

  const profile = {
    name: 'John Doe',
    username: '@johndoe',
    title: 'Senior Full Stack Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    joinDate: 'Joined March 2022',
    bio: 'Passionate full-stack developer with 8+ years of experience building scalable web applications. Love working with React, Node.js, and cloud technologies. Always eager to learn and share knowledge with the community.',
    followers: 1250,
    following: 432,
    posts: 89,
    profileViews: 2340,
    website: 'johndoe.dev',
    github: 'johndoe',
    linkedin: 'john-doe',
    skills: [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 
      'Docker', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Git'
    ],
    endorsements: {
      'JavaScript': 24,
      'React': 31,
      'Node.js': 18,
      'AWS': 12
    },
    achievements: [
      { name: 'Early Adopter', description: 'One of the first 1000 users', icon: '🌟' },
      { name: 'Content Creator', description: 'Published 50+ posts', icon: '✍️' },
      { name: 'Community Builder', description: '1000+ followers', icon: '👥' },
      { name: 'Open Source Contributor', description: '100+ contributions', icon: '🚀' }
    ]
  };

  const posts = [
    {
      id: '1',
      author: {
        name: 'John Doe',
        username: '@johndoe',
        avatar: 'JD',
        title: 'Senior Full Stack Developer at Tech Corp'
      },
      content: 'Just finished implementing a new microservices architecture for our payment system. The journey from monolith to microservices taught me so much about distributed systems...',
      timestamp: '1 day ago',
      likes: 89,
      comments: 12,
      shares: 5,
      tags: ['Microservices', 'Architecture', 'Backend'],
      readTime: '4 min read',
      isLiked: false,
      isBookmarked: true
    }
  ];

  const experience = [
    {
      title: 'Senior Full Stack Developer',
      company: 'Tech Corp',
      duration: '2022 - Present',
      location: 'San Francisco, CA',
      description: 'Leading development of scalable web applications serving 1M+ users. Built microservices architecture, improved performance by 40%.'
    },
    {
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      duration: '2020 - 2022',
      location: 'Remote',
      description: 'Developed MVP from scratch using React and Node.js. Implemented CI/CD pipelines and cloud infrastructure on AWS.'
    }
  ];

  const education = [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'Stanford University',
      duration: '2016 - 2020',
      location: 'Stanford, CA'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Cover Photo & Profile Header */}
        <div className="relative mb-8">
          <div className="h-48 lg:h-64 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 rounded-lg"></div>
          
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-background">
              JD
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button 
              variant={isFollowing ? "outline" : "default"} 
              size="sm"
              onClick={() => setIsFollowing(!isFollowing)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
                <p className="text-lg text-muted-foreground mb-2">{profile.title}</p>
                <p className="text-sm text-muted-foreground mb-4">{profile.company}</p>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {profile.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {profile.joinDate}
                  </div>
                </div>

                <div className="flex space-x-4 text-sm mb-4">
                  <div>
                    <span className="font-semibold">{profile.followers}</span>
                    <span className="text-muted-foreground ml-1">followers</span>
                  </div>
                  <div>
                    <span className="font-semibold">{profile.following}</span>
                    <span className="text-muted-foreground ml-1">following</span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-4">{profile.bio}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`https://${profile.website}`} className="text-primary hover:underline">
                      {profile.website}
                    </a>
                  </div>
                  <div className="flex items-center text-sm">
                    <Github className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`https://github.com/${profile.github}`} className="text-primary hover:underline">
                      github.com/{profile.github}
                    </a>
                  </div>
                  <div className="flex items-center text-sm">
                    <Linkedin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`https://linkedin.com/in/${profile.linkedin}`} className="text-primary hover:underline">
                      linkedin.com/in/{profile.linkedin}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Skills</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      {skill}
                      {profile.endorsements[skill] && (
                        <span className="ml-1 text-xs">+{profile.endorsements[skill]}</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-primary" />
                  Achievements
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-lg">{achievement.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{achievement.name}</div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Activity</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{profile.posts}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{profile.profileViews}</div>
                    <div className="text-xs text-muted-foreground">Profile Views</div>
                  </div>
                </div>
                <ContributionHeatmap />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="space-y-6 mt-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>
              
              <TabsContent value="about" className="space-y-6 mt-6">
                {/* Experience */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Experience</h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {experience.map((exp, index) => (
                      <div key={index} className="flex space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{exp.title}</h4>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">{exp.duration} • {exp.location}</p>
                          <p className="text-sm mt-2">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Education</h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {education.map((edu, index) => (
                      <div key={index} className="flex space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{edu.degree}</h4>
                          <p className="text-muted-foreground">{edu.school}</p>
                          <p className="text-sm text-muted-foreground">{edu.duration} • {edu.location}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Recent Activity</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 text-sm">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>Liked a post by <strong>Sarah Chen</strong></span>
                      <span className="text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span>Commented on <strong>"React Best Practices"</strong></span>
                      <span className="text-muted-foreground">5 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>Connected with <strong>Alex Thompson</strong></span>
                      <span className="text-muted-foreground">1 day ago</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
