import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Upload,
  X,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { validateGitHubUrl, validateLinkedInUrl, validateWebsiteUrl } from '@/utils/urlValidation';

interface Skill {
  id: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience?: number;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'connections' | 'private';
  emailVisibility: 'public' | 'connections' | 'private';
  phoneVisibility: 'connections' | 'private';
  onlineStatusVisible: boolean;
  allowConnectionRequests: boolean;
}

const ProfileManagement = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'experience' | 'privacy'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'skill' | 'experience'; id: string } | null>(null);

  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Full Stack Developer passionate about building scalable applications',
    location: 'San Francisco, CA',
    title: 'Senior Full Stack Developer',
    profilePicture: 'JD',
    coverPicture: null as string | null,
    github: 'https://github.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    website: 'https://johndoe.dev',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567'
  });

  // Skills
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'React', proficiency: 'expert', yearsExperience: 5 },
    { id: '2', name: 'TypeScript', proficiency: 'advanced', yearsExperience: 4 },
    { id: '3', name: 'Node.js', proficiency: 'advanced', yearsExperience: 6 }
  ]);

  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'intermediate' as const });

  // Experience
  const [experience, setExperience] = useState<Experience[]>([
    {
      id: '1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      description: 'Led development of microservices architecture',
      startDate: '2021-01',
      endDate: undefined,
      isCurrent: true
    },
    {
      id: '2',
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      description: 'Built and maintained full stack applications',
      startDate: '2019-06',
      endDate: '2020-12',
      isCurrent: false
    }
  ]);

  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    emailVisibility: 'connections',
    phoneVisibility: 'private',
    onlineStatusVisible: true,
    allowConnectionRequests: true
  });

  // URL validation errors
  const [urlErrors, setUrlErrors] = useState<{
    github?: string;
    linkedin?: string;
    website?: string;
  }>({});

  // Handle profile input change
  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Validate URLs on change
    if (field === 'github') {
      const result = validateGitHubUrl(value);
      setUrlErrors(prev => ({
        ...prev,
        github: result.isValid ? undefined : result.error
      }));
    } else if (field === 'linkedin') {
      const result = validateLinkedInUrl(value);
      setUrlErrors(prev => ({
        ...prev,
        linkedin: result.isValid ? undefined : result.error
      }));
    } else if (field === 'website') {
      const result = validateWebsiteUrl(value);
      setUrlErrors(prev => ({
        ...prev,
        website: result.isValid ? undefined : result.error
      }));
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log('Profile picture uploaded:', file.name);
        // In a real app, upload to server
      };
      reader.readAsDataURL(file);
    }
  };

  // Add skill
  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setSkills([...skills, {
        id: Date.now().toString(),
        name: newSkill.name,
        proficiency: newSkill.proficiency as any,
        yearsExperience: 0
      }]);
      setNewSkill({ name: '', proficiency: 'intermediate' });
    }
  };

  // Update skill
  const handleUpdateSkill = (id: string, field: string, value: any) => {
    setSkills(skills.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Delete skill
  const handleDeleteSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
    setShowDeleteDialog(false);
  };

  // Add experience
  const handleAddExperience = () => {
    if (newExperience.company.trim() && newExperience.position.trim()) {
      setExperience([...experience, {
        id: Date.now().toString(),
        ...newExperience
      }]);
      setNewExperience({
        company: '',
        position: '',
        description: '',
        startDate: '',
        endDate: '',
        isCurrent: false
      });
    }
  };

  // Update experience
  const handleUpdateExperience = (id: string, field: string, value: any) => {
    setExperience(experience.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // Delete experience
  const handleDeleteExperience = (id: string) => {
    setExperience(experience.filter(e => e.id !== id));
    setShowDeleteDialog(false);
  };

  // Save profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Profile Management</h1>
          <p className="text-muted-foreground">Manage your professional profile and settings</p>
        </div>

        {/* Save Success Message */}
        {saveSuccess && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950">
            <CardContent className="p-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">Profile saved successfully!</span>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Profile Picture</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0">
                    {profileData.profilePicture}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Picture
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Basic Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">First Name</label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Last Name</label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Professional Title</label>
                  <Input
                    value={profileData.title}
                    onChange={(e) => handleProfileChange('title', e.target.value)}
                    placeholder="e.g., Senior Full Stack Developer"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Bio</label>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </label>
                    <Input
                      value={profileData.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Social Links</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </label>
                  <Input
                    value={profileData.github}
                    onChange={(e) => handleProfileChange('github', e.target.value)}
                    placeholder="https://github.com/username"
                    className={urlErrors.github ? 'border-destructive' : ''}
                  />
                  {urlErrors.github && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      {urlErrors.github}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </label>
                  <Input
                    value={profileData.linkedin}
                    onChange={(e) => handleProfileChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className={urlErrors.linkedin ? 'border-destructive' : ''}
                  />
                  {urlErrors.linkedin && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      {urlErrors.linkedin}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </label>
                  <Input
                    value={profileData.website}
                    onChange={(e) => handleProfileChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className={urlErrors.website ? 'border-destructive' : ''}
                  />
                  {urlErrors.website && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      {urlErrors.website}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Add New Skill</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    placeholder="Skill name (e.g., React)"
                  />
                  <Select value={newSkill.proficiency} onValueChange={(value: any) => setNewSkill({ ...newSkill, proficiency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddSkill} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Skill
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Skills List */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Your Skills</h3>
              </CardHeader>
              <CardContent>
                {skills.length > 0 ? (
                  <div className="space-y-3">
                    {skills.map(skill => (
                      <div key={skill.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{skill.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {skill.proficiency}
                            </Badge>
                          </div>
                          {skill.yearsExperience && (
                            <p className="text-xs text-muted-foreground">
                              {skill.yearsExperience} years experience
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteTarget({ type: 'skill', id: skill.id });
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills added yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Add New Experience</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    placeholder="Company name"
                  />
                  <Input
                    value={newExperience.position}
                    onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                    placeholder="Position"
                  />
                </div>

                <Textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                  placeholder="Description of your role and achievements"
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Start Date</label>
                    <Input
                      type="month"
                      value={newExperience.startDate}
                      onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">End Date</label>
                    <Input
                      type="month"
                      value={newExperience.endDate}
                      onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                      disabled={newExperience.isCurrent}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={newExperience.isCurrent}
                    onChange={(e) => setNewExperience({ ...newExperience, isCurrent: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isCurrent" className="text-sm font-medium cursor-pointer">
                    I currently work here
                  </label>
                </div>

                <Button onClick={handleAddExperience} className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Experience
                </Button>
              </CardContent>
            </Card>

            {/* Experience List */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Your Experience</h3>
              </CardHeader>
              <CardContent>
                {experience.length > 0 ? (
                  <div className="space-y-4">
                    {experience.map(exp => (
                      <div key={exp.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{exp.position}</h4>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeleteTarget({ type: 'experience', id: exp.id });
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        {exp.description && (
                          <p className="text-sm text-muted-foreground mb-2">{exp.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No experience added yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Privacy Settings</h3>
                <CardDescription>Control who can see your profile and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Profile Visibility</label>
                  <Select value={privacySettings.profileVisibility} onValueChange={(value: any) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Everyone can see</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                      <SelectItem value="private">Private - Only you</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email Visibility</label>
                  <Select value={privacySettings.emailVisibility} onValueChange={(value: any) => setPrivacySettings({ ...privacySettings, emailVisibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Visibility</label>
                  <Select value={privacySettings.phoneVisibility} onValueChange={(value: any) => setPrivacySettings({ ...privacySettings, phoneVisibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="connections">Connections Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    {privacySettings.onlineStatusVisible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">Show Online Status</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.onlineStatusVisible}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, onlineStatusVisible: e.target.checked })}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm font-medium">Allow Connection Requests</span>
                  <input
                    type="checkbox"
                    checked={privacySettings.allowConnectionRequests}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, allowConnectionRequests: e.target.checked })}
                    className="rounded"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline">Cancel</Button>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deleteTarget?.type === 'skill' ? 'Skill' : 'Experience'}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Are you sure you want to delete this {deleteTarget?.type}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteTarget?.type === 'skill') {
                    handleDeleteSkill(deleteTarget.id);
                  } else {
                    handleDeleteExperience(deleteTarget!.id);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProfileManagement;
