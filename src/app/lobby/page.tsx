'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StreetButton } from "@/components/ui/street-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLobbyAction, joinLobbyAction } from "@/app/actions";
import { useUser } from "@/context/UserContext";

// Define types for our players
interface Player {
  id: string;
  display_name: string;
  is_host: boolean;
  is_ready: boolean;
}

export default function LobbyPage() {
  const { displayName, isLoading } = useUser();
  const [lobbyCode, setLobbyCode] = useState("");
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold mb-8">Welcome to Arbor Coup, {displayName}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create a New Lobby</h2>
          <p className="mb-4 text-gray-600">
            Start a new game and invite friends to join with your unique lobby code.
          </p>
          <form action={createLobbyAction}>
            <Button type="submit" className="w-full">Create Lobby</Button>
          </form>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Join an Existing Lobby</h2>
          <p className="mb-4 text-gray-600">
            Enter a lobby code to join a friend's game.
          </p>
          <form action={joinLobbyAction} className="space-y-4">
            <div>
              <Label htmlFor="lobbyCode">Lobby Code</Label>
              <Input 
                id="lobbyCode"
                name="lobbyCode" 
                placeholder="Enter 6-character code" 
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="uppercase"
                required
              />
            </div>
            <Button type="submit" className="w-full">Join Lobby</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
