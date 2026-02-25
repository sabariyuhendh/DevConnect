
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Filter,
  Bookmark,
  ExternalLink,
  Users,
  Star
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const jobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechFlow Inc.',
      logo: 'TF',
      location: 'San Francisco, CA',
      type: 'Full-time',
      remote: true,
      salary: '$120k - $160k',
      experience: 'Senior',
      postedDate: '2 days ago',
      description: 'We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for building user-facing features using React, TypeScript, and modern web technologies.',
      skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'CSS'],
      benefits: ['Health Insurance', 'Remote Work', '401k', 'Stock Options'],
      applicants: 23,
      saved: false
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'DataViz Solutions',
      logo: 'DV',
      location: 'New York, NY',
      type: 'Full-time',
      remote: false,
      salary: '$100k - $140k',
      experience: 'Mid-level',
      postedDate: '1 week ago',
      description: 'Join our team to build data visualization tools that help businesses make better decisions. You will work with both frontend and backend technologies.',
      skills: ['Python', 'React', 'PostgreSQL', 'Docker', 'AWS'],
      benefits: ['Health Insurance', 'Flexible Hours', 'Learning Budget'],
      applicants: 45,
      saved: true
    },
    {
      id: '3',
      title: 'DevOps Engineer',
      company: 'CloudNative Corp',
      logo: 'CN',
      location: 'Austin, TX',
      type: 'Full-time',
      remote: true,
      salary: '$110k - $150k',
      experience: 'Senior',
      postedDate: '3 days ago',
      description: 'We need a DevOps Engineer to help us scale our infrastructure. You will work with Kubernetes, AWS, and CI/CD pipelines.',
      skills: ['Kubernetes', 'AWS', 'Docker', 'Terraform', 'Jenkins'],
      benefits: ['Health Insurance', 'Remote Work', 'Unlimited PTO'],
      applicants: 31,
      saved: false
    }
  ];

  const featuredCompanies = [
    { name: 'Google', logo: 'G', openings: 145 },
    { name: 'Microsoft', logo: 'M', openings: 89 },
    { name: 'Amazon', logo: 'A', openings: 234 },
    { name: 'Apple', logo: 'A', openings: 67 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Dream Developer Job</h1>
          <p className="text-muted-foreground">Discover opportunities at top tech companies</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs, skills, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="san-francisco">San Francisco</SelectItem>
                  <SelectItem value="new-york">New York</SelectItem>
                  <SelectItem value="austin">Austin</SelectItem>
                  <SelectItem value="seattle">Seattle</SelectItem>
                </SelectContent>
              </Select>

              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Job Listings */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Latest Opportunities</h2>
              <span className="text-muted-foreground">{jobs.length} jobs found</span>
            </div>

            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {job.logo}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          {job.remote && (
                            <Badge variant="secondary" className="text-xs">Remote</Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-2">{job.company}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.type}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary}
                          </div>
                        </div>

                        <p className="text-sm mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 5} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{job.postedDate}</span>
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {job.applicants} applicants
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Bookmark className={`h-4 w-4 ${job.saved ? 'fill-current' : ''}`} />
                            </Button>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button size="sm">
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="text-center">
              <Button variant="outline" size="lg">
                Load More Jobs
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Featured Companies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {featuredCompanies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                        {company.logo}
                      </div>
                      <span className="font-medium">{company.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {company.openings} jobs
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Job Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Job Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get notified when new jobs matching your preferences are posted.
                </p>
                <Button className="w-full">Create Alert</Button>
              </CardContent>
            </Card>

            {/* Salary Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Salary Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Frontend Developer</span>
                  <span className="font-medium">$95k - $145k</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Backend Developer</span>
                  <span className="font-medium">$100k - $150k</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>DevOps Engineer</span>
                  <span className="font-medium">$110k - $160k</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Data Scientist</span>
                  <span className="font-medium">$120k - $180k</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Jobs;
