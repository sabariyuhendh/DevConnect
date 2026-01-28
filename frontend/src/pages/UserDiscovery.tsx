import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  UserPlus,
  UserCheck,
  UserX,
  MoreVertical,
  MapPin,
  Briefcase,
  Link2,
  Github,
  Linkedin,
  Globe,
  Flag,
  Ban,
  MessageCircle,
  Filter,
  X,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  title?: string;
  skills?: string[];
  connections?: number;
  isConnected?: boolean;
  connectionStatus?: 'pending' | 'accepted' | 'declined' | 'blocked';
}

interface ConnectionRequest {
  id: string;
  fromUser: User;
  toUser: User;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

const UserDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'connections'>('discover');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  // Mock data for users
  const [users] = useState<User[]>([
    {
      id: '1',
      username: 'sarah_chen',
      firstName: 'Sarah',
      lastName: 'Chen',
      profilePicture: 'SC',
      bio: 'Senior Frontend Developer passionate about React and TypeScript',
      location: 'San Francisco, CA',
      title: 'Senior Frontend Developer at Meta',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      connections: 342,
      isConnected: false,
      connectionStatus: undefined
    },
    {
      id: '2',
      username: 'marcus_dev',
      firstName: 'Marcus',
      lastName: 'Rodriguez',
      profilePicture: 'MR',
      bio: 'Full Stack Engineer building scalable systems',
      location: 'New York, NY',
      title: 'Full Stack Engineer at Stripe',
      skills: ['Node.js', 'Python', 'AWS', 'Docker'],
      connections: 521,
      isConnected: true,
      connectionStatus: 'accepted'
    },
    {
      id: '3',
      username: 'alex_dev',
      firstName: 'Alex',
      lastName: 'Johnson',
      profilePicture: 'AJ',
      bio: 'DevOps enthusiast and cloud architect',
      location: 'Seattle, WA',
      title: 'DevOps Engineer at Amazon',
      skills: ['Kubernetes', 'AWS', 'Terraform', 'Go'],
      connections: 287,
      isConnected: false,
      connectionStatus: 'pending'
    },
    {
      id: '4',
      username: 'emma_code',
      firstName: 'Emma',
      lastName: 'Wilson',
      profilePicture: 'EW',
      bio: 'Mobile developer and open source contributor',
      location: 'Austin, TX',
      title: 'Mobile Developer at Apple',
      skills: ['Swift', 'React Native', 'iOS', 'Android'],
      connections: 198,
      isConnected: false,
      connectionStatus: undefined
    },
    {
      id: '5',
      username: 'david_ml',
      firstName: 'David',
      lastName: 'Miller',
      profilePicture: 'DM',
      bio: 'Machine Learning Engineer and AI researcher',
      location: 'Boston, MA',
      title: 'ML Engineer at Google',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
      connections: 412,
      isConnected: false,
      connectionStatus: undefined
    }
  ]);

  // Mock connection requests
  const [connectionRequests] = useState<ConnectionRequest[]>([
    {
      id: 'req1',
      fromUser: users[0],
      toUser: users[0],
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'req2',
      fromUser: users[2],
      toUser: users[2],
      status: 'pending',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery.trim() === '' || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilters = selectedFilters.length === 0 || 
      selectedFilters.some(filter => user.skills?.includes(filter));

    return matchesSearch && matchesFilters && !blockedUsers.has(user.id);
  });

  // Handle connection request
  const handleSendRequest = (userId: string) => {
    console.log('Sending connection request to:', userId);
    // API call would go here
  };

  // Handle accept connection request
  const handleAcceptRequest = (requestId: string) => {
    console.log('Accepting connection request:', requestId);
    // API call would go here
  };

  // Handle decline connection request
  const handleDeclineRequest = (requestId: string) => {
    console.log('Declining connection request:', requestId);
    // API call would go here
  };

  // Handle block user
  const handleBlockUser = (userId: string) => {
    setBlockedUsers(prev => new Set(prev).add(userId));
    console.log('Blocking user:', userId);
    // API call would go here
  };

  // Handle report user
  const handleReportUser = (userId: string) => {
    console.log('Reporting user:', userId);
    // API call would go here
  };

  // Handle message user
  const handleMessageUser = (userId: string) => {
    console.log('Opening message with user:', userId);
    // Navigate to messages page
  };

  // Get unique skills from all users
  const allSkills = Array.from(new Set(users.flatMap(u => u.skills || [])));

  const toggleFilter = (skill: string) => {
    setSelectedFilters(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Discover Developers</h1>
          <p className="text-muted-foreground">Find and connect with talented developers in your network</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, skills, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Filter Tags */}
          {showFilters && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Filter by Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map(skill => (
                      <Badge
                        key={skill}
                        variant={selectedFilters.includes(skill) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleFilter(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {selectedFilters.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFilters([])}
                      className="text-xs"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="mb-6">
          <TabsList>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {connectionRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {connectionRequests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-4">
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {/* User Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user.profilePicture}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleReportUser(user.id)}>
                              <Flag className="h-4 w-4 mr-2" />
                              Report User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBlockUser(user.id)} className="text-destructive">
                              <Ban className="h-4 w-4 mr-2" />
                              Block User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Title and Location */}
                      {user.title && (
                        <p className="text-xs font-medium text-foreground mb-1">{user.title}</p>
                      )}
                      {user.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          {user.location}
                        </div>
                      )}

                      {/* Bio */}
                      {user.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {user.bio}
                        </p>
                      )}

                      {/* Skills */}
                      {user.skills && user.skills.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {user.skills.slice(0, 3).map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {user.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{user.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Connections Count */}
                      <div className="text-xs text-muted-foreground mb-3">
                        {user.connections} connections
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {user.connectionStatus === 'accepted' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleMessageUser(user.id)}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="ghost" className="flex-1">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Connected
                            </Button>
                          </>
                        ) : user.connectionStatus === 'pending' ? (
                          <Button size="sm" variant="outline" className="w-full" disabled>
                            <Clock className="h-3 w-3 mr-1" />
                            Request Pending
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleSendRequest(user.id)}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No users found matching your search</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {connectionRequests.filter(r => r.status === 'pending').length > 0 ? (
              <div className="space-y-3">
                {connectionRequests.filter(r => r.status === 'pending').map(request => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {request.fromUser.profilePicture}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">
                              {request.fromUser.firstName} {request.fromUser.lastName}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Sent {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No pending connection requests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            {users.filter(u => u.connectionStatus === 'accepted').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.filter(u => u.connectionStatus === 'accepted').map(user => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.profilePicture}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">
                            {user.firstName} {user.lastName}
                          </h4>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                      {user.title && (
                        <p className="text-xs text-muted-foreground mb-2">{user.title}</p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleMessageUser(user.id)}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">You don't have any connections yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDiscovery;
