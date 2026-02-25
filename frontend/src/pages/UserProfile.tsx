import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ContributionHeatmap from '@/components/ContributionHeatmap';
import {
  MapPin,
  Briefcase,
  Link as LinkIcon,
  Github,
  Linkedin,
  Mail,
  Globe,
  UserPlus,
  UserMinus,
  Settings,
  Eye,
  Users,
  FileText,
  Loader2,
  Edit,
  Star,
  Award
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  title?: string;
  company?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  profilePicture?: string;
  coverPicture?: string;
  skills?: string[];
  isOnline: boolean;
  lastSeen?: string;
  profileViews: number;
  createdAt: string;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('dc_user') ? JSON.parse(localStorage.getItem('dc_user')!).token : null;
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE}/api/profiles/${username}`, { headers });
        
        if (!res.ok) {
          if (res.status === 404) {
            toast({
              title: 'User not found',
              description: `No user found with username @${username}`,
              variant: 'destructive'
            });
            navigate('/feed');
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        setProfile(data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, navigate, toast]);

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to follow users',
        variant: 'destructive'
      });
      return;
    }

    setFollowLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('dc_user')!).token;
      const method = profile?.isFollowing ? 'DELETE' : 'POST';
      
      const res = await fetch(`${API_BASE}/api/profiles/${username}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to update follow status');

      setProfile(prev => prev ? {
        ...prev,
        isFollowing: !prev.isFollowing,
        followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      } : null);

      toast({
        title: profile?.isFollowing ? 'Unfollowed' : 'Following',
        description: profile?.isFollowing 
          ? `You unfollowed @${username}` 
          : `You are now following @${username}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive'
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    return profile?.username?.slice(0, 2).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile?.username || 'User';
  };

  const badges = [
    { name: 'Open Source Contributor', icon: Github, color: 'default' },
    { name: 'Community Member', icon: Star, color: 'secondary' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <p className="text-muted-foreground mb-4">The user @{username} does not exist</p>
        <Button onClick={() => navigate('/feed')}>Go to Feed</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <div className="h-32 bg-gradient-to-r from-gray-400 to-gray-600 rounded-t-lg relative">
          {profile.coverPicture && (
            <img src={profile.coverPicture} alt="Cover" className="w-full h-full object-cover rounded-t-lg" />
          )}
          {isOwnProfile && (
            <Button 
              size="sm" 
              className="absolute top-4 right-4"
              variant="secondary"
              onClick={() => navigate('/settings')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16 relative">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={profile.profilePicture} alt={getDisplayName()} />
              <AvatarFallback className="text-2xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{getDisplayName()}</h1>
                {profile.isOnline && (
                  <div className="w-3 h-3 bg-green-500 rounded-full" title="Online" />
                )}
              </div>
              <p className="text-xl text-muted-foreground">
                {profile.title || 'Developer'}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {profile.company}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {profile.followersCount} followers
                </div>
                <div>{profile.followingCount} following</div>
              </div>
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button onClick={handleFollow} disabled={followLoading}>
                  {followLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : profile.isFollowing ? (
                    <UserMinus className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {profile.isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
                <Button variant="outline" onClick={() => navigate('/messages')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <p className="text-muted-foreground leading-relaxed">
              {profile.bio || 'No bio available yet.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {profile.github && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            {profile.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
            {profile.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
            {profile.email && isOwnProfile && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${profile.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tech Stack / Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ContributionHeatmap />
            </CardContent>
          </Card>

          {/* Posts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Posts ({profile.postsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No posts yet
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center p-3 rounded-lg border text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <badge.icon className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-xs font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Skills with Endorsements */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.skills.slice(0, 5).map((skill, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <span className="font-medium">{skill}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">0</span>
                        <Button size="sm" variant="outline" disabled={isOwnProfile}>
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Username</p>
                <p className="font-medium">@{profile.username}</p>
              </div>
              {isOwnProfile && (
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Profile Views</p>
                <p className="font-medium flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {profile.profileViews}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
