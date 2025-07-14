
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Users, 
  Briefcase, 
  Calendar,
  Star,
  ArrowRight,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Professional Networking",
      description: "Connect with developers worldwide and build meaningful professional relationships."
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "Knowledge Sharing",
      description: "Share technical insights, code snippets, and learn from the community."
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Career Growth",
      description: "Discover opportunities, showcase projects, and advance your career."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Tech Events",
      description: "Join conferences, workshops, and meetups in your technology area."
    }
  ];

  const stats = [
    { label: "Active Developers", value: "10K+" },
    { label: "Posts Shared", value: "50K+" },
    { label: "Job Opportunities", value: "2K+" },
    { label: "Tech Events", value: "500+" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Frontend Developer",
      avatar: "SC",
      content: "DevConnect transformed my career. The quality of discussions and networking opportunities here are unmatched."
    },
    {
      name: "Marcus Johnson",
      role: "Full Stack Engineer",
      avatar: "MJ",
      content: "The most professional developer community I've found. Genuine connections and valuable technical insights."
    },
    {
      name: "Elena Rodriguez",
      role: "DevOps Engineer",
      avatar: "ER",
      content: "Finally, a platform built for developers by developers. Clean, focused, and incredibly valuable."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-8 text-xs font-medium px-3 py-1 bg-muted text-muted-foreground">
              Join 10,000+ developers worldwide
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-semibold text-foreground mb-8 tracking-tight">
              The Professional Network
              <br />
              <span className="text-foreground">Built for Developers</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect, learn, and grow with a community of passionate developers. 
              Share knowledge, discover opportunities, and build the future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="professional-button-primary text-base px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="professional-button-secondary text-base px-8 py-3 border-border hover:bg-accent" asChild>
                <Link to="/feed">Explore Community</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mb-6">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for the modern developer community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="professional-card p-6 text-center border-border bg-card">
                <CardContent className="p-0">
                  <div className="text-foreground mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="font-semibold mb-3 text-foreground text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mb-6">
              Trusted by Developers
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our community has to say
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="professional-card p-8 border-border bg-card">
                <CardContent className="p-0">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-semibold text-foreground mb-6">
            Ready to Join the Community?
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Start connecting with developers, sharing knowledge, and advancing your career today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="professional-button-primary text-base px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/signup">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="professional-button-secondary text-base px-8 py-3 border-border hover:bg-accent" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
