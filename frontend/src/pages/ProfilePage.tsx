
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Link,
  Github,
  Globe,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Edit,
} from 'lucide-react';
import ContributionHeatmap from '@/components/ContributionHeatmap';

const ProfilePage = () => {
  const techStack = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Docker', 'AWS', 'GraphQL'
  ];

  const badges = [
    { name: 'Open Source Contributor', icon: Github, color: 'default' },
    { name: '100+ Blog Posts', icon: Edit, color: 'secondary' },
    { name: 'Top Contributor', icon: Award, color: 'default' },
    { name: 'Community Builder', icon: Star, color: 'secondary' },
  ];

  const skills = [
    { name: 'React.js', endorsements: 23 },
    { name: 'TypeScript', endorsements: 18 },
    { name: 'Node.js', endorsements: 15 },
    { name: 'System Design', endorsements: 12 },
    { name: 'GraphQL', endorsements: 9 },
  ];

  const experience = [
    {
      title: 'Senior Frontend Engineer',
      company: 'TechCorp Inc.',
      period: '2022 - Present',
      type: 'work'
    },
    {
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      period: '2020 - 2022',
      type: 'work'
    },
    {
      title: 'Computer Science',
      company: 'University of Technology',
      period: '2016 - 2020',
      type: 'education'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="h-32 bg-gradient-to-r from-muted to-muted/50 rounded-t-lg relative">
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
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-4 md:mt-0">
              <h1 className="text-3xl font-bold">John Doe</h1>
              <p className="text-xl text-muted-foreground">Senior Frontend Engineer</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  San Francisco, CA
                </div>
                <div>1.2k followers</div>
                <div>850 following</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-muted-foreground leading-relaxed">
              Passionate full-stack developer with 6+ years of experience building scalable web applications. 
              Love contributing to open source and sharing knowledge through technical writing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" size="sm">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              Portfolio
            </Button>
            <Button variant="outline" size="sm">
              <Link className="h-4 w-4 mr-2" />
              LeetCode
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Tech Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contribution Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ContributionHeatmap />
            </CardContent>
          </Card>

          {/* Experience Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Experience & Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {experience.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {item.type === 'work' ? (
                        <Briefcase className="h-5 w-5" />
                      ) : (
                        <GraduationCap className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.company}</p>
                      <p className="text-sm text-muted-foreground">{item.period}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Top Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {skills.map((skill, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
