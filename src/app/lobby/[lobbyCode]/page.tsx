'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';
import { redirect } from "next/navigation";

export default function LobbyPage({ params }: { params: { lobbyCode: string } }) {
    const unwrappedParams = use(params);
  const { lobbyCode } = unwrappedParams;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lobby, setLobby] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Lobby: {lobbyCode}</h1>
      {/* Rest of your component */}
    </div>
  );
}