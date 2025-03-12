import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUserId() {
      try {
        setIsLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          console.log('User not authenticated, redirecting to sign-in');
          router.push('/sign-in');
          return;
        }
        
        setUserId(data.user.id);
      } catch (error) {
        console.error('Error getting user:', error);
        router.push('/sign-in');
      } finally {
        setIsLoading(false);
      }
    }
    
    getUserId();
  }, [router]);

  return { userId, isLoading };
} 