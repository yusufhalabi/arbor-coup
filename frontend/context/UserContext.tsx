'use client';

import { createClient } from '@/utils/supabase/client';
import { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of our context data
type UserContextType = {
  displayName: string | null;    // The user's display name from Supabase profiles
  isLoading: boolean;           // Loading state while we fetch user data
  error: string | null;         // Any error messages during data fetching
};

// Create the context with undefined as initial value
// We'll provide the actual value in our Provider component
const UserContext = createContext<UserContextType | undefined>(undefined);

// The Provider component that will wrap our app
// This makes the context available to all child components
export function UserProvider({ children }: { children: React.ReactNode }) {
  // State for managing our user data and loading/error states
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);  // Start with loading true
  const [error, setError] = useState<string | null>(null);

  // Effect runs once when component mounts to fetch user data
  useEffect(() => {
    async function loadUserData() {
      try {
        // Create Supabase client for data fetching
        const supabase = createClient();
        
        // Get the currently authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // If we have a user, fetch their profile data
          const { data: profile_data, error: profileError } = await supabase
            .from('profiles')
            .select('display_name')  // Only select the display_name field
            .eq('id', user.id)       // Where id matches our user's id
            .single();               // We expect only one result

          if (profileError) throw profileError;
          
          // Update our state with the display name
          setDisplayName(profile_data?.display_name || null);
        }
      } catch (e) {
        // Handle any errors that occurred during fetching
        setError(e instanceof Error ? e.message : 'Failed to load user data');
      } finally {
        // Whether we succeeded or failed, we're done loading
        setIsLoading(false);
      }
    }

    // Call our async function
    loadUserData();
  }, []); // Empty dependency array means this only runs once on mount

  // Provide our context values to children
  return (
    <UserContext.Provider value={{ displayName, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use our context
// This makes it easier and safer to use the context in other components
export function useUser() {
  const context = useContext(UserContext);
  
  // Throw an error if someone tries to use the context outside of the Provider
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
} 