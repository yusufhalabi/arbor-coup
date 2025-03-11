import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useLobbySubscription(
  lobbyId: string | null,
  onLobbyUpdate: () => void,
  onPlayersUpdate: () => void
) {
  useEffect(() => {
    if (!lobbyId) return;
    
    const supabase = createClient();
    const channel = supabase
      .channel(`lobby:${lobbyId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'lobbies',
        filter: `id=eq.${lobbyId}`
      }, () => {
        console.log('Lobby updated, fetching new data');
        onLobbyUpdate();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'player_state',
        filter: `game_id=eq.${lobbyId}`
      }, () => {
        console.log('Players updated, fetching new data');
        onPlayersUpdate();
      })
      .subscribe();
    
    console.log(`Subscribed to lobby:${lobbyId}`);
    
    return () => {
      console.log(`Unsubscribing from lobby:${lobbyId}`);
      supabase.removeChannel(channel);
    };
  }, [lobbyId, onLobbyUpdate, onPlayersUpdate]);
} 