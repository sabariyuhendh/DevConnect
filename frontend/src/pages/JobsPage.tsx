
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MapPin, 
  Clock, 
  Bookmark, 
  ExternalLink, 
  Building, 
  DollarSign,
  Plus,
  Filter
} from 'lucide-react';

const JobsPage = () => {
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      remote: true,
      salary: '$120k - $160k',
      posted: '2 days ago',
      logo: 'TC',
      tags: ['React', 'TypeScript', 'GraphQL'],
      description: 'We are looking for a Senior Frontend Engineer to join our growing team...'
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      type: 'Full-time',
      remote: false,
      salary: '$90k - $130k',
      posted: '1 week ago',
      logo: 'SX',
      tags: ['Node.js', 'React', 'MongoDB'],
      description: 'Join our fast-growing startup as a Full Stack Developer...'
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      company: 'CloudTech Solutions',
      location: 'Remote',
      type: 'Contract',
      remote: true,
      salary: '$70/hour',
      posted: '3 days ago',
      logo: 'CS',
      tags: ['AWS', 'Docker', 'Kubernetes'],
      description: 'We need an experienced DevOps Engineer to help scale our infrastructure...'
    },
    {
      id: 4,
      title: 'Mobile App Developer',
      company: 'InnovateMobile',
      location: 'Austin, TX',
      type: 'Full-time',
      remote: true,
      salary: '$100k - $140k',
      posted: '5 days ago',
      logo: 'IM',
      tags: ['React Native', 'iOS', 'Android'],
      description: 'Looking for a skilled Mobile App Developer to build cutting-edge applications...'
    }
  ];

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Job Board</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Post a Job
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                className="pl-10"
              />
            </div>
            <Input placeholder="Location" />
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option>Job Type</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Freelance</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {job.logo}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-muted-foreground">{job.company}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSaveJob(job.id)}
                >
                  <Bookmark 
                    className={`h-4 w-4 ${
                      savedJobs.includes(job.id) ? 'fill-current' : ''
                    }`} 
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {job.type}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {job.posted}
                  </div>
                </div>

                {job.remote && (
                  <Badge variant="secondary" className="w-fit">
                    Remote
                  </Badge>
                )}

                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{job.salary}</span>
                </div>

                <p className="text-sm text-muted-foreground">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button className="flex-1">
                    Apply Now
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Jobs
        </Button>
      </div>
    </div>
  );
};

export default JobsPage;
