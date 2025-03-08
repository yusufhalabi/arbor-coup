'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';
import { redirect } from "next/navigation";
import { use } from 'react';

// Define types for our data
interface Lobby {
  id: string;
  lobby_code: string;
  status: string;
  current_turn: string | null;
  created_at: string;
}

interface Player {
  profile_id: string;
  game_id: string;
  is_host: boolean;
  is_ready: boolean;
  coins: number;
  cards: any[];
  is_spectator?: boolean;
  profiles?: {
    display_name: string;
  };
}

export default function LobbyPage({ params }: { params: { lobbyCode: string } }) {
  // need to use use() to unwrap the params
  const unwrappedParams = use(params);
  const { lobbyCode } = unwrappedParams;
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState(null);
  const { displayName, isLoading } = useUser();

  useEffect(() => {
    const checkLobbyAccess = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // If not authenticated, redirect to login
          router.push('/sign-in');
          return;
        }
        
        // Find the lobby with this code
        const { data: lobbyData, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('lobby_code', lobbyCode)
          .single();
        
        if (lobbyError || !lobbyData) {
          // Lobby doesn't exist, redirect to main lobby page
          console.log('Lobby not found, redirecting...');
          router.push('/lobby');
          return;
        }
        
        // Check if the current user is a player in this lobby
        const { data: playerData, error: playerError } = await supabase
          .from('player_state')
          .select('*')
          .eq('game_id', lobbyData.id)
          .eq('profile_id', user.id)
          .single();
        
        if (playerError || !playerData) {
          // User is not a player in this lobby, redirect to main lobby page
          console.log('User is not a player in this lobby, redirecting...');
          router.push('/lobby');
          return;
        }
        
        // If we get here, the user has access to this lobby
        setLobby(lobbyData as Lobby);
        
        // Fetch all players in this lobby
        const { data: allPlayers } = await supabase
          .from('player_state')
          .select('*, profiles(display_name)')
          .eq('game_id', lobbyData.id);
        
        if (allPlayers) {
          setPlayers(allPlayers as Player[]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking lobby access:', error);
        router.push('/lobby');
      }
    };
    
    if (!isLoading) {
      checkLobbyAccess();
    }
  }, [lobbyCode, router, isLoading]);
  
  if (loading || isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Lobby: {lobbyCode}</h1>
      {/* Display lobby information */}
      <div>
        <h2>Players:</h2>
        <ul>
          {players.map((player) => (
            <li key={player.profile_id}>
              {player.profiles?.display_name || 'Unknown Player'}
              {player.is_host && ' (Host)'}
              {player.is_ready && ' (Ready)'}
            </li>
          ))}
        </ul>
      </div>
      {/* Rest of your component */}
    </div>
  );
}