
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaGoogle } from 'react-icons/fa';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user, loading } = useAuth();
  
  // Check URL param for default tab
  const params = new URLSearchParams(location.search);
  const defaultTab = params.get('tab') === 'register' ? 'register' : 'login';
  
  const [tab, setTab] = useState(defaultTab);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState(''); // Fixed: changed from setRegisterEmail to setRegisterPassword
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if logged in
  if (user && !loading) {
    navigate('/');
    return null;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signUp(registerEmail, registerPassword, name, phone);
    setIsSubmitting(false);
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
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="youremail@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-rotiPurple hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  
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
                    onClick={signInWithGoogle}
                    disabled={isSubmitting || loading}
                  >
                    <FaGoogle className="mr-2 h-4 w-4" /> Google
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button 
                      asChild 
                      variant="link" 
                      className="text-sm text-rotiOrange"
                      onClick={() => navigate('/menu?guest=true')}
                    >
                      <Link to="/menu?guest=true">
                        Continue as Guest
                      </Link>
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="youremail@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(123) 456-7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
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
                    onClick={signInWithGoogle}
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
