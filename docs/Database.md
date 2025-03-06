# **Database Schema Summary**

## **Tables and Descriptions**

### **1. lobbies**
- Represents an active game lobby.
- **Columns:**
  - `id` (UUID) – Unique identifier for the lobby.
  - `status` (game_status) – Represents the current state of the game.
  - `current_turn` (UUID) – The player whose turn it is.
  - `created_at` (timestamp) – Time when the lobby was created.
  - `winner_id` (UUID) – The player who won the game.

### **2. profiles**
- Stores user profile information.
- **Columns:**
  - `id` (UUID) – Unique identifier for the user.
  - `created_at` (timestamp) – Time when the profile was created.
  - `display_name` (text) – User’s display name.
  - `email` (text) – User’s email address.

### **3. game_actions**
- Stores actions taken by players during the game.
- **Columns:**
  - `id` (UUID) – Unique identifier for the action.
  - `game_id` (UUID) – Reference to the associated game.
  - `player_id` (UUID) – The player performing the action.
  - `action_type` (text) – Type of action (e.g., move, challenge, block).
  - `target_id` (UUID) – The target player (if applicable).
  - `timestamp` (timestamp) – When the action occurred.
  - `resolved` (bool) – Whether the action has been resolved.

### **4. player_state**
- Tracks each player's state within a game.
- **Columns:**
  - `id` (UUID) – Unique identifier for the player's state.
  - `profile_id` (UUID) – Reference to the user profile.
  - `game_id` (UUID) – Reference to the associated game.
  - `coins` (int) – Number of coins the player has.
  - `cards` (jsonb) – Stores the player's cards.
  - `is_ready` (bool) – Whether the player is ready to start.
  - `is_host` (bool) – Whether the player is the host.
  - `seat_number` (int) – The player's seat position in the game.
  - `eliminated` (bool) – Whether the player is eliminated.

## **Relationships**
- **`lobbies` ↔ `profiles`**  
  - The `winner_id` in `lobbies` references `profiles.id` to track the game winner.
- **`game_actions` ↔ `lobbies` & `profiles`**  
  - `game_id` links to `lobbies.id`, and `player_id` & `target_id` reference `profiles.id`.
- **`player_state` ↔ `profiles` & `lobbies`**  
  - `profile_id` references `profiles.id` to associate a player with a game.
  - `game_id` references `lobbies.id` to connect a player to a specific game session.

## **Overall Functionality**
- The **lobbies** table manages game sessions.
- The **profiles** table stores user accounts.
- The **game_actions** table logs in-game moves.
- The **player_state** table tracks player-specific data (cards, coins, status).

This schema effectively supports **real-time gameplay** for your Coup web app, ensuring that actions, players, and lobbies are correctly linked.
