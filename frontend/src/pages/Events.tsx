
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Filter,
  Plus,
  Share2,
  ExternalLink,
  Video,
  Globe
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

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const events = [
    {
      id: '1',
      title: 'React Conference 2024',
      organizer: 'React Community',
      date: 'March 15, 2024',
      time: '9:00 AM - 6:00 PM',
      location: 'San Francisco, CA',
      type: 'Conference',
      format: 'In-person',
      price: 'Free',
      attendees: 1250,
      maxAttendees: 1500,
      description: 'Join us for the biggest React conference of the year! Learn about the latest features, best practices, and meet fellow React developers.',
      tags: ['React', 'Frontend', 'JavaScript', 'Web Development'],
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
      rsvpStatus: 'going',
      featured: true
    },
    {
      id: '2',
      title: 'AI/ML Developer Meetup',
      organizer: 'SF AI Developers',
      date: 'March 22, 2024',
      time: '6:00 PM - 9:00 PM',
      location: 'Online',
      type: 'Meetup',
      format: 'Virtual',
      price: 'Free',
      attendees: 342,
      maxAttendees: 500,
      description: 'Monthly meetup for AI and ML developers. This month we\'re discussing transformer models and their applications.',
      tags: ['AI', 'Machine Learning', 'Python', 'Data Science'],
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop',
      rsvpStatus: 'interested',
      featured: false
    },
    {
      id: '3',
      title: 'DevOps Best Practices Workshop',
      organizer: 'CloudNative Foundation',
      date: 'March 28, 2024',
      time: '10:00 AM - 4:00 PM',
      location: 'Austin, TX',
      type: 'Workshop',
      format: 'In-person',
      price: '$99',
      attendees: 89,
      maxAttendees: 150,
      description: 'Hands-on workshop covering modern DevOps practices, CI/CD pipelines, and cloud infrastructure.',
      tags: ['DevOps', 'CI/CD', 'Cloud', 'Kubernetes'],
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop',
      rsvpStatus: null,
      featured: false
    }
  ];

  const upcomingEvents = [
    { title: 'JavaScript Fundamentals', date: 'Apr 5', attendees: 45 },
    { title: 'GraphQL Deep Dive', date: 'Apr 12', attendees: 67 },
    { title: 'Python for Beginners', date: 'Apr 18', attendees: 89 },
    { title: 'Docker Workshop', date: 'Apr 25', attendees: 34 }
  ];

  const categories = [
    { name: 'Conferences', count: 12 },
    { name: 'Meetups', count: 28 },
    { name: 'Workshops', count: 15 },
    { name: 'Hackathons', count: 8 },
    { name: 'Webinars', count: 22 }
  ];

  const getRSVPButton = (status: string | null) => {
    switch (status) {
      case 'going':
        return (
          <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
            Going
          </Button>
        );
      case 'interested':
        return (
          <Button variant="outline" size="sm">
            Interested
          </Button>
        );
      default:
        return (
          <Button variant="outline" size="sm">
            RSVP
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Developer Events</h1>
            <p className="text-muted-foreground">Discover conferences, meetups, and workshops near you</p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
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
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="san-francisco">San Francisco</SelectItem>
                  <SelectItem value="new-york">New York</SelectItem>
                  <SelectItem value="austin">Austin</SelectItem>
                  <SelectItem value="seattle">Seattle</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Events List */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="attending">Attending</TabsTrigger>
                <TabsTrigger value="hosting">My Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-6 mt-6">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="md:flex">
                      <div className="md:w-48 h-48 md:h-auto bg-gradient-to-br from-blue-500 to-purple-600" />
                      
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {event.featured && (
                                <Badge className="bg-yellow-500 text-yellow-50">Featured</Badge>
                              )}
                              <Badge variant="outline">{event.type}</Badge>
                              <Badge variant="outline" className="flex items-center">
                                {event.format === 'Virtual' ? (
                                  <Video className="h-3 w-3 mr-1" />
                                ) : (
                                  <MapPin className="h-3 w-3 mr-1" />
                                )}
                                {event.format}
                              </Badge>
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                            <p className="text-muted-foreground mb-3">Organized by {event.organizer}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {event.date}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                {event.time}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {event.location}
                              </div>
                            </div>

                            <p className="text-sm mb-4 line-clamp-2">{event.description}</p>

                            <div className="flex flex-wrap gap-1 mb-4">
                              {event.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {event.attendees} / {event.maxAttendees} attending
                                </div>
                                <span className="font-medium text-primary">{event.price}</span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                {getRSVPButton(event.rsvpStatus)}
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="attending" className="space-y-6 mt-6">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground">Events you're attending will appear here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="hosting" className="space-y-6 mt-6">
                <div className="text-center py-12">
                  <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Create your first event</h3>
                  <p className="text-muted-foreground mb-4">Share your knowledge with the community</p>
                  <Button>Create Event</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between py-1 hover:bg-muted/50 rounded px-2 -mx-2 cursor-pointer transition-colors">
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between py-2 hover:bg-muted/50 rounded px-2 -mx-2 cursor-pointer transition-colors">
                    <div>
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{event.date}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.attendees} attending
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Create Event CTA */}
            <Card>
              <CardHeader>
                <CardTitle>Host an Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your expertise and connect with fellow developers by hosting an event.
                </p>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Events;
