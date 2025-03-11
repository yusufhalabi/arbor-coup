'use client';

import { useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';
import { Button } from "@/components/ui/button";
import { startGameAction } from "@/app/actions";
import { useLobbyState, MIN_PLAYERS } from '@/hooks/useLobbyState';
import { useLobbySubscription } from '@/hooks/useLobbySubscription';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function LobbyPage({ params }: { params: { lobbyCode: string } }) {
  // Get the lobby code from params
  const unwrappedParams = use(params);
  const lobbyCode = unwrappedParams.lobbyCode;
  const router = useRouter();
  
  // Get user context and current user ID
  const { displayName, isLoading, error, refreshUserData } = useUser();
  const { userId, isLoading: isUserLoading } = useCurrentUser();
  
  // Get lobby state using our custom hook
  const { 
    status, 
    lobby, 
    players, 
    isHost, 
    canStartGame,
    refetchLobby,
    refetchPlayers
  } = useLobbyState(lobbyCode, userId);
  
  // Set up callbacks for real-time updates
  const handleLobbyUpdate = useCallback(() => {
    refetchLobby();
  }, [refetchLobby]);
  
  const handlePlayersUpdate = useCallback(() => {
    refetchPlayers();
  }, [refetchPlayers]);
  
  // Set up real-time subscriptions
  useLobbySubscription(
    lobby?.id || null,
    handleLobbyUpdate,
    handlePlayersUpdate
  );
  
  // Handle errors
  useEffect(() => {
    if (status === 'error' && error) {
      console.error('Lobby error:', error);
      // We already handle redirects in the useLobbyState hook
    }
  }, [status, error]);
  
  // Add an effect to refresh user data if display name is missing
  useEffect(() => {
    if (!isLoading && !displayName) {
      console.log("Display name missing, refreshing user data");
      refreshUserData();
    }
  }, [isLoading, displayName, refreshUserData]);
  
  // Show loading state
  if (isUserLoading || status === 'loading') {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lobby: {lobbyCode}</h1>
      
      {/* Game status and controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">
              Status: {lobby?.status === 'waiting' ? 'Waiting for players' : 'Game in progress'}
            </h2>
            <p className="text-sm text-gray-500">
              {players.length} player{players.length !== 1 ? 's' : ''} in lobby 
              {players.length < MIN_PLAYERS && ` (need at least ${MIN_PLAYERS})`}
            </p>
          </div>
          
          {isHost && lobby?.status === 'waiting' && (
            <form action={startGameAction}>
              <input type="hidden" name="lobbyCode" value={lobbyCode} />
              <Button 
                type="submit" 
                disabled={!canStartGame}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Start Game
              </Button>
            </form>
          )}
        </div>
      </div>
      
      {/* Player list */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Players:</h2>
        <ul className="space-y-2">
          {players.map((player) => (
            <li key={player.profile_id} className="p-2 border rounded">
              {player.profiles?.display_name || 'Unknown Player'}
              {player.is_host && ' (Host)'}
              {player.is_ready && ' (Ready)'}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Game board (only shown when game is in progress) */}
      {lobby?.status === 'in_progress' && (
        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Game in Progress</h2>
          
          {/* Current turn indicator */}
          <div className="mb-4">
            <p className="font-medium">
              Current Turn: {players.find(p => p.profile_id === lobby.current_turn)?.profiles?.display_name || 'Unknown'}
            </p>
          </div>
          
          {/* Game board UI */}
          <div className="grid grid-cols-1 gap-4">
            {/* This will be expanded with your game-specific UI */}
            <p>Game board will be displayed here</p>
          </div>
        </div>
      )}
    </div>
  );
}