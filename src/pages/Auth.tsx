
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaGoogle } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Info, AlertTriangle } from 'lucide-react';

// Define validation schemas
const loginSchema = z.object({
  email: z.string().email({message: "Please enter a valid email address"}),
  password: z.string().min(1, {message: "Password is required"})
});

const registerSchema = z.object({
  name: z.string().min(2, {message: "Name must be at least 2 characters"}),
  email: z.string().email({message: "Please enter a valid email address"}),
  phone: z.string().optional(),
  password: z.string().min(6, {message: "Password must be at least 6 characters"})
});

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user, loading } = useAuth();
  const { toast } = useToast();
  
  // Check URL param for default tab
  const params = new URLSearchParams(location.search);
  const defaultTab = params.get('tab') === 'register' ? 'register' : 'login';
  
  const [tab, setTab] = useState(defaultTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retrySeconds, setRetrySeconds] = useState<number | null>(null);
  
  // Initialize forms
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: ''
    }
  });

  // Countdown timer for retry
  useEffect(() => {
    let timer: number | null = null;
    
    if (retrySeconds && retrySeconds > 0) {
      timer = window.setInterval(() => {
        setRetrySeconds(prev => (prev && prev > 0) ? prev - 1 : null);
      }, 1000);
    } else if (retrySeconds === 0) {
      setRetrySeconds(null);
      setErrorMessage(null);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [retrySeconds]);
  
  // Redirect if logged in - enhanced to always check on mount and when user state changes
  useEffect(() => {
    if (user && !loading) {
      // Get the redirect URL from query params or default to home
      const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, location]);
  
  // Early return if already authenticated and not loading
  if (user && !loading) {
    return null;
  }
  
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      // Toast is shown by the auth hook, no need to duplicate it here
      // Navigation happens in the useEffect above
    } catch (error: any) {
      console.error("Error signing in:", error);
      
      // Check for rate limiting errors
      if (error.message?.includes('rate limit') || error.message?.includes('after')) {
        // Try to extract the number of seconds
        const secondsMatch = error.message.match(/after (\d+) second/);
        if (secondsMatch && secondsMatch[1]) {
          setRetrySeconds(parseInt(secondsMatch[1]));
        }
        
        setErrorMessage("Rate limit reached. Please wait before trying again.");
      } else {
        setErrorMessage(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signUp(values.email, values.password, values.name, values.phone || '');
      // Toast is shown by the auth hook, no need to duplicate it here
      // Navigation happens in the useEffect above
    } catch (error: any) {
      console.error("Error signing up:", error);
      
      // Check for rate limiting errors
      if (error.message?.includes('rate limit') || error.message?.includes('after')) {
        // Try to extract the number of seconds
        const secondsMatch = error.message.match(/after (\d+) second/);
        if (secondsMatch && secondsMatch[1]) {
          setRetrySeconds(parseInt(secondsMatch[1]));
        }
        
        setErrorMessage("For security purposes, please wait before trying again.");
      } else if (error.message?.includes('violates row-level security')) {
        setErrorMessage("Error creating user profile. Please try again later.");
      } else {
        setErrorMessage(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      // Navigation happens in the useEffect above
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setErrorMessage(error.message || "Could not sign in with Google");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-hero-gradient text-white p-6 text-center">
            <h1 className="text-2xl font-semibold">Welcome to Roti Tukkar</h1>
            <p className="opacity-90 text-sm mt-1">Sign in to manage your orders</p>
          </div>
          
          <div className="p-6">
            {errorMessage && (
              <div className="mb-6 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{errorMessage}</p>
                  {retrySeconds !== null && (
                    <p className="text-sm mt-1">Please wait {retrySeconds} seconds before trying again.</p>
                  )}
                </div>
              </div>
            )}
            
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="youremail@example.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Password</FormLabel>
                            <a href="#" className="text-xs text-rotiPurple hover:underline">
                              Forgot password?
                            </a>
                          </div>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-rotiPurple hover:bg-rotiPurple/90"
                      disabled={isSubmitting || loading || retrySeconds !== null}
                    >
                      {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting || loading}
                    >
                      <FaGoogle className="mr-2 h-4 w-4" /> Google
                    </Button>
                    
                    <div className="text-center mt-4">
                      <Button 
                        asChild 
                        variant="link" 
                        className="text-sm text-rotiOrange"
                      >
                        <Link to="/menu?guest=true">
                          Continue as Guest
                        </Link>
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="youremail@example.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(123) 456-7890" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                            />
                          </FormControl>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Info className="h-3 w-3" />
                            <span>Password must be at least 6 characters</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-rotiPurple hover:bg-rotiPurple/90"
                      disabled={isSubmitting || loading || retrySeconds !== null}
                    >
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                      {retrySeconds !== null && ` (${retrySeconds}s)`}
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting || loading}
                    >
                      <FaGoogle className="mr-2 h-4 w-4" /> Google
                    </Button>
                    
                    <div className="text-center mt-4">
                      <Button 
                        asChild 
                        variant="link" 
                        className="text-sm text-rotiOrange"
                      >
                        <Link to="/menu?guest=true">
                          Continue as Guest
                        </Link>
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Guest checkout allows you to order without creating an account, but you won't be able to track order history.
                      </p>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
