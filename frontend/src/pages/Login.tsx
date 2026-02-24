import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Code2, Eye, EyeOff, Github, Chrome, Apple, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      navigate('/feed');
    }, 1000);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background auth-page-transition">
      {/* Left Side: Image Background */}
      <div className="hidden lg:flex relative items-center justify-center p-12 overflow-hidden">
        <img 
          src="/bg_img/Gemini_Generated_Image_qx0c69qx0c69qx0c.png" 
          alt="DevConnect Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 text-center space-y-4 bg-black/40 backdrop-blur-sm p-8 rounded-2xl">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Code2 className="h-12 w-12 text-white" />
            <span className="text-4xl font-bold tracking-tight text-white">DevConnect</span>
          </Link>
          <p className="text-xl text-white/90 max-w-sm mx-auto">
            The space where developers unite, build, and grow together.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="auth-card py-12">
        <div className="w-full max-w-[400px] mx-auto space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight">Welcome to DevConnect</h1>
            <p className="text-muted-foreground">
              New here or coming back? Choose how you want to continue
            </p>
          </div>

          <div className="space-y-4">
            {/* Social Authentication */}
            <Button variant="outline" className="w-full h-12 text-base font-medium transition-all hover:bg-accent flex items-center justify-center gap-2 group ripple-effect">
              <Chrome className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full h-12 text-base font-medium transition-all hover:bg-accent flex items-center justify-center gap-2 group ripple-effect">
              <Apple className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Continue with Apple
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* "Other options" Toggle */}
            <div className="space-y-4">
              <button 
                onClick={() => setShowOtherOptions(!showOtherOptions)}
                className="flex items-center justify-center gap-1 w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Other options
                {showOtherOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showOtherOptions && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Button variant="outline" className="w-full h-12 text-base font-medium transition-all hover:bg-accent flex items-center justify-center gap-2 group ripple-effect">
                    <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    Continue with Github
                  </Button>

                  <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="samlee.mobbin@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 text-base pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium ripple-effect" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Continue"}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {!showOtherOptions && (
              <form onSubmit={(e) => {
                e.preventDefault();
                setShowOtherOptions(true);
              }} className="space-y-4">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  required
                />
                <Button type="submit" className="w-full h-12 text-base font-medium ripple-effect">
                  Continue
                </Button>
              </form>
            )}
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-foreground hover:underline font-semibold">
                Sign up for free
              </Link>
            </p>
            
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-loose">
              By signing in you agree to our <Link to="/terms" className="underline underline-offset-2">Terms of service</Link> & <Link to="/privacy" className="underline underline-offset-2">Privacy policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
