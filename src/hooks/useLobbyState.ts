import { useReducer, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// Constants
export const MIN_PLAYERS = 3;

// Types
export interface Lobby {
  id: string;
  lobby_code: string;
  status: string;
  current_turn: string | null;
  created_at: string;
}

export interface Player {
  profile_id: string;
  game_id: string;
  is_host: boolean;
  is_ready: boolean;
  coins: number;
  cards: any[];
  is_spectator?: boolean;
  is_disconnected?: boolean;
  profiles?: {
    display_name: string;
  };
}

type LobbyState = {
  status: 'loading' | 'error' | 'ready';
  error?: string;
  lobby: Lobby | null;
  players: Player[];
  isHost: boolean;
  canStartGame: boolean;
};

type LobbyAction = 
  | { type: 'LOADING' }
  | { type: 'ERROR', error: string }
  | { type: 'SET_LOBBY', lobby: Lobby }
  | { type: 'SET_PLAYERS', players: Player[], currentUserId: string }
  | { type: 'UPDATE_PLAYER', player: Player }
  | { type: 'REMOVE_PLAYER', profileId: string };

function lobbyReducer(state: LobbyState, action: LobbyAction): LobbyState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: 'loading' };
    case 'ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'SET_LOBBY':
      return { 
        ...state, 
        status: 'ready', 
        lobby: action.lobby 
      };
    case 'SET_PLAYERS':
      return { 
        ...state, 
        players: action.players,
        isHost: action.players.some(p => p.profile_id === action.currentUserId && p.is_host),
        canStartGame: action.players.length >= MIN_PLAYERS
      };
    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map(p => 
          p.profile_id === action.player.profile_id ? action.player : p
        )
      };
    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(p => p.profile_id !== action.profileId)
      };
    default:
      return state;
  }
}

export function useLobbyState(lobbyCode: string, userId: string | null) {
  const router = useRouter();
  const [state, dispatch] = useReducer(lobbyReducer, {
    status: 'loading',
    lobby: null,
    players: [],
    isHost: false,
    canStartGame: false
  });

  // Fetch initial lobby data
  useEffect(() => {
    if (!userId) return;
    
    async function fetchLobbyData() {
      dispatch({ type: 'LOADING' });
      try {
        const supabase = createClient();
        
        // Find the lobby with this code
        const { data: lobbyData, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('lobby_code', lobbyCode)
          .single();
        
        if (lobbyError || !lobbyData) {
          console.log('Lobby not found, redirecting...');
          router.push('/lobby');
          return;
        }
        
        // Check if the current user is a player in this lobby
        const { data: playerData, error: playerError } = await supabase
          .from('player_state')
          .select('*')
          .eq('game_id', lobbyData.id)
          .eq('profile_id', userId)
          .single();
        
        if (playerError || !playerData) {
          console.log('User is not a player in this lobby, redirecting...');
          router.push('/lobby');
          return;
        }
        
        // If we get here, the user has access to this lobby
        dispatch({ type: 'SET_LOBBY', lobby: lobbyData });
        
        // Fetch all players in this lobby
        await fetchPlayers(lobbyData.id);
      } catch (error) {
        console.error('Error checking lobby access:', error);
        dispatch({ 
          type: 'ERROR', 
          error: error instanceof Error ? error.message : 'Failed to load lobby' 
        });
        router.push('/lobby');
      }
    }
    
    fetchLobbyData();
  }, [lobbyCode, userId, router]);
  
  // Function to fetch players
  const fetchPlayers = async (gameId: string) => {
    try {
      const supabase = createClient();
      const { data: allPlayers, error } = await supabase
        .from('player_state')
        .select('*, profiles(display_name)')
        .eq('game_id', gameId);
      
      if (error) throw error;
      
      if (allPlayers && userId) {
        dispatch({ 
          type: 'SET_PLAYERS', 
          players: allPlayers as Player[],
          currentUserId: userId
        });
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };
  
  // Function to refetch lobby data
  const refetchLobby = async () => {
    if (!state.lobby) return;
    
    try {
      const supabase = createClient();
      const { data: lobbyData, error } = await supabase
        .from('lobbies')
        .select('*')
        .eq('id', state.lobby.id)
        .single();
      
      if (error) throw error;
      if (lobbyData) {
        dispatch({ type: 'SET_LOBBY', lobby: lobbyData as Lobby });
      }
    } catch (error) {
      console.error('Failed to refetch lobby:', error);
    }
  };
  
  return {
    ...state,
    refetchLobby,
    refetchPlayers: () => state.lobby ? fetchPlayers(state.lobby.id) : null
  };
} 