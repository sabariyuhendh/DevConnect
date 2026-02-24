import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Code2, Eye, EyeOff, Check, Github, Chrome, Apple, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    const username = formData.username?.trim();
    if (!username) {
      setUsernameAvailable(null);
      setChecking(false);
      return;
    }

    let mounted = true;
    const controller = new AbortController();
    setChecking(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`, {
          signal: controller.signal
        });
        if (!mounted) return;
        if (!res.ok) {
          setUsernameAvailable(null);
        } else {
          const data = await res.json();
          setUsernameAvailable(Boolean(data.available));
        }
      } catch {
        if (mounted) setUsernameAvailable(null);
      } finally {
        if (mounted) setChecking(false);
      }
    }, 400);

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(id);
    };
  }, [formData.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.username?.trim()) {
      toast({
        title: "Username required",
        description: "Please choose a username.",
        variant: "destructive"
      });
      return;
    }
    if (usernameAvailable === false) {
      toast({
        title: "Username taken",
        description: "Please choose a different username.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          username: formData.username,
          password: formData.password
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw err;
      }

      const data = await res.json();

      try {
        const userObj = {
          id: data.user?.id || undefined,
          email: data.user?.email || formData.email,
          username: data.user?.username || formData.username,
          token: data.token || undefined
        };
        localStorage.setItem('dc_user', JSON.stringify(userObj));
      } catch {
        // ignore
      }

      toast({
        title: "Welcome to DevConnect!",
        description: "Your account has been created successfully.",
      });
      navigate('/feed');
    } catch (err: any) {
      toast({
        title: "Signup failed",
        description: err?.message || 'Unable to create account. Please try again later.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left Side: Artistic Background */}
      <div className="hidden lg:flex auth-background items-center justify-center p-12 order-2">
        <div className="relative z-10 text-center space-y-4">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Code2 className="h-12 w-12 text-foreground" />
            <span className="text-4xl font-bold tracking-tight">DevConnect</span>
          </Link>
          <p className="text-xl text-muted-foreground max-w-sm mx-auto">
            Join thousands of developers and start collaborating on amazing projects.
          </p>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="auth-card py-12 order-1">
        <div className="w-full max-w-[400px] mx-auto space-y-8">
          <div className="space-y-4 text-center lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground">
              Ready to start? Sign up with your favorite provider or email
            </p>
          </div>

          <div className="space-y-4">
            {/* Social Authentication */}
            <Button variant="outline" className="w-full h-12 text-base font-medium transition-all hover:bg-accent flex items-center justify-center gap-2 group">
              <Chrome className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full h-12 text-base font-medium transition-all hover:bg-accent flex items-center justify-center gap-2 group">
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
                  <Button variant="outline" className="w-full h-12 text-base font-medium transition-all hover:bg-accent flex items-center justify-center gap-2 group">
                    <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    Continue with Github
                  </Button>

                  <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="samlee.mobbin@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        placeholder="samlee"
                        value={formData.username}
                        onChange={handleChange}
                        className="h-12"
                        required
                      />
                      <div className="text-xs">
                        {checking ? "Checking..." : formData.username && (
                          usernameAvailable ? <span className="text-green-600">Available</span> : <span className="text-destructive">Taken</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={formData.password}
                          onChange={handleChange}
                          className="h-12 pr-10"
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
                      
                      {formData.password && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {passwordRequirements.map((req, idx) => (
                            <div key={idx} className={`flex items-center gap-1.5 text-[10px] ${req.met ? "text-green-600" : "text-muted-foreground"}`}>
                              <Check className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-30"}`} />
                              {req.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repeat password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="h-12 pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 rounded border-border"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                      />
                      <Label htmlFor="terms" className="text-xs leading-normal font-normal text-muted-foreground">
                        I agree to the <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>
                      </Label>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading || checking || usernameAvailable === false}>
                      {isLoading ? "Creating account..." : "Create account"}
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
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-12 text-base"
                  required
                />
                <Button type="submit" className="w-full h-12 text-base font-medium">
                  Continue
                </Button>
              </form>
            )}
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-foreground hover:underline font-semibold">
                Sign in
              </Link>
            </p>
            
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-loose">
              By creating an account you agree to our <Link to="/terms" className="underline underline-offset-2">Terms of service</Link> & <Link to="/privacy" className="underline underline-offset-2">Privacy policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
