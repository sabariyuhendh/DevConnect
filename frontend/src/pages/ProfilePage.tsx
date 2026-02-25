import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Link as LinkIcon,
  Github,
  Globe,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Edit,
  Linkedin,
  Twitter,
  Mail,
} from 'lucide-react';
import ContributionHeatmap from '@/components/ContributionHeatmap';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to username route if user is authenticated
  useEffect(() => {
    const redirectToProfile = async () => {
      if (!isAuthenticated) return;

      if (user?.username) {
        navigate(`/u/${user.username}`, { replace: true });
      } else if (user?.token) {
        // Fetch user data to get username
        try {
          const res = await fetch(`${API_BASE}/api/profiles/me`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user?.username) {
              // Update user in context with username
              const updatedUser = { ...user, username: data.user.username };
              localStorage.setItem('dc_user', JSON.stringify(updatedUser));
              navigate(`/u/${data.user.username}`, { replace: true });
            }
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          toast({
            title: 'Profile Error',
            description: 'Unable to load profile. Please log in again.',
            variant: 'destructive'
          });
        }
      }
    };

    redirectToProfile();
  }, [isAuthenticated, user, navigate, toast]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/profiles/me`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        setProfileData(data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAuthenticated, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view your profile</p>
          <Button onClick={() => window.location.href = '/login'}>Log In</Button>
        </Card>
      </div>
    );
  }

  const profile = profileData || user;
  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || profile?.username || 'User';
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const techStack = profile?.skills || ['JavaScript', 'TypeScript', 'React', 'Node.js'];

  const badges = [
    { name: 'Open Source Contributor', icon: Github, color: 'default' },
    { name: 'Community Member', icon: Star, color: 'secondary' },
  ];

  const skills = (profile?.skills || []).slice(0, 5).map((skill: string) => ({
    name: skill,
    endorsements: 0
  }));

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="h-32 bg-gradient-to-r from-muted to-muted/50 rounded-t-lg relative">
          {profile?.coverPicture && (
            <img 
              src={profile.coverPicture} 
              alt="Cover" 
              className="w-full h-full object-cover rounded-t-lg"
            />
          )}
          <Button 
            size="sm" 
            className="absolute top-4 right-4"
            variant="secondary"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16 relative">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={profile?.profilePicture || '/placeholder.svg'} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-4 md:mt-0">
              <h1 className="text-3xl font-bold">{fullName}</h1>
              <p className="text-xl text-muted-foreground">
                {profile?.title || 'Developer'}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                {profile?.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                )}
                {profile?.company && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {profile.company}
                  </div>
                )}
                <div>{profileData?.followersCount || 0} followers</div>
                <div>{profileData?.followingCount || 0} following</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-muted-foreground leading-relaxed">
              {profile?.bio || 'No bio available yet. Click Edit Profile to add one!'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {profile?.github && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            {profile?.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
            {profile?.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
            {profile?.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </a>
              </Button>
            )}
            {profile?.email && (
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
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tech Stack */}
          {techStack.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech: string) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contribution Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ContributionHeatmap />
            </CardContent>
          </Card>

          {/* Professional Info */}
          {(profile?.yearsOfExp || profile?.availability) && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.yearsOfExp && (
                  <div>
                    <p className="text-sm text-muted-foreground">Years of Experience</p>
                    <p className="text-lg font-semibold">{profile.yearsOfExp} years</p>
                  </div>
                )}
                {profile?.availability && (
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <Badge variant={profile.availability === 'available' ? 'default' : 'secondary'}>
                      {profile.availability.replace('-', ' ')}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Badges */}
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

          {/* Skills */}
          {skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skills.map((skill: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <span className="font-medium">{skill.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {skill.endorsements}
                        </span>
                        <Button size="sm" variant="outline">
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
                <p className="font-medium">@{profile?.username}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              {profile?.createdAt && (
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              )}
              {profileData?.profileViews !== undefined && (
                <div>
                  <p className="text-muted-foreground">Profile Views</p>
                  <p className="font-medium">{profileData.profileViews}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
