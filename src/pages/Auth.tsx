
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
import { InfoCircle } from 'lucide-react';

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
  
  // Redirect if logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  
  if (user && !loading) {
    return null;
  }
  
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
      await signUp(values.email, values.password, values.name, values.phone || '');
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Registration failed",
        description: "Please check your information and try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Login failed",
        description: "Could not sign in with Google",
        variant: "destructive",
      });
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
                      disabled={isSubmitting || loading}
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
                            <InfoCircle className="h-3 w-3" />
                            <span>Password must be at least 6 characters</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-rotiPurple hover:bg-rotiPurple/90"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
