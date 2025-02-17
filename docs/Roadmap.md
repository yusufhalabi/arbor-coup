# Coup Web App Technical Roadmap

## **Frontend Requirements**

### **1. Authentication & User Profiles**
- Users can log in using Supabase authentication.
- Users can select a username (stored in the database).
- Guests can join lobbies without authentication (guest usernames are automatically generated).

### **2. Game Lobby**
- A shared lobby where all players gather before starting a game.
- Players can join the lobby via a generated lobby code.
- Display a list of all connected players in real-time.
- The host has the ability to start/restart the game with a button click.
- Players should be able to indicate they are "ready" with a status toggle.

### **3. Game UI**
- Interactive UI to manage game actions: income, foreign aid, coup, block, challenge, and counteractions.
- Real-time updates for each player's turn and the current game state.
- Display each player's remaining cards and coins.
- Chat box for communication within the game lobby and during gameplay.

### **4. User Interaction**
- Smooth, intuitive game controls.
- Visual indicators for turn order and active game state.
- UI feedback when actions like challenges and blocks occur.
- Dynamic, responsive design that works across devices.

## **Backend Requirements**

### **1. Game State Management**
- Maintain game state with turn order, cards, actions, and player information.
- Handle transitions between different game phases (e.g., start of game, player's turn, action resolution, endgame).

### **2. Real-Time Communication**
- Implement Socket.IO for real-time updates.
- Handle events for player actions, state updates, and chat messages.

### **3. Player Management**
- Track player connections and disconnections.
- Manage authenticated users and guest players.
- Assign unique IDs to each player and manage seat assignments.

### **4. Game Logic Execution**
- Enforce game rules such as action success, challenges, and card exchanges.
- Resolve conflicts in real-time, including turn-based challenges and counteractions.
- End the game when only one player remains with cards.

## **Frontend-Backend Communication**

### **Socket.IO Events**
- `connect`: Client connects to the lobby.
- `joinLobby`: Player joins the shared lobby.
- `startGame`: Host starts the game.
- `playerAction`: Players take actions (income, foreign aid, coup, etc.).
- `updateGameState`: Backend sends updated game state to all clients.
- `chatMessage`: Real-time chat messages.
- `disconnect`: Handle player disconnections and update the lobby.

### **API Endpoints (Express)**
- `POST /api/join`: Join the lobby.
- `POST /api/start`: Start the game.
- `POST /api/action`: Perform a game action.
- `GET /api/state`: Retrieve the current game state.

## **Supabase Setup**

### **1. Authentication**
- Enable email/password authentication.
- Allow anonymous guest accounts.

### **2. Database Schema**
- **users:** `id`, `username`, `email`, `auth_id`
- **games:** `id`, `status`, `created_at`, `host_id`
- **players:** `id`, `game_id`, `user_id`, `username`, `coins`, `cards`
- **actions:** `id`, `game_id`, `player_id`, `action_type`, `timestamp`
- **lobby:** `id`, `game_id`, `player_id`, `status`

### **3. Real-Time Features**
- Enable real-time subscriptions on `games`, `players`, and `actions` tables.
- Use RLS (Row Level Security) to ensure players only access their own game states.

## **Game Logic for Coup**

### **1. Game Setup**
- Assign each player 2 random role cards (Duke, Assassin, Captain, Contessa, Ambassador).
- Start each player with 2 coins.

### **2. Turn Structure**
- Players take turns clockwise.
- On a player's turn, they must take exactly one action.

### **3. Actions and Outcomes**

- **Income:** Gain 1 coin. Cannot be blocked.
- **Foreign Aid:** Gain 2 coins. Can be blocked by a Duke.
- **Coup:** Pay 7 coins to choose a player to lose a card. Mandatory if a player has 10+ coins.
- **Tax (Duke):** Gain 3 coins.
- **Assassinate (Assassin):** Pay 3 coins to target a player; can be blocked by a Contessa.
- **Steal (Captain):** Take 2 coins from another player; can be blocked by another Captain or the target.
- **Exchange (Ambassador):** Draw 2 cards from the deck, choose which to keep, and return 2 cards.

### **4. Blocking**
- Players can block certain actions based on their card roles.
- The blocking player must claim a role (e.g., Duke to block foreign aid).

### **5. Challenging**
- Any player can challenge an action or a block.
- If the challenged player has the claimed card, they reveal it, replace it with a new card, and the challenger loses a card.
- If the challenged player does not have the claimed card, they lose a card instead.

### **6. Card Elimination**
- When a player loses a card, they reveal one of their face-down cards. That card is permanently removed.
- Players with no remaining cards are eliminated.

### **7. Game End**
- The game ends when only one player has cards remaining.
- The remaining player is declared the winner.

### **8. Special Rules**
- Players with 10 or more coins must perform a Coup action on their turn.
- All interactions should resolve synchronously, ensuring clarity and fairness in action resolution.

