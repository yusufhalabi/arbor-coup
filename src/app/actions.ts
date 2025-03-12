"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { profile } from "console";

export const signUpAction = async (formData: FormData) => { // this is the function that happens when we sign up 
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const input_display_name = formData.get("display_name")?.toString(); // how do I make sure this works? How is display name passed in the form? 
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  // Step 1: check to make sure email and password exist
  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }
 
  // Step 2: try to create a user 
    // how does the error handling work? TODO: review this syntax 
  const { data, error : signUpError } = await supabase.auth.signUp({ // this line is destructuring the result of this signup function 
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  // Step 3: handle what happens if we have an error. This encoded redirect utility function will redirect to a different page with a message 
  if (signUpError) {
    console.error(signUpError.code + " " + signUpError.message);
    return encodedRedirect("error", "/sign-up", signUpError.message);
  }
  
  // Step 4: Handle everything before completion 
  const user = data.user;

  if (user && input_display_name) { // check to see if we have a user and display name 

    // flow is to 1) use sql trigger to create the row then 2) this update function will update the display name 
    const {data: select_data, error: profileError} = await supabase 
      .from('profiles')
      .update({display_name: input_display_name})
      .eq('id', user.id)
      .select();

    console.log("Update query result here: ", select_data, "ERROR: ", profileError)

    if (profileError) {
      console.error("Profile Erorr", profileError.message) // log error
      return encodedRedirect("error", "/sign-up", "Couldn't create profile");
    }
  }

  // Step 5: redirect to success page / sign up page   
  return encodedRedirect(
    "success",
    "/sign-in",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  // Sign in the user
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/lobby");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/lobby/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/lobby/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/lobby/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/lobby/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/lobby/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (userId) {
      console.log(`User ${userId} is signing out, cleaning up presence...`);
      
      // Find any active lobbies the user is in
      const { data: playerData } = await supabase
        .from('player_state')
        .select('game_id')
        .eq('profile_id', userId);
      
      // If the user is in any lobbies, remove them
      if (playerData && playerData.length > 0) {
        console.log(`User ${userId} is in ${playerData.length} lobbies, cleaning up...`);
        
        for (const player of playerData) {
          const lobbyId = player.game_id;
          
          // Check if user is host
          const { data: hostData } = await supabase
            .from('player_state')
            .select('is_host')
            .eq('game_id', lobbyId)
            .eq('profile_id', userId)
            .single();
          
          const isHost = hostData?.is_host || false;
          
          // Remove the player from the game
          await supabase
            .from('player_state')
            .delete()
            .eq('game_id', lobbyId)
            .eq('profile_id', userId);
          
          console.log(`Removed user ${userId} from lobby ${lobbyId}`);
          
          // If user was host, assign a new host
          if (isHost) {
            // Get remaining players
            const { data: players } = await supabase
              .from('player_state')
              .select('profile_id')
              .eq('game_id', lobbyId)
              .is('is_disconnected', null)
              .order('created_at', { ascending: true });
            
            if (players && players.length > 0) {
              // Assign the oldest player as the new host
              const newHostId = players[0].profile_id;
              
              await supabase
                .from('player_state')
                .update({ is_host: true })
                .eq('game_id', lobbyId)
                .eq('profile_id', newHostId);
              
              console.log(`Assigned new host ${newHostId} for lobby ${lobbyId}`);
            } else {
              // No players left, mark the lobby as abandoned
              await supabase
                .from('lobbies')
                .update({ status: 'abandoned' })
                .eq('id', lobbyId);
              
              console.log(`Marked lobby ${lobbyId} as abandoned - no players left`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during sign out cleanup:', error);
    // Continue with sign out even if cleanup fails
  }
  
  // Sign out the user
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const createLobbyAction = async () => {
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect("error", "/lobby", "You must be signed in to create a lobby");
  }
  
  // Generate a unique lobby code (6 characters)
  const lobbyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Create a new game with status 'waiting'
  const gameId = crypto.randomUUID();
  
  // Insert into lobbies
  const { error: createGameError } = await supabase
    .from('lobbies')
    .insert({
      id: gameId,
      status: 'waiting',
      current_turn: null,
      lobby_code: lobbyCode
    });
    
  if (createGameError) {
    console.error("Error creating new game:", createGameError);
    return encodedRedirect("error", "/lobby", "Failed to create lobby: " + createGameError.message);
  }
  
  // Add the user as a player and make them the host
  const { error: playerError } = await supabase
    .from('player_state')
    .insert({
      game_id: gameId,
      profile_id: user.id,
      is_host: true,
      is_ready: false,
      coins: 2,
      cards: []
    });
    
  if (playerError) {
    console.error("Error adding player to game:", playerError);
    return encodedRedirect("error", "/lobby", "Failed to join as host: " + playerError.message);
  }
  
  return redirect(`/lobby/${lobbyCode}`);
};

export const joinLobbyAction = async (formData: FormData) => {
  const lobbyCode = formData.get("lobbyCode")?.toString().toUpperCase();
  const supabase = await createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect("error", "/lobby", "You must be signed in to join a lobby");
  }
  
  if (!lobbyCode) {
    return encodedRedirect("error", "/lobby", "Lobby code is required");
  }
  
  // Find the game with this lobby code
  const { data: game, error: gameError } = await supabase
    .from('lobbies')
    .select('*')
    .eq('lobby_code', lobbyCode)
    .single();

  console.log("Game state:", game);
    
  if (gameError || !game) {
    return encodedRedirect("error", "/lobby", "Invalid lobby code or lobby not found");
  }
  
  // Check if player is already in this game
  const { data: existingPlayer } = await supabase
    .from('player_state')
    .select('*')
    .eq('game_id', game.id)
    .eq('profile_id', user.id)
    .single();
    
  if (existingPlayer) {
    // Player is already in the game, no need to add them again
    return redirect(`/lobby/${lobbyCode}`);
  }
  
  // Check if the game is in progress to add as spectator
  if (game.status === 'in_progress') {
    // Add as spectator since game already started
    const { error: spectatorError } = await supabase
      .from('player_state')
      .insert({
        game_id: game.id,
        profile_id: user.id,
        is_host: false,
        is_ready: false,
        coins: 0,
        cards: [],
        is_spectator: true
      });
      
    if (spectatorError) {
      return encodedRedirect("error", "/lobby", "Failed to join as spectator");
    }
  } else {
    // Add as normal player since game hasn't started
    console.log("Adding player to game:", game.id, user.id);
    
    const { error: playerError } = await supabase
      .from('player_state')
      .insert({
        game_id: game.id,
        profile_id: user.id,
        is_host: false,
        is_ready: false,
        coins: 2,
        cards: []
      });
      
    if (playerError) {
      return encodedRedirect("error", "/lobby", "Failed to join lobby");
    }
  }
  
  return redirect(`/lobby/${lobbyCode}`);
};

export const startGameAction = async (formData: FormData) => {
  const supabase = await createClient();
  const lobbyCode = formData.get("lobbyCode")?.toString();

  if (!lobbyCode) {
    return encodedRedirect("error", "/lobby", "Lobby code is required");
  }

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect("error", "/lobby", "You must be signed in to start a game");
  }

  // Find the game with this lobby code
  const { data: game, error: gameError } = await supabase
    .from('lobbies')
    .select('*')
    .eq('lobby_code', lobbyCode)
    .single();

  if (gameError || !game) {
    return encodedRedirect("error", "/lobby", "Invalid lobby code or lobby not found");
  }

  // Check if the current user is the host
  const { data: playerData, error: playerError } = await supabase
    .from('player_state')
    .select('*')
    .eq('game_id', game.id)
    .eq('profile_id', user.id)
    .single();
    
  if (playerError || !playerData || !playerData.is_host) {
    return encodedRedirect("error", `/lobby/${lobbyCode}`, "Only the host can start the game");
  }

  // Check if the game is already in progress
  if (game.status === 'in_progress') {
    return encodedRedirect("error", `/lobby/${lobbyCode}`, "Game is already in progress");
  }
  
  // Get all players in the lobby
  const { data: players, error: playersError } = await supabase
    .from('player_state')
    .select('*')
    .eq('game_id', game.id)
    .is('is_spectator', false);
    
  if (playersError || !players || players.length === 0) {
    return encodedRedirect("error", `/lobby/${lobbyCode}`, "Failed to fetch players");
  }
  
  // Check if we have enough players
  const MIN_PLAYERS = 3; // Set your minimum player count
  if (players.length < MIN_PLAYERS) {
    return encodedRedirect("error", `/lobby/${lobbyCode}`, `Need at least ${MIN_PLAYERS} players to start`);
  }
  
  // Select a random player to go first
  const firstPlayerIndex = Math.floor(Math.random() * players.length);
  const firstPlayer = players[firstPlayerIndex];

  // Update the game status to 'in_progress' and set the current turn
  const { error: updateError } = await supabase
    .from('lobbies')
    .update({ 
      status: 'in_progress',
      current_turn: firstPlayer.profile_id
    })
    .eq('id', game.id);

  if (updateError) {
    return encodedRedirect("error", `/lobby/${lobbyCode}`, "Failed to start game");
  }

  return redirect(`/lobby/${lobbyCode}`);
};

