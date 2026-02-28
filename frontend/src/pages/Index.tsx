import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  ArrowRight,
  MessageSquare,
  Fingerprint,
  Network,
  Check,
  Hash,
  Circle,
  Send
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Alex Morgan',
      time: '10:42 AM',
      content: 'Just pushed the new API endpoints. Performance improvements are solid 🚀',
      tag: 'feat: optimize query #429',
      avatar: 'from-blue-400 to-blue-600'
    },
    {
      id: 2,
      user: 'Sarah Chen',
      time: '10:45 AM',
      content: 'On it! I\'ll take a look in a few minutes. Great work on reducing that latency.',
      avatar: 'from-purple-400 to-purple-600'
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        user: 'You',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        content: message,
        avatar: 'from-pink-400 to-pink-600'
      }]);
      setMessage('');
    }
  };
  const features = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Structured Conversations",
      description: "Move beyond fleeting chats. Engage in threaded, categorized discussions that preserve context indefinitely."
    },
    {
      icon: <Fingerprint className="h-5 w-5" />,
      title: "Developer Identity",
      description: "Showcase your actual contributions, stack expertise, and GitHub portfolio, not just a job title."
    },
    {
      icon: <Network className="h-5 w-5" />,
      title: "Purposeful Networking",
      description: "Connect with peers based on shared technical interests and project goals, not random algorithms."
    }
  ];

  const comparisonData = [
    {
      feature: "Content Feed",
      traditional: "Infinite scrolling noise",
      devconnect: "Curated discussions"
    },
    {
      feature: "Interaction",
      traditional: "Likes and fleeting comments",
      devconnect: "Structured replies"
    },
    {
      feature: "Primary Goal",
      traditional: "Ad revenue & metrics",
      devconnect: "Knowledge sharing"
    },
    {
      feature: "Privacy",
      traditional: "Data harvesting",
      devconnect: "Developer first"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-['Inter']">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section - Full Screen */}
        <section className="relative px-4 sm:px-6 min-h-[calc(100vh-4rem)] flex items-center overflow-hidden py-12 sm:py-0">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-radial from-primary/10 to-transparent pointer-events-none -z-10 blur-3xl opacity-50" />
          
          <div className="mx-auto max-w-[1200px] w-full">
            <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20 items-center">
              {/* Left Content */}
              <div className="flex flex-col items-start gap-6 sm:gap-8 max-w-xl">
                <div className="flex flex-col gap-4 sm:gap-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-normal tracking-tight leading-[1.1] sm:leading-[1.05]">
                    Built for <span className="bg-gradient-to-br from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent">Developers</span>.<br />
                    Designed for <span className="text-muted-foreground">Focus.</span>
                  </h1>
                  <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-light max-w-md tracking-wide">
                    A distraction-free environment for developers to collaborate, share knowledge, and ship code faster.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
                  <Button asChild size="lg" className="group rounded-full px-6 shadow-[0_1px_10px_rgba(94,106,210,0.4)] hover:shadow-[0_4px_20px_rgba(94,106,210,0.5)] transition-all w-full sm:w-auto">
                    <Link to="/signup">
                      Join DevConnect
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-6 w-full sm:w-auto" asChild>
                    <Link to="/feed">Explore Community</Link>
                  </Button>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-medium text-muted-foreground pt-2 sm:pt-4 opacity-80">
                  <div className="flex -space-x-2">
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full ring-2 ring-background bg-gradient-to-br from-blue-400 to-blue-600" />
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full ring-2 ring-background bg-gradient-to-br from-purple-400 to-purple-600" />
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full ring-2 ring-background bg-gradient-to-br from-pink-400 to-pink-600" />
                  </div>
                  <p className="tracking-wide uppercase">JOINED BY 2,000+ DEVELOPERS</p>
                </div>
              </div>

              {/* Right Content - Interactive Chat Preview */}
              <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[460px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-blue-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 blur-[80px]" />
                
                <div className="relative w-full max-w-[580px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl transform transition-transform duration-700 hover:scale-[1.02] hover:-translate-y-2">
                  {/* Window Controls */}
                  <div className="flex items-center justify-between border-b border-border bg-muted/50 p-2 sm:p-3">
                    <div className="flex gap-1 sm:gap-1.5 pl-1">
                      <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-muted-foreground/20" />
                      <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-muted-foreground/20" />
                      <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-muted-foreground/20" />
                    </div>
                    <div className="w-10" />
                  </div>

                  <div className="flex h-[300px] sm:h-[350px] lg:h-[380px]">
                    {/* Sidebar - Hidden on mobile */}
                    <div className="hidden sm:flex w-48 md:w-56 flex-col border-r border-border bg-muted/30">
                      <div className="p-2 md:p-3">
                        <div className="mb-4 md:mb-5 flex flex-col gap-0.5">
                          <div className="px-2 py-1.5 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Channels
                          </div>
                          <div className="flex cursor-pointer items-center gap-2 rounded-md bg-background shadow-sm ring-1 ring-border px-2 py-1.5 text-[12px] md:text-[13px] font-medium">
                            <Hash className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
                            general
                          </div>
                          <div className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12px] md:text-[13px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                            <Hash className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            announcements
                          </div>
                          <div className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12px] md:text-[13px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                            <Hash className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            engineering
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-2">
                          <div className="px-2 py-1.5 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Direct Messages
                          </div>
                          <div className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12px] md:text-[13px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                            <Circle className="h-1.5 w-1.5 fill-green-500 text-green-500" />
                            Sarah Chen
                          </div>
                          <div className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12px] md:text-[13px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                            <Circle className="h-1.5 w-1.5 fill-muted-foreground text-muted-foreground" />
                            Mike Ross
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex flex-1 flex-col bg-card">
                      <div className="flex items-center justify-between border-b border-border px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                          <span className="text-[12px] sm:text-[13px] font-semibold">general</span>
                        </div>
                        <div className="flex -space-x-1">
                          <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full ring-2 ring-card bg-indigo-500/20" />
                          <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full ring-2 ring-card bg-purple-500/20" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-3 sm:space-y-5 overflow-y-auto p-3 sm:p-5 scrollbar-thin scrollbar-thumb-border">
                        {messages.map((msg) => (
                          <div key={msg.id} className="group flex gap-2 sm:gap-3">
                            <div className={`h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 rounded-lg bg-gradient-to-br ${msg.avatar}`} />
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[12px] sm:text-[13px] font-semibold truncate">{msg.user}</span>
                                <span className="text-[10px] sm:text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">{msg.time}</span>
                              </div>
                              <div className="text-[12px] sm:text-[13px] leading-relaxed text-muted-foreground break-words">
                                {msg.content}
                              </div>
                              {msg.tag && (
                                <div className="mt-1 sm:mt-2 inline-flex items-center gap-2 rounded border border-border bg-muted/50 px-2 py-1 w-fit">
                                  <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground truncate">{msg.tag}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-2 sm:p-3">
                        <form onSubmit={handleSendMessage} className="relative">
                          <input
                            className="w-full rounded-md border border-border bg-muted px-3 py-2 pr-10 text-[12px] sm:text-[13px] placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Message #general"
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="border-t border-border py-8 sm:py-12 bg-muted/30 font-['Inter']">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
            <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground mb-6 sm:mb-8 uppercase tracking-widest">
              Trusted by builders at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-6 sm:gap-y-8 opacity-50 transition-opacity duration-500 hover:opacity-70">
              <span className="text-base sm:text-lg font-bold tracking-tighter">Acme Inc.</span>
              <span className="text-base sm:text-lg font-bold tracking-tighter">Globex</span>
              <span className="text-base sm:text-lg font-bold tracking-tighter">Soylent</span>
              <span className="text-base sm:text-lg font-bold tracking-tighter">Initech</span>
              <span className="text-base sm:text-lg font-bold tracking-tighter">Umbrella</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 py-16 sm:py-24 lg:py-32 font-['Inter']">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-border bg-card/50 p-6 sm:p-8 transition-all duration-500 hover:bg-card"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-transparent opacity-50" />
                  <div className="relative z-10">
                    <div className="mb-6 sm:mb-8 inline-flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground">
                      {feature.icon}
                    </div>
                    <h3 className="text-[16px] sm:text-[17px] font-medium mb-2">{feature.title}</h3>
                    <p className="text-[13px] sm:text-[14px] text-muted-foreground leading-relaxed font-normal">
                      {feature.description}
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-primary/10 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="relative border-t border-border bg-muted/30 px-4 sm:px-6 py-16 sm:py-24 lg:py-32 font-['Inter']">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-12 sm:mb-16 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight mb-3 sm:mb-4">
                Not Another Social Network
              </h2>
              <p className="text-[14px] sm:text-[16px] text-muted-foreground font-light">
                See why thousands of developers are making the switch.
              </p>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="grid grid-cols-12 border-b border-border px-3 sm:px-4 py-3 sm:py-4 text-[11px] sm:text-[13px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                    <div className="col-span-4 pl-1 sm:pl-2">Feature</div>
                    <div className="col-span-4 opacity-60">Traditional</div>
                    <div className="col-span-4 text-primary">DevConnect</div>
                  </div>

                  {comparisonData.map((row, index) => (
                    <div
                      key={index}
                      className="group grid grid-cols-12 items-center border-b border-border last:border-0 px-3 sm:px-4 py-4 sm:py-5 transition-colors hover:bg-muted/30"
                    >
                      <div className="col-span-4 flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
                        <span className="text-[13px] sm:text-[15px] font-medium">{row.feature}</span>
                      </div>
                      <div className="col-span-4 text-[12px] sm:text-[14px] text-muted-foreground font-light">
                        {row.traditional}
                      </div>
                      <div className="col-span-4 text-[12px] sm:text-[14px] font-medium flex items-center gap-1 sm:gap-2">
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                        <span className="truncate">{row.devconnect}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 py-16 sm:py-24 lg:py-32 font-['Inter']">
          <div className="mx-auto max-w-2xl text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-medium tracking-tight mb-4 sm:mb-6">
              Ready for focused collaboration?
            </h2>
            <p className="text-[14px] sm:text-[16px] text-muted-foreground mb-8 sm:mb-10 font-light max-w-lg mx-auto px-4">
              Join the community built for meaningful developer interactions. Open source, free forever for individuals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Button asChild size="lg" className="rounded-full px-8 shadow-[0_0_20px_rgba(94,106,210,0.3)] w-full sm:w-auto">
                <Link to="/signup">Get Started for Free</Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8 w-full sm:w-auto" asChild>
                <Link to="/feed">View Documentation</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
