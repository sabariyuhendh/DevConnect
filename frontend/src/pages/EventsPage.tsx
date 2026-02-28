import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Plus,
  Video,
  Globe,
  CalendarPlus
} from 'lucide-react';

const EventsPage = () => {
  const [rsvpEvents, setRsvpEvents] = useState<number[]>([]);

  const events = [
    {
      id: 1,
      title: 'React Conf 2024',
      host: 'React Team',
      hostAvatar: 'RT',
      date: 'March 15, 2024',
      time: '9:00 AM - 6:00 PM PST',
      location: 'San Francisco, CA',
      type: 'offline',
      attendees: 500,
      maxAttendees: 800,
      category: 'Conference',
      image: '/placeholder.svg',
      description: 'Join us for the biggest React conference of the year...',
      tags: ['React', 'JavaScript', 'Frontend']
    },
    {
      id: 2,
      title: 'TypeScript Deep Dive Workshop',
      host: 'DevEducation',
      hostAvatar: 'DE',
      date: 'March 20, 2024',
      time: '2:00 PM - 5:00 PM EST',
      location: 'Online',
      type: 'online',
      attendees: 150,
      maxAttendees: 200,
      category: 'Workshop',
      image: '/placeholder.svg',
      description: 'Master advanced TypeScript concepts in this hands-on workshop...',
      tags: ['TypeScript', 'Workshop', 'Advanced']
    },
    {
      id: 3,
      title: 'Local Developer Meetup',
      host: 'SF Dev Community',
      hostAvatar: 'SF',
      date: 'March 22, 2024',
      time: '7:00 PM - 9:00 PM PST',
      location: 'San Francisco, CA',
      type: 'offline',
      attendees: 45,
      maxAttendees: 60,
      category: 'Meetup',
      image: '/placeholder.svg',
      description: 'Monthly meetup for local developers to network and share ideas...',
      tags: ['Networking', 'Community', 'Local']
    },
    {
      id: 4,
      title: 'AI in Web Development Webinar',
      host: 'TechTalks',
      hostAvatar: 'TT',
      date: 'March 25, 2024',
      time: '11:00 AM - 12:30 PM EST',
      location: 'Online',
      type: 'online',
      attendees: 320,
      maxAttendees: 500,
      category: 'Webinar',
      image: '/placeholder.svg',
      description: 'Explore how AI is transforming web development workflows...',
      tags: ['AI', 'Machine Learning', 'Web Development']
    }
  ];

  const toggleRSVP = (eventId: number) => {
    setRsvpEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const getTypeIcon = (type: string) => {
    return type === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'online' ? 'bg-blue-500' : 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-10"
              />
            </div>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option>All Categories</option>
              <option>Conference</option>
              <option>Workshop</option>
              <option>Meetup</option>
              <option>Webinar</option>
            </select>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option>All Formats</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option>This Week</option>
              <option>This Month</option>
              <option>Next Month</option>
              <option>All Dates</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <div className="h-40 bg-gradient-to-r from-muted to-muted/50"></div>
              <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-white text-xs font-medium ${getTypeColor(event.type)}`}>
                <div className="flex items-center space-x-1">
                  {getTypeIcon(event.type)}
                  <span>{event.type === 'online' ? 'Online' : 'In-Person'}</span>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className="absolute top-3 right-3"
              >
                {event.category}
              </Badge>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{event.hostAvatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">by {event.host}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center">
                    {event.type === 'online' ? (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        {event.location}
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {event.attendees} / {event.maxAttendees} attendees
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    className="flex-1"
                    variant={rsvpEvents.includes(event.id) ? "secondary" : "default"}
                    onClick={() => toggleRSVP(event.id)}
                  >
                    {rsvpEvents.includes(event.id) ? 'Registered' : 'Register Now'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <CalendarPlus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Events
        </Button>
      </div>
    </div>
  );
};

export default EventsPage;
