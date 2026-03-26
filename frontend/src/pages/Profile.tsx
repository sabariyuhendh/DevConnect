import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Heart,
  Instagram,
  Twitter,
  Facebook,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import ContributionHeatmap from '@/components/ContributionHeatmap';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useFeed } from '@/hooks/useFeed';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { profile, loading, error, toggleFollow } = useProfile(username);
  const { posts, loading: postsLoading, fetchUserPosts } = useFeed();
  const [isMobile, setIsMobile] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch user's posts when profile loads
  useEffect(() => {
    if (profile?.id) {
      fetchUserPosts(profile.id);
    }
  }, [profile?.id, fetchUserPosts]);

  // If no username provided, redirect to current user's profile
  useEffect(() => {
    if (!username && currentUser?.username) {
      navigate(`/profile/${currentUser.username}`);
    }
  }, [username, currentUser, navigate]);

  const handleFollowToggle = async () => {
    setIsFollowLoading(true);
    try {
      await toggleFollow();
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Placeholder data for features not yet implemented
  const achievements = [
    { name: 'Early Adopter', description: 'One of the first 1000 users', icon: '🌟' },
    { name: 'Content Creator', description: 'Published 50+ posts', icon: '✍️' },
    { name: 'Community Builder', description: '1000+ followers', icon: '👥' },
    { name: 'Open Source Contributor', description: '100+ contributions', icon: '🚀' }
  ];

  const experience = [
    {
      title: profile?.title || 'Position',
      company: profile?.company || 'Company',
      duration: '2022 - Present',
      location: profile?.location || 'Location',
      description: 'Experience details will be available soon.'
    }
  ];

  const education = [
    {
      degree: 'Education details coming soon',
      school: 'University',
      duration: '2016 - 2020',
      location: 'Location'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = (firstName: string | null, lastName: string | null) => {
    return [firstName, lastName].filter(Boolean).join(' ') || 'User';
  };

  const isOwnProfile = currentUser?.username === username;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading profile...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="font-semibold mb-2">Profile Not Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error || 'The profile you are looking for does not exist.'}
              </p>
              <Button onClick={() => navigate('/')}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Mobile Profile Card Design */}
        {isMobile ? (
          <div className="max-w-md mx-auto mb-8">
            {/* Header with Logo and Email */}
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="text-sm text-muted-foreground">DevConnect</div>
              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                {profile.email || `@${profile.username}`}
              </div>
            </div>

            {/* Profile Card */}
            <Card className="overflow-hidden rounded-3xl shadow-2xl">
              {/* Cover Photo with Social Icons */}
              <div 
                className="relative h-64 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
                style={profile.coverPicture ? {
                  backgroundImage: `url(${profile.coverPicture})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : undefined}
              >
                <div className="absolute top-4 right-4 flex space-x-3">
                  {profile.github && (
                    <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Github className="h-4 w-4 text-white" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Twitter className="h-4 w-4 text-white" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Linkedin className="h-4 w-4 text-white" />
                    </a>
                  )}
                </div>
              </div>

              {/* Profile Picture Overlapping */}
              <div className="relative px-6 pb-6">
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt={getFullName(profile.firstName, profile.lastName)}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-xl">
                        <span className="font-mono">{getInitials(profile.firstName, profile.lastName)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="pt-16 text-center">
                  {/* Username with Verification */}
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <h1 className="text-2xl font-bold">{getFullName(profile.firstName, profile.lastName)}</h1>
                    {profile.isVerified && (
                      <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-500" />
                    )}
                  </div>

                  {/* Handle */}
                  <p className="text-muted-foreground mb-2">@{profile.username}</p>

                  {/* Title */}
                  {profile.title && (
                    <p className="text-sm text-muted-foreground mb-4">{profile.title}</p>
                  )}

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-sm leading-relaxed mb-6 px-2">
                      {profile.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex justify-center space-x-8 mb-6">
                    <div>
                      <div className="text-2xl font-bold">{formatNumber(profile.followingCount)}</div>
                      <div className="text-sm text-muted-foreground">Following</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{formatNumber(profile.followersCount)}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  {!isOwnProfile && (
                    <Button 
                      className="w-full max-w-xs rounded-full py-6 text-lg font-semibold"
                      variant={profile.isFollowing ? "outline" : "default"}
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                    >
                      {isFollowLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {profile.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Button 
                      className="w-full max-w-xs rounded-full py-6 text-lg font-semibold"
                      variant="outline"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="text-sm text-muted-foreground">DevConnect</div>
              <div className="text-sm text-muted-foreground">{formatJoinDate(profile.createdAt)}</div>
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <>
            {/* Cover Photo & Profile Header */}
            <div className="relative mb-8">
              <div 
                className="h-48 lg:h-64 rounded-lg bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600"
                style={profile.coverPicture ? {
                  backgroundImage: `url(${profile.coverPicture})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : undefined}
              ></div>
              
              <div className="absolute -bottom-16 left-8">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt={getFullName(profile.firstName, profile.lastName)}
                    className="w-32 h-32 rounded-full border-4 border-background object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-background">
                    {getInitials(profile.firstName, profile.lastName)}
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-4 right-4 flex space-x-2">
                {!isOwnProfile && (
                  <>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      variant={profile.isFollowing ? "outline" : "default"} 
                      size="sm"
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                    >
                      {isFollowLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {profile.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </>
                )}
                {isOwnProfile && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {!isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-2xl font-bold">{getFullName(profile.firstName, profile.lastName)}</h1>
                  {profile.isVerified && (
                    <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-500" />
                  )}
                </div>
                {profile.title && (
                  <p className="text-lg text-muted-foreground mb-2">{profile.title}</p>
                )}
                {profile.company && (
                  <p className="text-sm text-muted-foreground mb-4">{profile.company}</p>
                )}
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatJoinDate(profile.createdAt)}
                  </div>
                </div>

                <div className="flex space-x-4 text-sm mb-4">
                  <div>
                    <span className="font-semibold">{formatNumber(profile.followersCount)}</span>
                    <span className="text-muted-foreground ml-1">followers</span>
                  </div>
                  <div>
                    <span className="font-semibold">{formatNumber(profile.followingCount)}</span>
                    <span className="text-muted-foreground ml-1">following</span>
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-sm leading-relaxed mb-4">{profile.bio}</p>
                )}

                <div className="space-y-2">
                  {profile.website && (
                    <div className="flex items-center text-sm">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.github && (
                    <div className="flex items-center text-sm">
                      <Github className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        github.com/{profile.github}
                      </a>
                    </div>
                  )}
                  {profile.linkedin && (
                    <div className="flex items-center text-sm">
                      <Linkedin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        linkedin.com/in/{profile.linkedin}
                      </a>
                    </div>
                  )}
                  {profile.twitter && (
                    <div className="flex items-center text-sm">
                      <Twitter className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        twitter.com/{profile.twitter}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Skills</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                    <div className="text-2xl font-bold text-primary">{profile.postsCount}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(profile.profileViews)}</div>
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
        )}

        {/* Mobile Tabs Section */}
        {isMobile && (
          <div className="mt-8">
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

                {/* Social Links */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Connect</h3>
                  </CardHeader>
                  <CardContent className="space-y-2">
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
                        <div className="text-2xl font-bold text-primary">{formatNumber(profile.profileViews)}</div>
                        <div className="text-xs text-muted-foreground">Profile Views</div>
                      </div>
                    </div>
                    <ContributionHeatmap />
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
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
