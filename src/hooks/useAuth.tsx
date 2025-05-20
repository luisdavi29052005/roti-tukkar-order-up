
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
            
            // Check if this is Luis's admin account or matches the special email
            const isSpecialAdmin = session.user.email === 'luisdaviferrer@gmail.com';
            
            if (userError && userError.code !== 'PGRST116') {
              console.error('Error fetching user profile:', userError);
            }
            
            // If user doesn't exist in users table or it's the special admin account
            if (!userData) {
              // For special admin account or new users
              const newUserData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || '',
                phone: session.user.user_metadata?.phone || '',
                is_staff: isSpecialAdmin // Set is_staff to true for special admin accounts
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
                // We'll continue anyway since the user is authenticated
              }
              
              // Set the user with auth data
              setUser(newUserData);
              
              // Show success toast for new users
              if (event === 'SIGNED_IN') {
                toast({
                  title: "Account created successfully",
                  description: isSpecialAdmin ? "You have been logged in as a staff member." : "Your account has been created.",
                });
              }
            } else {
              // User exists, set with data from users table
              setUser({
                id: session.user.id,
                email: session.user.email,
                name: userData.name || '',
                phone: userData.phone || '',
                is_staff: userData.is_staff || isSpecialAdmin // Ensure special accounts always have staff access
              });
              
              // If existing user is staff, show special toast
              if (userData.is_staff || isSpecialAdmin) {
                toast({
                  title: "Welcome back, staff member!",
                  description: "You have been logged in with staff privileges.",
                });
              }
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            // Set basic user data even if there was an error
            if (session && session.user) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || '',
                is_staff: session.user.email === 'luisdaviferrer@gmail.com' // Ensure special emails always have staff access
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
  }, [toast]);

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      setLoading(true);
      
      // Special handling for special admin accounts
      const isSpecialAdmin = email === 'luisdaviferrer@gmail.com';
      
      // Sign up with Supabase Auth
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
          // Try creating user with staff privileges if it's a special account
          const { error: insertError } = await supabase
            .from('users')
            .upsert([
              { 
                id: data.user.id,
                email,
                name,
                phone,
                is_staff: isSpecialAdmin // Only set to true for special admin
              }
            ], {
              onConflict: 'id',
              ignoreDuplicates: false
            });
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            // Continue anyway - user is authenticated even if this fails
          } else {
            // Successful insert, update local user state
            setUser({
              id: data.user.id,
              email,
              name,
              phone,
              is_staff: isSpecialAdmin
            });
          }
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
          // Continue anyway - the user is authenticated even if profile creation fails
        }
      }
      
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      // Login successful but we won't show a toast here
      // The auth state change listener will handle showing a toast
      
    } catch (error: any) {
      console.error('Error signing in:', error);
      // Toast is already shown above
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
