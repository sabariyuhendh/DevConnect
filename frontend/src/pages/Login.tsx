import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Code2, Eye, EyeOff, Github, Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE, apiRequest } from '@/config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/feed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login...');
      console.log('📍 API Base:', API_BASE);
      
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      console.log('✅ Login successful');

      // Store token separately for API requests
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      // Store user data in context
      const userData = {
        id: data.user?.id,
        email: data.user?.email,
        username: data.user?.username,
        firstName: data.user?.firstName,
        lastName: data.user?.lastName,
        profilePicture: data.user?.profilePicture,
        token: data.token
      };

      setUser(userData);

      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      
      // Redirect to the page they were trying to access or /feed
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      toast({
        title: "Login failed",
        description: err.message || 'Unable to login. Please check your credentials.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight">Welcome to DevConnect</h1>
            <p className="text-muted-foreground">
              Sign in to continue to your account
            </p>
          </div>

          {/* Debug Info */}
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            API: {API_BASE}
          </div>

          <div className="space-y-4">
            {/* Social Authentication */}
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium transition-all hover:bg-accent flex items-center justify-center gap-2 group ripple-effect"
              disabled
            >
              <Chrome className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Continue with Google (Coming Soon)
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium transition-all hover:bg-accent flex items-center justify-center gap-2 group ripple-effect"
              disabled
            >
              <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Continue with Github (Coming Soon)
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  required
                  disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium ripple-effect" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
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
