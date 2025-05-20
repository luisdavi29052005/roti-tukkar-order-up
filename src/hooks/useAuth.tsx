
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  is_staff?: boolean;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      if (session) {
        try {
          // Get user profile from our custom users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError && userError.code !== 'PGRST116') {
            console.error('Error fetching user profile:', userError);
          }
          
          // Set the user state with combined data
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: userData?.name || '',
            phone: userData?.phone || '',
            is_staff: userData?.is_staff || false
          });
        } catch (error) {
          console.error('Error processing user data:', error);
        }
      }
      
      setLoading(false);
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            // Try to get user from users table first
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            // Check if this is Luis's admin account
            const isLuisAdmin = session.user.email === 'luisdaviferrer@gmail.com';
            
            if (userError && userError.code !== 'PGRST116') {
              console.error('Error fetching user profile:', userError);
            }
            
            // If user doesn't exist in users table or it's Luis's admin account
            if (!userData) {
              // For Luis's admin account or new users
              const newUserData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || '',
                phone: session.user.user_metadata?.phone || '',
                is_staff: isLuisAdmin // Set is_staff to true only for Luis's account
              };
              
              // Try to insert the new user
              const { error: insertError } = await supabase
                .from('users')
                .upsert([newUserData], {
                  onConflict: 'id',
                  ignoreDuplicates: false
                });
              
              if (insertError) {
                console.error('Error creating user profile:', insertError);
                // Continue anyway - the user is authenticated even if profile insertion fails
              }
              
              // Set the user with auth data
              setUser(newUserData);
            } else {
              // User exists, set with data from users table
              setUser({
                id: session.user.id,
                email: session.user.email,
                name: userData.name,
                phone: userData.phone,
                is_staff: userData.is_staff || isLuisAdmin // Ensure Luis always has staff access
              });
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            // Set basic user data even if there was an error
            if (session && session.user) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || '',
                is_staff: session.user.email === 'luisdaviferrer@gmail.com' // Ensure Luis always has staff access
              });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      setLoading(true);
      
      // Special handling for Luis's admin account
      const isLuisAdmin = email === 'luisdaviferrer@gmail.com';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });
      
      if (error) {
        if (error.message?.includes('rate limit') || error.message?.includes('after')) {
          toast({
            title: "Registration rate limited",
            description: "For security purposes, please wait a minute before trying again.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive"
          });
        }
        throw error;
      }
      
      // Try to insert the user into users table, but don't block on errors
      if (data.user) {
        try {
          // Try creating user with staff privileges if it's Luis's account
          const { error: insertError } = await supabase
            .from('users')
            .upsert([
              { 
                id: data.user.id,
                email,
                name,
                phone,
                is_staff: isLuisAdmin // Only set to true for Luis
              }
            ], {
              onConflict: 'id',
              ignoreDuplicates: false
            });
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            // Continue anyway - user is authenticated even if this fails
          }
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
          // Continue anyway - the user is authenticated even if profile creation fails
        }
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
      
    } catch (error: any) {
      // Error is already handled above
      console.error('Error signing up:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error signing in with Google:', error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        signIn, 
        signInWithGoogle,
        signUp, 
        signOut, 
        loading,
        isStaff: user?.is_staff || false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
